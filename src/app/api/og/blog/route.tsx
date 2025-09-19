/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getBlogPost } from '@/shared/libs/blog';

export const runtime = 'nodejs';
// NOTE: API Route では `alt` / `size` / `contentType` のエクスポートは不可
// それらは `opengraph-image.tsx` 等のメタデータ画像ルートでのみ有効
const IMAGE_SIZE = { width: 1200, height: 630 } as const;

// フォントを直接取得してキャッシュ（Google CSS 経由だとサブセットで日本語グリフが欠落し得る）
const fontCache = new Map<string, ArrayBuffer>();

async function loadFontOnce(url: string): Promise<ArrayBuffer> {
  const cached = fontCache.get(url);
  if (cached) return cached;
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Failed to fetch font: ${url}`);
  const buf = await res.arrayBuffer();
  fontCache.set(url, buf);
  return buf;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return new Response('Missing slug parameter', { status: 400 });
    }

    // 実際のブログ記事データを取得
    const post = await getBlogPost(slug);
    const title = post?.title ?? slug;

    // Public配下の画像は絶対URLで参照（fs不要・Satori互換）
    const reqUrl = new URL(request.url);
    const host = reqUrl.host;
    const envOrigin = process.env.NEXT_PUBLIC_APP_URL;
    // 本番はhttps固定、環境変数があれば最優先。ローカルはrequestのprotoを利用
    const isLocal = host.includes('localhost') || host.startsWith('127.') || host.endsWith('.local');
    const origin = envOrigin
      ?? (isLocal ? `${reqUrl.protocol}//${host}` : `https://${host}`);

    const bgUrl = new URL('/assets/images/bg-paper-bk.jpg', origin).toString();
    const iconUrl = new URL('/assets/images/Lunacea-nobg.png', origin).toString();

    // フォントのプリフェッチ（失敗時は無視）
    let rajdhani700: ArrayBuffer | null = null;
    let notoSansJp700: ArrayBuffer | null = null;
    let bizUdpGothic700: ArrayBuffer | null = null;
    try {
      // Rajdhani Bold (OFL)
      rajdhani700 = await loadFontOnce('https://github.com/google/fonts/raw/main/ofl/rajdhani/Rajdhani-Bold.ttf');
    } catch {}
    try {
      // Noto Sans JP Bold (OFL)
      notoSansJp700 = await loadFontOnce('https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansJP-Bold.otf');
    } catch {}
    try {
      // BIZ UDPGothic Bold (OFL) - UD系で視認性が高い
      bizUdpGothic700 = await loadFontOnce('https://github.com/google/fonts/raw/main/ofl/bizudpgothic/BIZUDPGothic-Bold.ttf');
    } catch {}

    // カードレイアウト
    const fontOptions: {
      name: string;
      data: ArrayBuffer;
      weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
      style?: 'normal' | 'italic';
    }[] = [];
    if (rajdhani700) fontOptions.push({ name: 'Rajdhani', data: rajdhani700, weight: 700 as const, style: 'normal' });
    if (notoSansJp700) fontOptions.push({ name: 'Noto Sans JP', data: notoSansJp700, weight: 700 as const, style: 'normal' });
    if (bizUdpGothic700) fontOptions.push({ name: 'BIZ UDPGothic', data: bizUdpGothic700, weight: 700 as const, style: 'normal' });

    const imageOptions = {
      ...IMAGE_SIZE,
      ...(fontOptions.length > 0 ? { fonts: fontOptions } : {}),
    };

    return new ImageResponse(
      <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontFamily: 'BIZ UDPGothic, Noto Sans JP, system-ui, -apple-system, Segoe UI',
            padding: 40,
            boxSizing: 'border-box',
            backgroundColor: 'oklch(0.145 0 0)',
          }}
        >
          <img
            src={bgUrl}
            width="1200"
            height="630"
            alt="bg"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: 0.3,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 25%, #3b82f6 50%, #8b5cf6 75%, #f472b6 100%)',
              opacity: 0.9,
            }}
          />
          
          <div
            style={{
              position: 'relative',
              width: 1140,
              height: 570,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              borderRadius: 16,
            }}
          >
            <img
              src={bgUrl}
              width="1140"
              height="570"
              alt="bg-inner"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
              
              <div
                style={{
                  position: 'absolute',
                  top: 18,
                  left: 0,
                  right: 0,
                  width: '100%',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontFamily: 'Rajdhani, system-ui',
                  fontSize: 24,
                  letterSpacing: 1,
                  color: '#f472b6',
                  fontWeight: 700,
                }}
              >
                lunacea.jp
              </div>

              
              <h1
                style={{
                  margin: 0,
                  textAlign: 'center',
                  fontSize: title.length > 36 ? 48 : 62,
                  fontFamily: 'BIZ UDPGothic, Noto Sans JP, system-ui',
                  fontWeight: 700,
                  lineHeight: 1.25,
                  maxWidth: 920,
                  textShadow: '0 2px 12px rgba(0,0,0,0.45)'
                }}
              >
                {title}
              </h1>

              
              <div
                style={{
                  position: 'absolute',
                  left: 36,
                  bottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  fontFamily: 'noto sans jp, system-ui',
                }}
              >
                <img src={iconUrl} width="72" height="72" alt="Lunacea" />
                <div style={{ fontSize: 40, fontWeight: 800, color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.35)' }}>Lunacea</div>
              </div>
            </div>
        </div>,
      imageOptions
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    
    // フォールバック
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#1e293b',
            color: 'white',
            fontFamily: 'system-ui',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#f472b6', margin: 0 }}>
            Lunacea Blog
          </h1>
          <p style={{ fontSize: '24px', color: '#94a3b8', marginTop: '20px', margin: 0 }}>
            記事を読み込み中...
          </p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}