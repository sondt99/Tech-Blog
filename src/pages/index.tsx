import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/markdown';
import { getSiteCommit } from '@/lib/siteCommit';
import Layout from '@/layouts/Layout';
import { siteConfig } from '@/config/site';
import TagList from '@/components/TagList';
import OpenSourceStatus from '@/components/OpenSourceStatus';

export const POSTS_PER_PAGE = 4;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

function Pagination({ currentPage, totalPages }: PaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
      {currentPage > 1 && (
        <Link
          href={currentPage === 2 ? '/' : `/page/${currentPage - 1}`}
          className="px-4 py-2 rounded-md border border-neutral-300 text-neutral-900 hover:bg-neutral-900 hover:text-neutral-100 transition dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-900 font-mono text-xs uppercase tracking-wider"
        >
          {siteConfig.pagination.previousLabel}
        </Link>
      )}
      
      <span className="px-4 py-2 text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
        {siteConfig.pagination.pageLabel} {currentPage} / {totalPages}
      </span>

      {currentPage < totalPages && (
        <Link
          href={`/page/${currentPage + 1}`}
          className="px-4 py-2 rounded-md border border-neutral-300 text-neutral-900 hover:bg-neutral-900 hover:text-neutral-100 transition dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-900 font-mono text-xs uppercase tracking-wider"
        >
          {siteConfig.pagination.nextLabel}
        </Link>
      )}
    </div>
  );
}

export default function Home({ posts, currentPage, totalPages, siteCommit }: HomeProps) {
  return (
    <Layout title={siteConfig.home.pageTitle}>
      <div className="max-w-4xl mx-auto">
        <section className="mb-16 rise-in" style={{ animationDelay: '40ms' }}>
          <div className="inline-flex items-center gap-3 rounded-full border border-neutral-300/70 dark:border-neutral-700 bg-neutral-100/70 dark:bg-neutral-900/40 px-4 py-1 text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            <span className="h-px w-5 bg-neutral-400 dark:bg-neutral-600" />
            {siteConfig.home.badgeText}
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            {siteConfig.home.title}
          </h1>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl">
            {siteConfig.home.subtitle}
          </p>
          <OpenSourceStatus siteCommit={siteCommit} />
        </section>

        <section className="space-y-10">
          {posts.map((post, index) => (
            <article
              key={post.slug}
              className="group relative overflow-hidden rounded-2xl surface-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rise-in"
              style={{ animationDelay: `${120 + index * 80}ms` }}
            >
              <Link href={`/posts/${post.slug}`}>
                {post.featured && (
                  <div className="relative h-64 w-full overflow-hidden border-b border-neutral-200/70 dark:border-neutral-800">
                    <Image
                      src={post.featured}
                      alt={post.title || siteConfig.home.featuredAlt}
                      fill
                      sizes="(min-width: 1024px) 800px, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority={index === 0}
                    />
                  </div>
                )}
                <div className="p-8 sm:p-10">
                  <div className="mb-4 space-y-3">
                    <time className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {post.date
                        ? new Date(post.date).toLocaleDateString(
                            siteConfig.formatting.dateLocale,
                            siteConfig.formatting.dateOptions
                          )
                        : siteConfig.home.noDateLabel}
                    </time>
                    <TagList tags={post.tags} />
                  </div>
                  <h2 className="text-2xl font-semibold mb-3 text-neutral-900 dark:text-white transition-colors duration-200">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-neutral-600 dark:text-neutral-300 mb-5">{post.excerpt}</p>
                  )}
                  <div className="flex items-center">
                    <span className="text-neutral-800 dark:text-neutral-200 font-mono text-xs uppercase tracking-widest">
                      {siteConfig.home.readMoreLabel}
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </section>

        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </Layout>
  );
}

export interface HomeProps {
  posts: {
    slug: string;
    title: string | null;
    date: string | null;
    excerpt: string | null;
    featured: string | null;
    tags: string[];
  }[];
  currentPage: number;
  totalPages: number;
  siteCommit?: string | null;
}

export async function getStaticProps() {
  const allPosts = getAllPosts();
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = allPosts.slice(0, POSTS_PER_PAGE);
  const siteCommit = getSiteCommit({ allowGit: true });

  return {
    props: {
      posts: paginatedPosts.map((post) => ({
        slug: post.slug,
        title: post.title || null,
        date: post.date || null,
        excerpt: post.excerpt || null,
        featured: post.featured || null,
        tags: post.tags,
      })),
      currentPage: 1,
      totalPages,
      siteCommit,
    },
  };
}
