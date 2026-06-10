import {
  normalizeTags,
  stripMarkdown,
  calculatePostStats,
  parseDateToTimestamp,
} from '../post-utils'

describe('normalizeTags', () => {
  it('returns empty array for non-array non-string', () => {
    expect(normalizeTags(null)).toEqual([])
    expect(normalizeTags(undefined)).toEqual([])
    expect(normalizeTags(42)).toEqual([])
    expect(normalizeTags({})).toEqual([])
  })

  it('normalizes an array of strings and deduplicates', () => {
    expect(normalizeTags(['js', 'ts', 'js'])).toEqual(['js', 'ts'])
    expect(normalizeTags(['  react  ', '', ' vue'])).toEqual(['react', 'vue'])
  })

  it('normalizes a comma-separated string', () => {
    expect(normalizeTags('js, ts, react')).toEqual(['js', 'ts', 'react'])
    expect(normalizeTags('go,rust,go')).toEqual(['go', 'rust'])
  })

  it('handles empty string', () => {
    expect(normalizeTags('')).toEqual([])
    expect(normalizeTags('   ')).toEqual([])
  })
})

describe('stripMarkdown', () => {
  it('removes fenced code blocks', () => {
    const input = 'hello\n```js\nconst x = 1\n```\nworld'
    expect(stripMarkdown(input)).not.toContain('const x')
    expect(stripMarkdown(input)).toContain('hello')
    expect(stripMarkdown(input)).toContain('world')
  })

  it('removes inline code', () => {
    const result = stripMarkdown('use `console.log` here')
    expect(result).not.toContain('console.log')
    expect(result).toContain('use')
    expect(result).toContain('here')
  })

  it('removes images', () => {
    const result = stripMarkdown('text ![alt](http://img.png) more')
    expect(result).not.toContain('http://img.png')
    expect(result).toContain('text')
  })

  it('preserves link text', () => {
    const result = stripMarkdown('[click here](http://example.com)')
    expect(result).toContain('click here')
    expect(result).not.toContain('http://example.com')
  })

  it('removes heading markers', () => {
    const result = stripMarkdown('## My Heading\nsome text')
    expect(result).toContain('My Heading')
    expect(result).not.toContain('##')
  })

  it('removes bold/italic markers', () => {
    const result = stripMarkdown('**bold** and _italic_')
    expect(result).toContain('bold')
    expect(result).toContain('italic')
    expect(result).not.toContain('**')
  })
})

describe('calculatePostStats', () => {
  it('returns zero stats for empty content', () => {
    const stats = calculatePostStats('')
    expect(stats.wordCount).toBe(0)
    expect(stats.readingTimeMinutes).toBe(0)
    expect(stats.headingCount).toBe(0)
    expect(stats.codeBlockCount).toBe(0)
    expect(stats.imageCount).toBe(0)
  })

  it('counts words correctly (strips markdown)', () => {
    const content = 'hello world foo bar'
    const stats = calculatePostStats(content)
    expect(stats.wordCount).toBe(4)
  })

  it('counts headings', () => {
    const content = '## Heading 1\n### Heading 2\n# Heading 3\nsome text'
    const stats = calculatePostStats(content)
    expect(stats.headingCount).toBe(3)
  })

  it('counts code blocks', () => {
    const content = '```js\ncode\n```\n\n```python\nmore code\n```'
    const stats = calculatePostStats(content)
    expect(stats.codeBlockCount).toBe(2)
  })

  it('counts images', () => {
    const content = '![img1](a.png) text ![img2](b.png)'
    const stats = calculatePostStats(content)
    expect(stats.imageCount).toBe(2)
  })

  it('reading time is at least 1 minute for non-empty content', () => {
    const content = 'word '.repeat(10)
    const stats = calculatePostStats(content)
    expect(stats.readingTimeMinutes).toBeGreaterThanOrEqual(1)
  })

  it('reading time scales with word count', () => {
    const short = calculatePostStats('word '.repeat(100))
    const long = calculatePostStats('word '.repeat(1000))
    expect(long.readingTimeMinutes).toBeGreaterThan(short.readingTimeMinutes)
  })
})

describe('parseDateToTimestamp', () => {
  it('returns NEGATIVE_INFINITY for non-string values', () => {
    expect(parseDateToTimestamp(null)).toBe(Number.NEGATIVE_INFINITY)
    expect(parseDateToTimestamp(undefined)).toBe(Number.NEGATIVE_INFINITY)
    expect(parseDateToTimestamp(42)).toBe(Number.NEGATIVE_INFINITY)
    expect(parseDateToTimestamp({})).toBe(Number.NEGATIVE_INFINITY)
  })

  it('parses YYYY-MM-DD date strings', () => {
    const ts = parseDateToTimestamp('2024-01-15')
    expect(ts).toBeGreaterThan(0)
    expect(typeof ts).toBe('number')
  })

  it('parses ISO date strings', () => {
    const ts = parseDateToTimestamp('2024-01-15T10:00:00Z')
    expect(ts).toBeGreaterThan(0)
  })

  it('returns NEGATIVE_INFINITY for invalid dates', () => {
    expect(parseDateToTimestamp('not-a-date')).toBe(Number.NEGATIVE_INFINITY)
  })

  it('sorts correctly: later date has higher timestamp', () => {
    const older = parseDateToTimestamp('2023-01-01')
    const newer = parseDateToTimestamp('2024-01-01')
    expect(newer).toBeGreaterThan(older)
  })
})
