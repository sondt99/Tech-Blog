import { getAllPosts } from '@/lib/markdown';
import { POSTS_PER_PAGE } from '../index';
import Home, { HomeProps } from '../index';
import type { SearchPost } from '@/components/SearchModal';

const PageComponent = ({ posts, currentPage, totalPages, searchPosts }: HomeProps) => {
  return (
    <Home
      posts={posts}
      currentPage={currentPage}
      totalPages={totalPages}
      searchPosts={searchPosts}
    />
  );
};

export async function getStaticPaths() {
  const allPosts = getAllPosts();
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const paths = Array.from({ length: totalPages }, (_, i) => ({
    params: { page: String(i + 1) },
  })).filter((p) => p.params.page !== '1');

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }: { params: { page: string } }) {
  const currentPage = Number(params.page) || 1;
  const allPosts = getAllPosts();
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

  if (currentPage < 1 || currentPage > totalPages) {
    return { notFound: true };
  }

  if (currentPage === 1) {
    return { redirect: { destination: '/', permanent: false } };
  }

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = allPosts.slice(startIndex, endIndex);

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
      currentPage,
      totalPages,
      searchPosts: allPosts.map((post) => ({
        slug: post.slug,
        title: post.title || null,
        excerpt: post.excerpt || null,
        tags: post.tags,
      })) satisfies SearchPost[],
    },
    revalidate: 3600,
  };
}

export default PageComponent;
