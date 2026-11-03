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
  for (const file of [...guides, ...memoryGuides]) {
    const source = readFileSync(file, 'utf8')
    for (const [, href] of source.matchAll(/\]\(([^)]+)\)/g)) {
      assert.ok(
        !href.includes('#'),
        'Add an anchor check before introducing chapter links',
      )
      const target = href.startsWith('/')
        ? resolve(docs, '.' + href.replace(/\.html$/, '.md'))
        : resolve(dirname(file), href)
      assert.ok(existsSync(target), `Missing document: ${target}`)
      assert.equal(target.includes('/docs/zh/'), file.includes('/docs/zh/'))
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
    for (const name of ['admin-operations.md', 'workspace-adminchat.md']) {
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
