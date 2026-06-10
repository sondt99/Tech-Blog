import type { GetServerSideProps } from 'next'
import { siteConfig } from '@site-config'
import { getAllPosts, getAllPages } from '@/lib/markdown'
import { POSTS_PER_PAGE } from './index'

function Sitemap() {
  return null
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = siteConfig.siteUrl

  const posts = getAllPosts()
  const pages = getAllPages()

  const tagSet = new Set<string>()
  posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)))

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)

  type SitemapUrl = { loc: string; lastmod?: string; changefreq: string; priority: string }
  const urls: SitemapUrl[] = []

  urls.push({ loc: baseUrl, changefreq: 'daily', priority: '1.0' })

  for (const post of posts) {
    urls.push({
      loc: `${baseUrl}/posts/${post.slug}`,
      lastmod: post.date || undefined,
      changefreq: 'monthly',
      priority: '0.8',
    })
  }

  for (const page of pages) {
    urls.push({ loc: `${baseUrl}/${page.slug}`, changefreq: 'monthly', priority: '0.7' })
  }

  for (const tag of tagSet) {
    urls.push({ loc: `${baseUrl}/tags/${encodeURIComponent(tag)}`, changefreq: 'weekly', priority: '0.6' })
  }

  for (let i = 2; i <= totalPages; i++) {
    urls.push({ loc: `${baseUrl}/page/${i}`, changefreq: 'daily', priority: '0.5' })
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate')
  res.write(sitemap)
  res.end()

  return { props: {} }
}

export default Sitemap
