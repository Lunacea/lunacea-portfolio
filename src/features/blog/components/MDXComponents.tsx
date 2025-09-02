import Image from 'next/image';
import Link from 'next/link';
import { type MDXComponents } from 'mdx/types';
import MermaidDiagram from './MermaidDiagram';

/**
 * MDXで使用するカスタムコンポーネント
 * next-mdx-remoteで使用するためのコンポーネントマップ
 */
export const mdxComponents: MDXComponents = {
  // Next.js Imageコンポーネントを最適化
  img: ({ src, alt, ...props }) => {
    if (!src) return null;
    
    // 外部URLの場合は通常のimgタグを使用（最適化の制限があるため）
    if (src.startsWith('http')) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={alt} {...props} />;
    }
    
    // 内部画像の場合はNext.js Imageを使用
    return (
      <Image
        src={src}
        alt={alt || ''}
        width={800}
        height={600}
        className="rounded-lg shadow-lg my-6"
        {...props}
      />
    );
  },
  
  // カスタムImageコンポーネント（明示的に使用する場合）
  Image: ({ src, alt, width = 800, height = 600, ...props }) => {
    if (!src) return null;
    
    if (src.startsWith('http')) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={alt} width={width} height={height} {...props} />;
    }
    
    return (
      <Image
        src={src}
        alt={alt || ''}
        width={width}
        height={height}
        className="rounded-lg shadow-lg my-6"
        {...props}
      />
    );
  },
  
  // リンクの最適化
  a: ({ href, children, ...props }) => {
    if (!href) return <span {...props}>{children}</span>;
    
    // 外部リンクの場合は新しいタブで開く
    if (href.startsWith('http')) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline transition-colors"
          {...props}
        >
          {children}
        </a>
      );
    }
    
    // 内部リンクの場合はNext.js Linkを使用
    return (
      <Link
        href={href}
        className="text-primary hover:text-primary/80 underline transition-colors"
        {...props}
      >
        {children}
      </Link>
    );
  },
  
  // 見出しのスタイリング
  h1: ({ children, ...props }) => (
    <h1 className="text-4xl font-bold text-foreground mb-6 mt-8 first:mt-0" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-3xl font-bold text-foreground mb-4 mt-8 first:mt-0" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-2xl font-semibold text-foreground mb-3 mt-6 first:mt-0" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-xl font-semibold text-foreground mb-2 mt-4 first:mt-0" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 className="text-lg font-medium text-foreground mb-2 mt-4 first:mt-0" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 className="text-base font-medium text-foreground mb-2 mt-4 first:mt-0" {...props}>
      {children}
    </h6>
  ),
  
  // 段落のスタイリング
  p: ({ children, ...props }) => (
    <p className="text-muted-foreground leading-relaxed mb-4" {...props}>
      {children}
    </p>
  ),
  
  // リストのスタイリング
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside text-muted-foreground mb-4 space-y-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  
  // 引用のスタイリング
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-6 bg-muted/30 rounded-r-lg" {...props}>
      {children}
    </blockquote>
  ),
  
  // コードブロックのスタイリング
  pre: ({ children, ...props }) => (
    <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto my-6" {...props}>
      {children}
    </pre>
  ),
  code: ({ children, ...props }) => (
    <code className="bg-muted/50 text-primary px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  ),
  
  // テーブルのスタイリング
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border-collapse border border-border" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th className="border border-border bg-muted/50 px-4 py-2 text-left font-semibold" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-border px-4 py-2" {...props}>
      {children}
    </td>
  ),
  
  // 水平線のスタイリング
  hr: ({ ...props }) => (
    <hr className="border-border my-8" {...props} />
  ),
  
  // 強調のスタイリング
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-foreground" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-foreground" {...props}>
      {children}
    </em>
  ),
  
  // Mermaid図表コンポーネント
  MermaidDiagram: ({ children, ...props }) => (
    <MermaidDiagram {...props}>
      {children}
    </MermaidDiagram>
  ),
};
