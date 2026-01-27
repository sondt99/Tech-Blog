import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { resolveContentAssetUrl } from '@/lib/content-assets'
import type { TimelineEntry } from '@/types/timeline'
import type { TocItem } from '@/types/toc'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
import remarkEmoji from 'remark-emoji'
import rehypeContentAssets from '@/lib/rehype-content-assets'
import rehypePrism from '@/lib/rehype-prism'
import type { Plugin } from 'unified'
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from 'rehype-sanitize'

const postsDirectory = path.join(process.cwd(), 'content')
const pagesDirectory = path.join(process.cwd(), 'content', 'pages')

type PostStats = {
  wordCount: number
  readingTimeMinutes: number
  headingCount: number
  codeBlockCount: number
  imageCount: number
}

type Node = {
  type?: string
  tagName?: string
  properties?: Record<string, unknown>
  children?: Node[]
  value?: string
}

const normalizeTags = (value: unknown): string[] => {
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

const normalizeTimelineEntries = (value: unknown): TimelineEntry[] => {
  if (!Array.isArray(value)) return []

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const raw = entry as Record<string, unknown>
      const year =
        typeof raw.year === 'number' || typeof raw.year === 'string'
          ? String(raw.year).trim()
          : ''
      const place = typeof raw.place === 'string' ? raw.place.trim() : ''
      const role = typeof raw.role === 'string' ? raw.role.trim() : ''
      const category = typeof raw.category === 'string' ? raw.category.trim() : ''
      const detail = typeof raw.detail === 'string' ? raw.detail.trim() : ''

      if (!year || !place) return null

      const normalized: TimelineEntry = {
        year,
        place
      }

      if (role) normalized.role = role
      if (category) normalized.category = category
      if (detail) normalized.detail = detail

      return normalized
    })
    .filter((entry): entry is TimelineEntry => Boolean(entry))
}

const countMatches = (value: string, regex: RegExp): number => {
  const matches = value.match(regex)
  return matches ? matches.length : 0
}

const stripMarkdown = (value: string): string => {
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

const calculatePostStats = (content: string): PostStats => {
  const text = stripMarkdown(content)
  const wordCount = text ? text.split(/\s+/).length : 0
  const readingTimeMinutes = wordCount === 0 ? 0 : Math.max(1, Math.ceil(wordCount / 200))
  const headingCount = countMatches(content, /^#{1,6}\s+/gm)
  const codeBlockCount = countMatches(content, /```[\s\S]*?```/g)
  const imageCount = countMatches(content, /!\[[^\]]*]\([^)]*\)/g)

  return {
    wordCount,
    readingTimeMinutes,
    headingCount,
    codeBlockCount,
    imageCount
  }
}

const getText = (node: Node): string => {
  if (node.type === 'text') {
    return node.value ?? ''
  }
  if (!Array.isArray(node.children)) return ''
  return node.children.map(getText).join('')
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')

const HEADING_TAGS = new Set(['h2', 'h3', 'h4'])

const rehypeSlugAndCollectHeadings: Plugin<[TocItem[]]> = (headings) => {
  return (tree) => {
    const root = tree as unknown as Node
    const slugCounts = new Map<string, number>()

    const visit = (node: Node) => {
      if (node.type === 'element' && node.tagName && HEADING_TAGS.has(node.tagName)) {
        const level = Number.parseInt(node.tagName.slice(1), 10)
        if (Number.isFinite(level)) {
          const text = getText(node).trim()
          const existingId = node.properties?.id
          const rawId = typeof existingId === 'string' ? existingId : slugify(text) || 'section'
          const count = (slugCounts.get(rawId) || 0) + 1
          slugCounts.set(rawId, count)
          const id = count === 1 ? rawId : `${rawId}-${count}`

          node.properties = {
            ...(node.properties ?? {}),
            id
          }

          headings.push({
            id,
            text,
            level
          })
        }
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(visit)
      }
    }

    visit(root)
  }
}

type RenderMarkdownResult = {
  html: string
  headings: TocItem[]
}

const sanitizeSchema: SanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'figure', 'figcaption'],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className'],
    img: [...(defaultSchema.attributes?.img ?? []), 'title']
  }
}

const renderMarkdown = (content: string): RenderMarkdownResult => {
  const headings: TocItem[] = []
  const html = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkEmoji)
    .use(remarkRehype)
    .use(rehypeSlugAndCollectHeadings, headings)
    .use(rehypeContentAssets)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeKatex)
    .use(rehypePrism)
    .use(rehypeStringify)
    .processSync(content)
    .toString()

  return { html, headings }
}

export function getAllPosts() {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
    .filter(fileName => {
      return fileName.endsWith('.md') && !fs.statSync(path.join(postsDirectory, fileName)).isDirectory()
    })
    .map((fileName) => {
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      
      return {
        slug: fileName.replace(/\.md$/, ''),
        title: data.title,
        date: data.date,
        excerpt: data.excerpt,
        featured: resolveContentAssetUrl(data.featured || null),
        tags: normalizeTags(data.tags),
        content
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPostBySlug(slug: string) {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    const rendered = renderMarkdown(content)
    
    return {
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      featured: resolveContentAssetUrl(data.featured || null),
      tags: normalizeTags(data.tags),
      stats: calculatePostStats(content),
      html: rendered.html,
      headings: rendered.headings,
      content
    }
  } catch (error) {
    return null
  }
}

export function getAllPages() {
  try {
    const fileNames = fs.readdirSync(pagesDirectory)
    return fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map(fileName => ({
        slug: fileName.replace(/\.md$/, '')
      }))
  } catch (error) {
    return []
  }
}


export function getPage(slug: string) {
  try {
    const fullPath = path.join(pagesDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    const rendered = renderMarkdown(content)
    
    return {
      slug,
      title: data.title,
      lastUpdated: data.lastUpdated ? String(data.lastUpdated) : null,
      timeline: normalizeTimelineEntries(data.timeline),
      html: rendered.html,
      content
    }
  } catch (error) {
    return null
  }
}
