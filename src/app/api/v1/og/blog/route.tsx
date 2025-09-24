import { NextRequest } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      console.warn('OG Generation: Missing slug parameter');
      return new Response('Missing slug parameter', { status: 400 });
    }

    console.warn('OG Generation: Serving static image for slug:', slug);

    // 静的OG画像ファイルのパス
    const imagePath = join(process.cwd(), 'public', 'og-images', `${slug}.png`);
    
    if (!existsSync(imagePath)) {
      console.warn('OG Generation: Static image not found:', imagePath);
      return new Response('OG image not found', { status: 404 });
    }

    // 静的ファイルを読み込んで配信
    const imageBuffer = readFileSync(imagePath);
    
    console.warn('OG Generation: Successfully served static image for slug:', slug);

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('OG Generation error:', error);
    
    return new Response('Internal Server Error', { status: 500 });
  }
}
