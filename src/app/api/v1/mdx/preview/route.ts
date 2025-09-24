import { NextRequest, NextResponse } from 'next/server';
import { parseMDXToHtml } from '@/shared/libs/mdx-remote';
import { logger } from '@/shared/libs/Logger';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    // サーバーサイドのMDX処理を実行
    const htmlContent = await parseMDXToHtml(content);

    return NextResponse.json({ htmlContent });
  } catch (error) {
    logger.error({ error }, 'MDX preview API error');
    
    return NextResponse.json(
      { 
        error: 'Failed to process MDX content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

