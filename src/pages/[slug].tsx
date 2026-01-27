import Layout from '@/layouts/Layout'
import { getPage, getAllPages } from '@/lib/markdown'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
import remarkEmoji from 'remark-emoji';
import rehypeContentAssets from '@/lib/rehype-content-assets';
import { siteConfig } from '@site-config';
import rehypePrism from '@/lib/rehype-prism';
import Timeline from '@/components/Timeline';
import type { TimelineEntry } from '@/types/timeline';


interface PageProps {
  page: {
    slug: string
    title: string
    lastUpdated: string | null
    content: string
    timeline: TimelineEntry[]
  }
}

const formatDate = (
  value: string | null | undefined,
  locale: string,
  options?: Intl.DateTimeFormatOptions
) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString(locale, options);
};

export default function Page({ page }: PageProps) {
  const formattedLastUpdated = formatDate(page.lastUpdated, siteConfig.page.lastUpdatedLocale);
  const content = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkEmoji)
    .use(remarkRehype)
    .use(rehypeContentAssets)
    .use(rehypeKatex)
    .use(rehypePrism)
    .use(rehypeStringify)
    .processSync(page.content)
    .toString()

  return (
    <Layout title={page.title}>
      <div className="max-w-4xl mx-auto rise-in" style={{ animationDelay: '60ms' }}>
        <div className="surface-panel rounded-xl p-8">
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }} 
          />
          {page.timeline.length > 0 ? <Timeline entries={page.timeline} /> : null}
          {formattedLastUpdated ? (
            <div className="mt-8 text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              {siteConfig.page.lastUpdatedLabel} {formattedLastUpdated}
            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  )
}

export async function getStaticPaths() {
  const pages = getAllPages()
  return {
    paths: pages.map((page) => ({
      params: { slug: page.slug }
    })),
    fallback: false
  }
}

export async function getStaticProps({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const page = getPage(params.slug)
  
  if (!page) {
    return {
      notFound: true
    }
  }

  return {
    props: { page }
  }
}
