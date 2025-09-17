import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { Env } from '@/shared/libs/Env';
import { getAllBlogPosts } from '@/shared/libs/blog';
import OgImagePreview from './OgImagePreview';

export const dynamic = 'force-dynamic';

export default async function OgPreviewPage() {
  if (Env.NODE_ENV === 'production') {
    notFound();
  }
  const posts = await getAllBlogPosts();
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const origin = `${proto}://${host}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-6">OG Image Preview</h1>
      <p className="text-sm text-muted-foreground mb-6">ローカル/ビルド後の環境でOG画像を一覧プレビューできます。</p>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">記事がありません。</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((p) => {
            const imgUrl = `${origin}/api/og/blog?slug=${encodeURIComponent(p.slug)}`;
            
            return (
              <li key={p.slug} className="border border-border rounded-lg p-4">
                <Link href={`/blog/${p.slug}`} className="block mb-3 hover:underline">
                  {p.title}
                </Link>
                <div className="relative w-full aspect-[1200/630] bg-muted/30 rounded-md overflow-hidden">
                  <OgImagePreview 
                    src={imgUrl} 
                    alt={`${p.title} OG`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground break-all">{imgUrl}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  記事: {p.excerpt || p.description || 'No description'}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}


