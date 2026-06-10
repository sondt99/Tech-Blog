import type { GetServerSideProps } from 'next'
import { getAllPosts, getPostBySlug } from '@/lib/markdown'
import { siteConfig } from '@site-config'

function Feed() {
  return null
}

const getHeaderValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value

const getRequestOrigin = (req: Parameters<GetServerSideProps>[0]['req']) => {
  const forwardedProto = getHeaderValue(req.headers['x-forwarded-proto'])?.split(',')[0]?.trim()
  const forwardedHost = getHeaderValue(req.headers['x-forwarded-host'])?.split(',')[0]?.trim()
  const host = forwardedHost || getHeaderValue(req.headers.host) || new URL(siteConfig.siteUrl).host
  const protocol = forwardedProto || (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')

  return `${protocol}://${host}`
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const toAbsoluteUrl = (origin: string, pathOrUrl: string) => new URL(pathOrUrl, origin).toString()

const formatRssDate = (value: string | null | undefined) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toUTCString()
}

const createRssFeed = (origin: string) => {
  const siteUrl = toAbsoluteUrl(origin, '/')
  const feedUrl = toAbsoluteUrl(origin, '/feed.xml')
  const posts = getAllPosts()
  const lastBuildDate = posts.map((post) => formatRssDate(post.date)).find(Boolean) || new Date().toUTCString()

  const items = posts
    .map((post) => {
      const postUrl = toAbsoluteUrl(origin, `/posts/${post.slug}`)
      const pubDate = formatRssDate(post.date)
      const description = post.excerpt || siteConfig.metaDescription
      const full = getPostBySlug(post.slug)
      const htmlContent = full?.html ?? ''

      return `    <item>
      <title>${escapeXml(post.title || post.slug)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>${pubDate ? `\n      <pubDate>${escapeXml(pubDate)}</pubDate>` : ''}
      <description>${escapeXml(description)}</description>
      <content:encoded><![CDATA[${htmlContent}]]></content:encoded>
      <author>${escapeXml(siteConfig.author.name)}</author>${post.tags.map((tag) => `\n      <category>${escapeXml(tag)}</category>`).join('')}
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(siteConfig.metaDescription)}</description>
    <language>en</language>
    <lastBuildDate>${escapeXml(lastBuildDate)}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const feed = createRssFeed(getRequestOrigin(req))

  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.write(feed)
  res.end()

  return { props: {} }
}

export default Feed
