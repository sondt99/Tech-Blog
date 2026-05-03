import { getAllPosts, getPostBySlug } from '@/lib/markdown'
import Layout, { type JsonLdObject } from '@/layouts/Layout'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import TableOfContents from '@/components/TableOfContents'
import TagList from '@/components/TagList'
import { siteConfig } from '@site-config'
import type { TocItem } from '@/types/toc'

interface PostProps {
  post: {
    slug: string
    title: string
    date: string | null
    excerpt: string | null
    featured: string | null
    tags: string[]
    html: string
    headings: TocItem[]
    stats: {
      wordCount: number
      readingTimeMinutes: number
      headingCount: number
      codeBlockCount: number
      imageCount: number
    }
  }
}

const parseDateValue = (value: string): Date | null => {
  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch
    const parsed = new Date(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10) - 1,
      Number.parseInt(day, 10)
    )
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDate = (
  value: string | null | undefined,
  locale: string,
  options?: Intl.DateTimeFormatOptions
) => {
  if (!value) return null
  const parsed = parseDateValue(value)
  if (!parsed) return null
  return parsed.toLocaleDateString(locale, options)
}

const toAbsoluteUrl = (pathOrUrl: string) => new URL(pathOrUrl, siteConfig.siteUrl).toString()

const createPostJsonLd = (post: PostProps['post']): JsonLdObject[] => {
  const postUrl = toAbsoluteUrl(`/posts/${post.slug}`)
  const imageUrl = post.featured ? toAbsoluteUrl(post.featured) : null

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt || siteConfig.metaDescription,
      datePublished: post.date,
      author: {
        '@type': 'Person',
        name: siteConfig.author.name,
        url: siteConfig.footer.social.githubUrl,
      },
      publisher: {
        '@type': 'Person',
        name: siteConfig.author.name,
        url: siteConfig.footer.social.githubUrl,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': postUrl,
      },
      url: postUrl,
      ...(imageUrl ? { image: imageUrl } : {}),
      ...(post.tags.length > 0 ? { keywords: post.tags } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteConfig.siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: post.title,
          item: postUrl,
        },
      ],
    },
  ]
}

export default function Post({ post }: PostProps) {
  const headings = post.headings
  const contentRef = useRef<HTMLDivElement>(null)
  const formattedDate = formatDate(
    post.date,
    siteConfig.formatting.dateLocale,
    siteConfig.formatting.dateOptions
  )

  const copyToClipboard = async (text: string, buttonElement: HTMLButtonElement) => {
    try {
      await navigator.clipboard.writeText(text)
      buttonElement.textContent = siteConfig.post.copyButtonCopiedLabel
      setTimeout(() => {
        buttonElement.textContent = siteConfig.post.copyButtonLabel
      }, 2000)
    } catch (err) {
      console.error(`${siteConfig.post.copyErrorLabel}:`, err)
    }
  }

  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    const codeBlocks = container.querySelectorAll('pre')
    codeBlocks.forEach((pre) => {
      pre.classList.add('group', 'relative')
      pre.querySelectorAll('.language-badge').forEach((badge) => badge.remove())
  
      if (!pre.querySelector('.copy-button')) {
        const copyButton = document.createElement('button')
        copyButton.textContent = siteConfig.post.copyButtonLabel
        copyButton.className = 'copy-button'
        copyButton.setAttribute('data-copy-button', 'true')
        const codeElement = pre.querySelector('code')
        const code = codeElement?.textContent || pre.textContent || ''
        copyButton.addEventListener('click', () => copyToClipboard(code, copyButton))
        pre.appendChild(copyButton)
      }
    })
  
    return () => {
      const scopedButtons = container.querySelectorAll<HTMLButtonElement>('[data-copy-button="true"]')
      scopedButtons.forEach(button => button.remove())
    }
  }, [post.html])

  const content = post.html
  const jsonLd = createPostJsonLd(post)

  return (
    <Layout title={post.title} jsonLd={jsonLd}>
      <article className="max-w-[1600px] mx-auto px-4 lg:px-8 rise-in" style={{ animationDelay: '60ms' }}>
        <div className="flex flex-col xl:flex-row">
          {/* Main content */}
          <div className="flex-1 max-w-4xl">
            <div className="mb-12">
              <Link href="/" className="text-xs font-mono uppercase tracking-widest text-neutral-600 hover:text-neutral-900 mb-8 inline-block dark:text-neutral-400 dark:hover:text-white">
                {siteConfig.post.backToHomeLabel}
              </Link>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4 text-neutral-900 dark:text-white">{post.title}</h1>
              {formattedDate ? (
                <time className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {formattedDate}
                </time>
              ) : null}
              <TagList tags={post.tags} className="mt-3" />
            </div>

            <section className="mb-8">
              <div className="surface-panel rounded-xl p-5">
                <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">
                  {siteConfig.post.statsTitle}
                </h2>
                <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <dt className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {siteConfig.post.statsLabels.readTime}
                    </dt>
                    <dd className="mt-2 text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
                      {post.stats.readingTimeMinutes} {siteConfig.post.statsLabels.minutes}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {siteConfig.post.statsLabels.words}
                    </dt>
                    <dd className="mt-2 text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
                      {post.stats.wordCount.toLocaleString(siteConfig.formatting.numberLocale)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {siteConfig.post.statsLabels.headings}
                    </dt>
                    <dd className="mt-2 text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
                      {post.stats.headingCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {siteConfig.post.statsLabels.codeBlocks}
                    </dt>
                    <dd className="mt-2 text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
                      {post.stats.codeBlockCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {siteConfig.post.statsLabels.images}
                    </dt>
                    <dd className="mt-2 text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
                      {post.stats.imageCount}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <div className="prose mx-auto surface-panel rounded-xl p-6 dark:prose-invert text-neutral-900 dark:text-neutral-100">
              <div ref={contentRef} dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </div>

          {/* Table of Contents */}
          <TableOfContents headings={headings} />
        </div>
      </article>
    </Layout>
  )
}

export async function getStaticPaths() {
  const posts = getAllPosts()
  return {
    paths: posts.map((post) => ({
      params: { slug: post.slug }
    })),
    fallback: false
  }
}

export async function getStaticProps({ 
  params 
}: {
  params: { slug: string }
}) {
  const post = getPostBySlug(params.slug)
  if (!post) {
    return {
      notFound: true
    }
  }
  return {
    props: { post }
  }
}
