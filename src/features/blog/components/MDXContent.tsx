import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from './MDXComponents';

type MDXContentProps = {
  mdxContent: {
    source: string;
    compiledSource: string;
    frontmatter: Record<string, unknown>;
    scope: Record<string, unknown>;
  };
};

/**
 * サーバーコンポーネントとしてMDXコンテンツをレンダリング
 */
export default function MDXContent({ mdxContent }: MDXContentProps) {
  if (!mdxContent) {
    return <div>MDXコンテンツがありません</div>;
  }

  return (
    <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-pre:!bg-transparent prose-pre:!p-0 prose-pre:!m-0">
      <MDXRemote {...mdxContent} components={mdxComponents} />
    </div>
  );
}
