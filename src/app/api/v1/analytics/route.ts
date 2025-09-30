'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { analyticsEvents } from '@/shared/models/Schema';
import { db } from '@/shared/libs/blog-db';
import { logger } from '@/shared/libs/Logger';

const bodySchema = z.object({
  eventType: z.string().min(1).max(64),
  path: z.string().min(1).max(512),
  slug: z.string().max(255).optional(),
  referrer: z.string().max(512).optional(),
  durationMs: z.number().int().min(0).optional(),
  meta: z.any().optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'ValidationError', issues: parsed.error.issues }, { status: 400 });
  }
  const { eventType, path, slug, referrer, durationMs, meta } = parsed.data;
  try {
    const metaString = meta ? JSON.stringify(meta).slice(0, 10000) : null;
    await db.insert(analyticsEvents).values({
      eventType,
      path,
      slug: slug || null,
      referrer: referrer || null,
      durationMs: durationMs ?? null,
      meta: metaString,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    logger.error({ error }, 'analytics event insert failed');
    return NextResponse.json({ error: 'InternalError' }, { status: 500 });
  }
}


