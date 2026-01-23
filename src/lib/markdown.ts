import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { resolveContentAssetUrl } from '@/lib/content-assets'

const postsDirectory = path.join(process.cwd(), 'content')
const pagesDirectory = path.join(process.cwd(), 'content', 'pages')

type PostStats = {
  wordCount: number
  readingTimeMinutes: number
  headingCount: number
  codeBlockCount: number
  imageCount: number
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
    
    return {
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      featured: resolveContentAssetUrl(data.featured || null),
      tags: normalizeTags(data.tags),
      stats: calculatePostStats(content),
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
    
    return {
      slug,
      title: data.title,
      lastUpdated: data.lastUpdated,
      content
    }
  } catch (error) {
    return null
  }
}
