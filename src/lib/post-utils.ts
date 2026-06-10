export type PostStats = {
  wordCount: number
  readingTimeMinutes: number
  headingCount: number
  codeBlockCount: number
  imageCount: number
}

export const normalizeTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    const tags = value
      .map((tag) => String(tag).trim())
      .filter((tag) => tag.length > 0)
    return Array.from(new Set(tags))
  }

  if (typeof value === 'string') {
    const tags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    return Array.from(new Set(tags))
  }

  return []
}

export const parseDateToTimestamp = (value: unknown): number => {
  if (typeof value !== 'string') return Number.NEGATIVE_INFINITY

  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch
    const parsed = new Date(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10) - 1,
      Number.parseInt(day, 10)
    )
    return Number.isNaN(parsed.getTime()) ? Number.NEGATIVE_INFINITY : parsed.getTime()
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? Number.NEGATIVE_INFINITY : parsed.getTime()
}

const countMatches = (value: string, regex: RegExp): number => {
  const matches = value.match(regex)
  return matches ? matches.length : 0
}

export const stripMarkdown = (value: string): string => {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, ' ')
    .replace(/^>\s+/gm, ' ')
    .replace(/^\s*[-+*]\s+/gm, ' ')
    .replace(/^\s*\d+\.\s+/gm, ' ')
    .replace(/[*_~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const calculatePostStats = (content: string): PostStats => {
  const codeBlockMatches = content.match(/```[\s\S]*?```/g) ?? []
  const codeBlockCount = codeBlockMatches.length
  const codeWordCount = codeBlockMatches.reduce((sum, block) => {
    const inner = block.replace(/^```[^\n]*\n?/, '').replace(/```$/, '').trim()
    return sum + (inner ? inner.split(/\s+/).length : 0)
  }, 0)

  const text = stripMarkdown(content)
  const wordCount = text ? text.split(/\s+/).length : 0

  const proseMinutes = wordCount / 200
  const codeMinutes = codeWordCount / 50
  const readingTimeMinutes =
    wordCount === 0 && codeWordCount === 0
      ? 0
      : Math.max(1, Math.ceil(proseMinutes + codeMinutes))

  const headingCount = countMatches(content, /^#{1,6}\s+/gm)
  const imageCount = countMatches(content, /!\[[^\]]*]\([^)]*\)/g)

  return {
    wordCount,
    readingTimeMinutes,
    headingCount,
    codeBlockCount,
    imageCount,
  }
}
