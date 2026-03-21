import type { GetServerSideProps } from 'next'
import { siteConfig } from '@site-config'

function Robots() {
  return null
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = siteConfig.siteUrl

  const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`

  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate')
  res.write(robots)
  res.end()

  return { props: {} }
}

export default Robots
