import { getAllPosts, getPostBySlug } from '@/lib/markdown'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
import Layout from '@/layouts/Layout'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import TableOfContents from '@/components/TableOfContents';
import remarkEmoji from 'remark-emoji'
import rehypeContentAssets from '@/lib/rehype-content-assets'

// Thêm interface cho heading
interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface PostProps {
  post: {
    title: string;
    date: string;
    content: string;
  }
}

export default function Post({ post }: PostProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);

  useEffect(() => {
    const articleContent = document.querySelector('.prose');
    if (articleContent) {
      const headingElements = articleContent.querySelectorAll('h2, h3, h4');
      const items: TocItem[] = Array.from(headingElements).map((heading) => {
        // Tạo id nếu chưa có
        if (!heading.id) {
          heading.id = heading.textContent?.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '') || '';
        }
        
        return {
          id: heading.id,
          text: heading.textContent || '',
          level: parseInt(heading.tagName[1]),
        };
      });
      setHeadings(items);
    }
  }, [post.content]);
  // Thêm function xử lý copy
  const copyToClipboard = async (text: string, buttonElement: HTMLButtonElement) => {
    try {
      await navigator.clipboard.writeText(text);
      buttonElement.textContent = 'Copied!';
      setTimeout(() => {
        buttonElement.textContent = 'Copy';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    const codeBlocks = document.querySelectorAll('pre');
    codeBlocks.forEach(pre => {
      // Thêm class group để control copy button visibility
      pre.classList.add('group', 'relative');
      pre.querySelectorAll('.language-badge').forEach((badge) => badge.remove());
  
      // Thêm copy button với style mới
      if (!pre.querySelector('.copy-button')) {
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.className = 'copy-button';
        const code = pre.textContent || '';
        copyButton.addEventListener('click', () => copyToClipboard(code, copyButton));
        pre.appendChild(copyButton);
      }
    });
  
    return () => {
      const copyButtons = document.querySelectorAll('.copy-button');
      copyButtons.forEach(button => button.remove());
    };
  }, []);

  const content = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkEmoji) 
    .use(remarkRehype)
    .use(rehypeContentAssets)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .processSync(post.content)
    .toString()

    return (
      <Layout title={post.title}>
        <article className="max-w-[1600px] mx-auto px-4 lg:px-8 rise-in" style={{ animationDelay: '60ms' }}>
          <div className="flex flex-col xl:flex-row">
            {/* Main content */}
            <div className="flex-1 max-w-4xl">
              <div className="mb-12">
                <Link href="/" className="text-xs font-mono uppercase tracking-widest text-neutral-600 hover:text-neutral-900 mb-8 inline-block dark:text-neutral-400 dark:hover:text-white">
                  Back to home
                </Link>
                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4 text-neutral-900 dark:text-white">{post.title}</h1>
                <time className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {new Date(post.date).toLocaleDateString('en-EN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              
              <div className="prose prose-lg mx-auto surface-panel rounded-xl p-6 dark:prose-invert text-neutral-900 dark:text-neutral-100">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            </div>
  
            {/* Table of Contents */}
            <TableOfContents headings={headings} />
          </div>
        </article>
      </Layout>
    );
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
  return {
    props: { post }
  }
}
