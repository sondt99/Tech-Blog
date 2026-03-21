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

  const urls: { loc: string; lastmod?: string }[] = []

  urls.push({ loc: baseUrl })

  for (const post of posts) {
    urls.push({
      loc: `${baseUrl}/posts/${post.slug}`,
      lastmod: post.date || undefined,
    })
  }

  for (const page of pages) {
    urls.push({ loc: `${baseUrl}/${page.slug}` })
  }

  for (const tag of tagSet) {
    urls.push({ loc: `${baseUrl}/tags/${encodeURIComponent(tag)}` })
  }

  for (let i = 2; i <= totalPages; i++) {
    urls.push({ loc: `${baseUrl}/page/${i}` })
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}
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
