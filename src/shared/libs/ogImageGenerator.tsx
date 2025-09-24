import { ImageResponse } from 'next/og';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from '@/shared/libs/Logger';
import 'server-only';

const IMAGE_SIZE = { width: 1200, height: 630 } as const;

// フォントファイルを事前にダウンロードしてキャッシュ
const fontCache = new Map<string, ArrayBuffer>();

/**
 * フォントを一度だけ読み込み、キャッシュする
 */
async function loadFontOnce(url: string): Promise<ArrayBuffer> {
  const cached = fontCache.get(url);
  if (cached) return cached;
  
  logger.info(`Loading font: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font: ${url}`);
  const buf = await res.arrayBuffer();
  fontCache.set(url, buf);
  logger.info(`Font loaded: ${url} (${buf.byteLength} bytes)`);
  return buf;
}

/**
 * OGP画像を生成する
 */
export async function generateOGImage(slug: string, title: string): Promise<ArrayBuffer> {
  try {
    logger.info(`Generating OGP image for: ${slug}`);

    // フォントを読み込み
    const [notoSansJP, notoSansJPBold] = await Promise.all([
      loadFontOnce('https://fonts.gstatic.com/s/notosansjp/v52/o-0IIpQlx3QUlC5A4PNb4j5Ba_2c7A.woff2'),
      loadFontOnce('https://fonts.gstatic.com/s/notosansjp/v52/o-0IIpQlx3QUlC5A4PNb4j5Ba_2c7A.woff2'),
    ]);

    // タイトルの文字数制限（長すぎる場合は省略）
    const displayTitle = title.length > 50 ? `${title.substring(0, 50)}...` : title;

    // ImageResponseでOG画像を生成
    const image = new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
          }}
        >
          {/* 背景パターン */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
            }}
          />
          
          {/* メインコンテンツ */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              textAlign: 'center',
              zIndex: 1,
            }}
          >
            {/* サイト名 */}
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '20px',
                opacity: 0.9,
              }}
            >
              Lunacea Portfolio
            </div>
            
            {/* タイトル */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#ffffff',
                lineHeight: 1.2,
                maxWidth: '1000px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              {displayTitle}
            </div>
            
            {/* 装飾的な要素 */}
            <div
              style={{
                width: '100px',
                height: '4px',
                backgroundColor: '#ffffff',
                marginTop: '40px',
                borderRadius: '2px',
                opacity: 0.8,
              }}
            />
          </div>
          
          {/* コーナー装飾 */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              width: '80px',
              height: '80px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '40px',
              width: '60px',
              height: '60px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
            }}
          />
        </div>
      ),
      {
        ...IMAGE_SIZE,
        fonts: [
          {
            name: 'NotoSansJP',
            data: notoSansJP,
            style: 'normal',
            weight: 400,
          },
          {
            name: 'NotoSansJPBold',
            data: notoSansJPBold,
            style: 'normal',
            weight: 700,
          },
        ],
      }
    );

    // ArrayBufferに変換
    const buffer = await image.arrayBuffer();
    logger.info(`OGP image generated successfully for: ${slug}`);
    return buffer;

  } catch (error) {
    logger.error({ error, slug, title }, 'OGP画像の生成に失敗しました');
    throw new Error(`OGP画像の生成に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * OGP画像をファイルシステムに保存する
 */
export async function saveOGImage(slug: string, title: string, outputDir?: string): Promise<string> {
  try {
    const outputPath = outputDir || join(process.cwd(), 'public', 'og-images');
    
    // 出力ディレクトリが存在しない場合は作成
    if (!existsSync(outputPath)) {
      mkdirSync(outputPath, { recursive: true });
      logger.info(`Created output directory: ${outputPath}`);
    }

    // OGP画像を生成
    const imageBuffer = await generateOGImage(slug, title);
    
    // ファイルに保存
    const fileName = `${slug}.png`;
    const filePath = join(outputPath, fileName);
    writeFileSync(filePath, Buffer.from(imageBuffer));
    
    const relativePath = `/og-images/${fileName}`;
    logger.info(`OGP image saved: ${filePath} -> ${relativePath}`);
    
    return relativePath;

  } catch (error) {
    logger.error({ error, slug, title }, 'OGP画像の保存に失敗しました');
    throw error;
  }
}

/**
 * データベースの記事用にOGP画像を生成・保存
 */
export async function generateOGImageForPost(slug: string, title: string): Promise<string> {
  return await saveOGImage(slug, title);
}

/**
 * 複数の記事のOGP画像を一括生成
 */
export async function generateOGImagesForPosts(posts: Array<{ slug: string; title: string }>): Promise<Array<{ slug: string; success: boolean; error?: string }>> {
  const results: Array<{ slug: string; success: boolean; error?: string }> = [];
  
  logger.info(`Starting batch OGP image generation for ${posts.length} posts`);
  
  for (const post of posts) {
    try {
      await generateOGImageForPost(post.slug, post.title);
      results.push({ slug: post.slug, success: true });
      logger.info(`✓ Generated OGP image for: ${post.slug}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({ slug: post.slug, success: false, error: errorMessage });
      logger.error({ error, slug: post.slug }, `✗ Failed to generate OGP image for ${post.slug}`);
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  logger.info(`Batch OGP image generation completed: ${successCount} success, ${failureCount} failures`);
  
  return results;
}

/**
 * 既存のOGP画像が存在するかチェック
 */
export function checkOGImageExists(slug: string, outputDir?: string): boolean {
  const outputPath = outputDir || join(process.cwd(), 'public', 'og-images');
  const fileName = `${slug}.png`;
  const filePath = join(outputPath, fileName);
  return existsSync(filePath);
}
