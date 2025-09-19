import { getBlogPost } from '@/shared/libs/blog';

export default async function Head({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  const hasMath = Boolean(post?.hasMath);

  if (!hasMath) return null;

  const handleOnLoad = (e: React.SyntheticEvent<HTMLLinkElement>) => {
    const el = e.currentTarget;
    el.rel = 'stylesheet';
  };

  return (
    <>
      <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
      <link
        rel="preload"
        as="style"
        href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
        integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
        crossOrigin="anonymous"
        onLoad={handleOnLoad}
      />
      <noscript>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
          crossOrigin="anonymous"
        />
      </noscript>
    </>
  );
}
