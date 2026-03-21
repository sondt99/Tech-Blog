const fs = require('fs')
const path = require('path')

const POSTS_PER_PAGE = 4

const siteUrl = process.env.SITE_URL || 'https://yourdomain.com'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/' }],
  },
  exclude: ['/api/*', '/404'],
  additionalPaths: async (config) => {
    const contentDir = path.join(process.cwd(), 'content')
    const posts = fs.readdirSync(contentDir).filter((f) => {
      const full = path.join(contentDir, f)
      return f.endsWith('.md') && !fs.statSync(full).isDirectory()
    })
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)

    const paths = []
    for (let i = 2; i <= totalPages; i++) {
      paths.push(await config.transform(config, `/page/${i}`))
    }
    return paths
  },
}
