import Link from 'next/link'
import Layout from '@/layouts/Layout'
import { siteConfig } from '@site-config'

export default function NotFound() {
  return (
    <Layout title="404 — Page Not Found" searchPosts={[]}>
      <div className="max-w-2xl mx-auto text-center py-24 rise-in">
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">
          404
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-6">
          Page not found
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 mb-10">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-md border border-neutral-300 text-neutral-900 hover:bg-neutral-900 hover:text-neutral-100 transition dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-900 font-mono text-xs uppercase tracking-wider"
        >
          {siteConfig.post.backToHomeLabel}
        </Link>
      </div>
    </Layout>
  )
}
