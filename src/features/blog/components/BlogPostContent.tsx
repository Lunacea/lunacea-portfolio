import BlogPostContentClient from './BlogPostContentClient';
import '@/features/blog/styles/math.css';
import '@/features/blog/styles/mermaid.css';

type BlogPost = {
  slug: string;
  title: string;
  description?: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  readingTime: string;
  content: string;
  htmlContent?: string;
  tableOfContents?: Array<{ id: string; title: string; level: number }>;
  excerpt?: string;
  isMDX?: boolean;
};

type BlogPostContentProps = {
  post: BlogPost;
};

/**
 * サーバーコンポーネントとしてブログコンテンツをレンダリング
 */
export default function BlogPostContent({ post }: BlogPostContentProps) {
  return <BlogPostContentClient post={post} />;
}
