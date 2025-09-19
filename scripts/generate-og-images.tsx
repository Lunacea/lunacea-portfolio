#!/usr/bin/env bun
/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const IMAGE_SIZE = { width: 1200, height: 630 } as const;
const OUTPUT_DIR = join(process.cwd(), 'public', 'og-images');

// フォントファイルを事前にダウンロードしてキャッシュ
const fontCache = new Map<string, ArrayBuffer>();

async function loadFontOnce(url: string): Promise<ArrayBuffer> {
  const cached = fontCache.get(url);
  if (cached) return cached;
  
  console.warn(`Loading font: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font: ${url}`);
  const buf = await res.arrayBuffer();
  fontCache.set(url, buf);
  console.warn(`Font loaded: ${url} (${buf.byteLength} bytes)`);
  return buf;
}

// ブログ記事一覧を取得
async function getBlogPosts() {
  // server-onlyを回避するため、直接ファイルシステムから読み取り
  const { readdirSync, readFileSync } = await import('fs');
  const { join } = await import('path');
  const { default: matter } = await import('gray-matter');
  
  const contentDir = join(process.cwd(), 'content', 'blog');
  const files = readdirSync(contentDir).filter(file => file.endsWith('.mdx'));
  
  const posts = files.map(file => {
    const filePath = join(contentDir, file);
    const fileContent = readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);
    return {
      slug: file.replace('.mdx', ''),
      title: data.title || file.replace('.mdx', ''),
    };
  });
  
  return posts;
}

// OG画像を生成
async function generateOGImage(slug: string, title: string) {
  console.warn(`Generating OG image for: ${slug}`);
  
  // フォント読み込み
  let rajdhani700: ArrayBuffer | null = null;
  let bizUdpGothic700: ArrayBuffer | null = null;
  
  try {
    rajdhani700 = await loadFontOnce('https://github.com/google/fonts/raw/main/ofl/rajdhani/Rajdhani-Bold.ttf');
  } catch (e) {
    console.warn('Rajdhani font failed:', e);
  }
  
  try {
    // BIZ UDPGothic サブセット（軽量化）
    const titleChars = encodeURIComponent(`${title}テストマークダウンスタイリングブログポートフォリオLunacea`);
    const subsetUrl = `https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@700&text=${titleChars}&display=swap`;
    
    console.warn(`Fetching BIZ UDPGothic subset: ${subsetUrl}`);
    
    const cssRes = await fetch(subsetUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
    });
    
    if (!cssRes.ok) {
      throw new Error(`CSS API failed: ${cssRes.status}`);
    }
    
    const cssText = await cssRes.text();
    console.warn('CSS response preview:', cssText.substring(0, 200));
    
    // TTF URLを抽出（Google Fontsの新しい形式）
    const ttfMatch = cssText.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/) ||
                     cssText.match(/url\((https:\/\/fonts\.gstatic\.com\/l\/font\?kit=[^)]+)\)/);
    
    if (ttfMatch?.[1]) {
      console.warn('Found TTF URL:', ttfMatch[1]);
      bizUdpGothic700 = await loadFontOnce(ttfMatch[1]);
    } else {
      throw new Error('TTF URL not found in CSS');
    }
  } catch (e) {
    console.warn('BIZ UDPGothic subset failed, using system fonts:', e);
    // Docker環境でのフォールバック: フォントなしで続行
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

  // 背景画像とアイコン画像をbase64で埋め込み
  const bgImagePath = join(process.cwd(), 'public', 'assets', 'images', 'bg-paper-bk.jpg');
  const iconImagePath = join(process.cwd(), 'public', 'assets', 'images', 'Lunacea-nobg.png');
  
  const bgImageData = readFileSync(bgImagePath);
  const iconImageData = readFileSync(iconImagePath);
  
  const bgImageBase64 = `data:image/jpeg;base64,${bgImageData.toString('base64')}`;
  const iconImageBase64 = `data:image/png;base64,${iconImageData.toString('base64')}`;

  const img = new ImageResponse(
    (
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
          fontFamily: bizUdpGothic700 ? 'BIZ UDPGothic, system-ui, -apple-system, Segoe UI' : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          padding: 40,
          boxSizing: 'border-box',
          backgroundColor: 'oklch(0.145 0 0)',
        }}
      >
        <img
          src={bgImageBase64}
          width={1200}
          height={630}
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
            src={bgImageBase64}
            width={1140}
            height={570}
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
                fontFamily: 'BIZ UDPGothic, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 700,
                lineHeight: 1.25,
                maxWidth: 920,
                textShadow: '0 2px 12px rgba(0,0,0,0.45)',
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
                fontFamily: bizUdpGothic700 ? 'BIZ UDPGothic, system-ui' : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              <img src={iconImageBase64} width={72} height={72} alt="Lunacea" />
              <div style={{ fontSize: 40, fontWeight: 800, color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.35)', fontFamily: 'Rajdhani, system-ui' }}>Lunacea</div>
            </div>
          </div>
      </div>
    ),
    imageOptions,
  );

  return await img.arrayBuffer();
}

// メイン実行
async function main() {
  console.warn('Starting OG image generation...');
  
  // 出力ディレクトリを作成
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  try {
    const posts = await getBlogPosts();
    console.warn(`Found ${posts.length} blog posts`);
    
    for (const post of posts) {
      try {
        const imageBuffer = await generateOGImage(post.slug, post.title);
        const outputPath = join(OUTPUT_DIR, `${post.slug}.png`);
        writeFileSync(outputPath, Buffer.from(imageBuffer));
        console.warn(`✓ Generated: ${outputPath}`);
      } catch (error) {
        console.error(`✗ Failed to generate OG image for ${post.slug}:`, error);
      }
    }
    
    console.warn('OG image generation completed!');
  } catch (error) {
    console.error('Failed to generate OG images:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
