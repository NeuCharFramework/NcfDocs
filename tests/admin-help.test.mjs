import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { createMarkdown } from 'vuepress/markdown'

const docs = fileURLToPath(new URL('../docs/', import.meta.url))
const guides = ['', 'zh/'].map((locale) =>
  resolve(docs, locale, 'NcfPackageSources/xncf/admin-operations.md'),
)
const memoryGuides = ['', 'zh/'].map((locale) =>
  resolve(docs, locale, 'NcfPackageSources/xncf/adminchat-memory.md'),
)
const topicalNames = [
  'admin-logs',
  'adminchat',
  'neubell-webhooks',
  'neuchar-pivot',
  'mcp-manager',
  'aikernel-admin',
  'knowledge-base',
  'prompt-range',
  'skills',
  'file-manager',
  'agents-manager',
  'dynamic-data',
  'senmapic',
  'weixin-manager',
  'weixin-bot',
]
const topicalGuides = topicalNames.flatMap((name) =>
  ['', 'zh/'].map((locale) =>
    resolve(docs, locale, 'NcfPackageSources/xncf', name + '.md'),
  ),
)

test('contextual help anchors are unique and identical in both languages', () => {
  const anchors = guides.map((file) => {
    const html = createMarkdown().render(readFileSync(file, 'utf8'))
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
    assert.equal(new Set(ids).size, ids.length, `Duplicate id in ${file}`)
    return ids.filter((id) => id.startsWith('help-')).sort()
  })
  assert.ok(anchors[0].length > 40)
  assert.deepEqual(anchors[0], anchors[1])
})

test('operational guide links resolve locally and preserve documentation locale', () => {
  for (const file of [...guides, ...memoryGuides, ...topicalGuides]) {
    const source = readFileSync(file, 'utf8')
    for (const [, href] of source.matchAll(/\]\(([^)]+)\)/g)) {
      const [document, anchor] = href.split('#')
      const target = document.startsWith('/')
        ? resolve(docs, '.' + document.replace(/\.html$/, '.md'))
        : resolve(dirname(file), document.replace(/\.html$/, '.md'))
      assert.ok(existsSync(target), `Missing document: ${target}`)
      assert.equal(target.includes('/docs/zh/'), file.includes('/docs/zh/'))
      if (anchor) {
        const html = createMarkdown().render(readFileSync(target, 'utf8'))
        const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(
          (match) => match[1],
        )
        assert.equal(
          ids.filter((id) => id === decodeURIComponent(anchor)).length,
          1,
          `Missing or duplicate linked anchor: ${href}`,
        )
      }
    }
  }
})

test('topical guides have bilingual anchors and sidebar entries, not redirects to the directory', () => {
  for (const name of topicalNames) {
    const anchors = []
    for (const locale of ['', 'zh/']) {
      const file = resolve(docs, locale, 'NcfPackageSources/xncf', name + '.md')
      const source = readFileSync(file, 'utf8')
      assert.doesNotMatch(source, /admin-operations\.(?:md|html)#/)
      const html = createMarkdown().render(source)
      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
      assert.equal(new Set(ids).size, ids.length, file)
      anchors.push(ids.filter((id) => id.startsWith('help-')).sort())
      const sidebar = readFileSync(
        resolve(docs, '.vuepress/configs/sidebar', locale ? 'zh.ts' : 'en.ts'),
        'utf8',
      )
      assert.ok(
        sidebar.includes(`'/${locale}NcfPackageSources/xncf/${name}'`),
        name,
      )
    }
    assert.ok(anchors[0].length > 0, name)
    assert.deepEqual(anchors[0], anchors[1], name)
  }
})

test('old overview chapters preserve their anchors and link directly to the moved content', () => {
  for (const file of guides) {
    const source = readFileSync(file, 'utf8')
    const migrations = [
      ...source.matchAll(
        /<a id="(help-[^"]+)"><\/a>\s*\n## [^\n]+\n\n(?:说明已迁移至|Instructions moved to )\[[^\]]+\]\(([^)]+)\)/g,
      ),
    ]
    assert.equal(migrations.length, 58)
    for (const [, anchor, href] of migrations) {
      const [document, fragment] = href.split('#')
      assert.equal(fragment, anchor)
      assert.ok(!document.includes('admin-operations'))
      const target = readFileSync(resolve(dirname(file), document), 'utf8')
      const section = target.split(`<a id="${anchor}"></a>`)[1]
      assert.ok(section, href)
      assert.doesNotMatch(
        section.split(/<a id="help-/)[0],
        /说明已迁移至|Instructions moved to /,
      )
    }
  }
})

test('dedicated help guides retain the same explicit anchors in both languages', () => {
  for (const [document, anchors] of [
    ['start/start-develop/admin-login.md', ['help-admin-login']],
    [
      'start/start-develop/admin-module-manage.md',
      ['help-module-manage', 'help-module-publish'],
    ],
    ['NcfPackageSources/xncf/sandbox-environment.md', ['help-sandbox-setup']],
    [
      'NcfPackageSources/xncf/agents-manager-3d-status.md',
      ['help-agents-status'],
    ],
  ]) {
    for (const locale of ['', 'zh/']) {
      const html = createMarkdown().render(
        readFileSync(resolve(docs, locale, document), 'utf8'),
      )
      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
      assert.equal(ids.length, new Set(ids).size)
      for (const anchor of anchors)
        assert.equal(ids.filter((id) => id === anchor).length, 1)
    }
  }
})

test('Memory guides expose matching unique chapter anchors and navigation links', () => {
  const expected = [
    'start',
    'modes',
    'scopes',
    'entries',
    'loaded',
    'markdown',
    'system',
    'deployment',
  ]
    .map((section) => 'help-memory-' + section)
    .sort()
  for (const [index, file] of memoryGuides.entries()) {
    const html = createMarkdown().render(readFileSync(file, 'utf8'))
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
    assert.equal(new Set(ids).size, ids.length, `Duplicate id in ${file}`)
    assert.deepEqual(
      ids.filter((id) => id.startsWith('help-')).sort(),
      expected,
    )
    for (const name of [
      'admin-operations.md',
      'adminchat.md',
      'workspace-adminchat.md',
    ]) {
      assert.ok(
        readFileSync(resolve(dirname(file), name), 'utf8').includes(
          '](./adminchat-memory.md)',
        ),
      )
    }
    const locale = index === 0 ? 'en' : 'zh'
    const sidebar = readFileSync(
      resolve(docs, '.vuepress/configs/sidebar', locale + '.ts'),
      'utf8',
    )
    assert.ok(
      sidebar.includes(
        `'/${index === 0 ? '' : 'zh/'}NcfPackageSources/xncf/adminchat-memory'`,
      ),
    )
  }
})
