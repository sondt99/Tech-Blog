import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/layouts/Layout';
import TagList from '@/components/TagList';
import { getAllPosts } from '@/lib/markdown';
import { siteConfig } from '@site-config';

interface TagPagePost {
  slug: string;
  title: string | null;
  date: string | null;
  excerpt: string | null;
  featured: string | null;
  tags: string[];
}

interface TagPageProps {
  tag: string;
  posts: TagPagePost[];
  tags: string[];
}

export default function TagPage({ tag, posts, tags }: TagPageProps) {
  const title = `Tag: ${tag}`;
  const postCountLabel = posts.length === 1 ? 'post' : 'posts';

  return (
    <Layout title={title}>
      <div className="max-w-4xl mx-auto">
        <section className="mb-12 rise-in" style={{ animationDelay: '40ms' }}>
          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-widest text-neutral-600 hover:text-neutral-900 mb-5 inline-block dark:text-neutral-400 dark:hover:text-white"
          >
            {siteConfig.post.backToHomeLabel}
          </Link>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-3 text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {posts.length} {postCountLabel}
          </p>
          {tags.length > 0 ? (
            <div className="mt-5">
              <TagList tags={tags} activeTag={tag} />
            </div>
          ) : null}
        </section>

        {posts.length > 0 ? (
          <section className="space-y-10">
            {posts.map((post, index) => (
              <article
                key={post.slug}
                className="group relative overflow-hidden rounded-2xl surface-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rise-in"
                style={{ animationDelay: `${120 + index * 80}ms` }}
              >
                {post.featured && (
                  <Link
                    href={`/posts/${post.slug}`}
                    className="block relative h-64 w-full overflow-hidden border-b border-neutral-200/70 dark:border-neutral-800"
                  >
                    <Image
                      src={post.featured}
                      alt={post.title || siteConfig.home.featuredAlt}
                      fill
                      sizes="(min-width: 1024px) 800px, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority={index === 0}
                    />
                  </Link>
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
                    <TagList tags={post.tags} activeTag={tag} />
                  </div>
                  <Link href={`/posts/${post.slug}`} className="block">
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
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="surface-panel rounded-xl p-8 text-neutral-600 dark:text-neutral-300">
            No posts found for this tag.
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  const posts = getAllPosts();
  const tagSet = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => tagSet.add(tag));
  });

  return {
    paths: Array.from(tagSet).map((tag) => ({
      params: { tag }
    })),
    fallback: false
  };
}

export async function getStaticProps({
  params
}: {
  params: { tag: string | string[] }
}) {
  const tagParam = Array.isArray(params?.tag) ? params.tag[0] : params?.tag;
  const decodedTag = tagParam ? decodeURIComponent(tagParam) : '';

  if (!decodedTag) {
    return {
      notFound: true
    };
  }

  const allPosts = getAllPosts();
  const normalizedTag = decodedTag.toLowerCase();
  const filteredPosts = allPosts.filter((post) =>
    post.tags.some((tag) => tag.toLowerCase() === normalizedTag)
  );

  if (filteredPosts.length === 0) {
    return {
      notFound: true
    };
  }

  const tags = Array.from(
    new Set(allPosts.flatMap((post) => post.tags))
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  const matchedTag =
    tags.find((tag) => tag.toLowerCase() === normalizedTag) || decodedTag;

  return {
    props: {
      tag: matchedTag,
      tags,
      posts: filteredPosts.map((post) => ({
        slug: post.slug,
        title: post.title || null,
        date: post.date || null,
        excerpt: post.excerpt || null,
        featured: post.featured || null,
        tags: post.tags
      }))
    }
  };
}
