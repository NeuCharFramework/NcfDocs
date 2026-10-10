import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import markdownItCjkFriendly from 'markdown-it-cjk-friendly'
import { createMarkdown } from 'vuepress/markdown'

const markdown = () => createMarkdown().use(markdownItCjkFriendly)

test('Chinese strong emphasis supports full-width parentheses beside text', () => {
  assert.equal(
    markdown().renderInline(
      '**监督微调（SFT）**通过输入/答案样本学习期望响应。',
    ),
    '<strong>监督微调（SFT）</strong>通过输入/答案样本学习期望响应。',
  )
})

test('Chinese strong emphasis preserves inline code inside parentheses', () => {
  assert.match(
    markdown().renderInline('**Rank（`r`，秩）**决定 adapter 的低秩维度。'),
    /^<strong>Rank（<code(?: v-pre)?>r<\/code>，秩）<\/strong>决定 adapter 的低秩维度。$/,
  )
})

test('Chinese punctuation and adjacent emphasis render without added spaces', () => {
  for (const [source, expected] of [
    ['使用**中文（说明）**继续', '使用<strong>中文（说明）</strong>继续'],
    ['**“说明”**与正文相邻', '<strong>“说明”</strong>与正文相邻'],
    ['**训练**与**验证**', '<strong>训练</strong>与<strong>验证</strong>'],
    ['这是*中文（说明）*测试', '这是<em>中文（说明）</em>测试'],
  ]) {
    assert.equal(markdown().renderInline(source), expected)
  }
})

test('English emphasis, escaping, links and code retain existing rendering', () => {
  for (const source of [
    '**Supervised fine-tuning (SFT)** learns desired responses.',
    '**Rank (`r`)** determines capacity.',
    'foo**bar**baz and foo_bar_baz',
    '***nested emphasis*** and **bold with *italic* text**',
    '\\*\\*literal\\*\\* and `**literal code**`',
    '[**bold link**](https://example.com) and <strong>HTML</strong>',
    '```text\n**literal fenced code**\n```',
  ]) {
    assert.equal(markdown().render(source), createMarkdown().render(source))
  }
})

test('the English fine-tuning tutorial retains its complete rendered HTML', () => {
  const source = readFileSync(
    new URL(
      '../docs/NcfPackageSources/xncf/aikernel-local-fine-tuning.md',
      import.meta.url,
    ),
    'utf8',
  )
  assert.equal(markdown().render(source), createMarkdown().render(source))
})

test('the Chinese fine-tuning tutorial renders both reported examples as strong', () => {
  const source = readFileSync(
    new URL(
      '../docs/zh/NcfPackageSources/xncf/aikernel-local-fine-tuning.md',
      import.meta.url,
    ),
    'utf8',
  )
  const html = markdown().render(source)
  assert.ok(html.includes('<strong>监督微调（SFT）</strong>通过'))
  assert.match(
    html,
    /<strong>Rank（<code(?: v-pre)?>r<\/code>，秩）<\/strong>决定/,
  )
  assert.ok(!html.includes('**监督微调'))
  assert.ok(!html.includes('**Rank'))
})
