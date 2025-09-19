/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getBlogPost } from '@/shared/libs/blog';

export const runtime = 'nodejs';

const IMAGE_SIZE = { width: 1200, height: 630 } as const;

// フォントキャッシュ（プロセス起動時に一度だけロード）
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

    // Public配下の画像は絶対URLで参照
    const baseUrl = new URL(request.url);
    const origin = process.env.NEXT_PUBLIC_APP_URL || `${baseUrl.protocol}//${baseUrl.host}`;
    const bgUrl = new URL('/assets/images/bg-paper-bk.jpg', origin).toString();
    const iconUrl = new URL('/assets/images/Lunacea-nobg.png', origin).toString();

    // サブセットフォントのプリロード（記事タイトル用文字のみ）
    let rajdhani700: ArrayBuffer | null = null;
    let bizUdpGothic700: ArrayBuffer | null = null;
    
    try {
      // Rajdhani Bold (~500KB程度)
      rajdhani700 = await loadFontOnce('https://github.com/google/fonts/raw/main/ofl/rajdhani/Rajdhani-Bold.ttf');
    } catch {}
    
    try {
      // BIZ UDPGothic サブセット（記事タイトル + 基本文字のみ）
      const titleChars = encodeURIComponent(`${title}テストマークダウンスタイリングブログポートフォリオLunacea`);
      const subsetUrl = `https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@700&text=${titleChars}&display=swap`;
      
      // Google Fonts CSS APIからWOFF2 URLを抽出
      const cssRes = await fetch(subsetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OGBot)' }
      });
      const cssText = await cssRes.text();
      const woff2Match = cssText.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/);
      
      if (woff2Match?.[1]) {
        bizUdpGothic700 = await loadFontOnce(woff2Match[1]);
      }
    } catch (e) {
      console.warn('BIZ UDPGothic subset failed, using fallback:', e);
    }

    const fontOptions: {
      name: string;
      data: ArrayBuffer;
      weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
      style?: 'normal' | 'italic';
    }[] = [];
    
    if (rajdhani700) fontOptions.push({ name: 'Rajdhani', data: rajdhani700, weight: 700 as const, style: 'normal' });
    if (bizUdpGothic700) fontOptions.push({ name: 'BIZ UDPGothic', data: bizUdpGothic700, weight: 700 as const, style: 'normal' });

    const imageOptions = {
      ...IMAGE_SIZE,
      ...(fontOptions.length > 0 ? { fonts: fontOptions } : {}),
    };

    const img = new ImageResponse(
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
            fontFamily: 'BIZ UDPGothic, system-ui, -apple-system, Segoe UI',
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
                  fontFamily: 'BIZ UDPGothic, system-ui',
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
                  fontFamily: 'BIZ UDPGothic, system-ui',
                }}
              >
                <img src={iconUrl} width="72" height="72" alt="Lunacea" />
                <div style={{ fontSize: 40, fontWeight: 800, color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.35)' }}>Lunacea</div>
              </div>
            </div>
        </div>,
      imageOptions,
    );

    // CDNキャッシュヘッダーで高速化
    const response = new Response(await img.arrayBuffer(), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
      },
    });
    
    return response;
    
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