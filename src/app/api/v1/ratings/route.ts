import { detectBot } from '@arcjet/next';
import { and, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import arcjet from '@/shared/libs/Arcjet';
import { db } from '@/shared/libs/DB';
import { postRatingVotes } from '@/shared/models/Schema';

const listQuerySchema = z.object({
  slug: z.string().min(1),
});

const createBodySchema = z.object({
  slug: z.string().min(1),
  value: z.literal('up'),
});

export async function GET(request: Request) {
  const aj = arcjet.withRule(detectBot({
    mode: 'LIVE',
    allow: [
      'CATEGORY:SEARCH_ENGINE',
      'CATEGORY:PREVIEW',
      'CATEGORY:MONITOR',
    ],
  }));
  const decision = await aj.protect(request);
  if (decision.isDenied()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = listQuerySchema.safeParse({ slug: searchParams.get('slug') });
  if (!parsed.success) {
    return NextResponse.json({ error: 'ValidationError', issues: parsed.error.issues }, { status: 400 });
  }

  const { slug } = parsed.data;
  try {
    const dbInstance = await db.get();
    // クライアントは日付に依存せずtripcodeで判定
    const [{ count: up = 0 } = { count: 0 }] = await dbInstance
      .select({ count: sql<number>`count(distinct ${postRatingVotes.tripcode})` })
      .from(postRatingVotes)
      .where(and(eq(postRatingVotes.slug, slug), eq(postRatingVotes.voteValue, 'up')));

    const trip = generateTripcode(request);
    const existing = await dbInstance
      .select({ id: postRatingVotes.id })
      .from(postRatingVotes)
      .where(and(
        eq(postRatingVotes.slug, slug),
        eq(postRatingVotes.tripcode, trip),
      ));
    const hasVoted = existing.length > 0;
    return NextResponse.json({ data: { up, down: 0, score: up, hasVoted } }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'DatabaseError' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const aj = arcjet.withRule(detectBot({
    mode: 'LIVE',
    allow: [
      'CATEGORY:SEARCH_ENGINE',
      'CATEGORY:PREVIEW',
      'CATEGORY:MONITOR',
    ],
  }));
  const decision = await aj.protect(request);
  if (decision.isDenied()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'ValidationError', issues: parsed.error.issues }, { status: 400 });
  }

  const { slug, value } = parsed.data;
  const tripcode = generateTripcode(request);
  const dailyId = generateDailyIdCompat(tripcode);
  const voteDay = getUTCDateString(); // 互換用に埋める（判定には使用しない）

  try {
    const dbInstance = await db.get();
    // トグル: 既存の投票（slug+tripcode）があれば削除、なければ作成
    const existing = await dbInstance
      .select({ id: postRatingVotes.id })
      .from(postRatingVotes)
      .where(and(
        eq(postRatingVotes.slug, slug),
        eq(postRatingVotes.tripcode, tripcode),
      ));

    if (existing.length > 0) {
      await dbInstance
        .delete(postRatingVotes)
        .where(and(eq(postRatingVotes.slug, slug), eq(postRatingVotes.tripcode, tripcode)));
      return NextResponse.json({ ok: true, removed: true }, { status: 200 });
    }

    await dbInstance.insert(postRatingVotes).values({
      slug,
      voteValue: value,
      dailyId,
      tripcode,
      voteDay,
    });

    return NextResponse.json({ ok: true, removed: false }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'InternalError' }, { status: 500 });
  }
}

// 互換用（既存スキーマ列を満たすためのダミー生成）
function generateDailyIdCompat(tripcode: string): string {
  return tripcode.slice(0, 16);
}

function generateTripcode(request: Request): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const ua = request.headers.get('user-agent') || 'ua';
  return shortHash(`${ip}|${ua}`);
}

function shortHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const n = Math.abs(hash >>> 0).toString(16).padStart(8, '0');
  return (n + n).slice(0, 16);
}

function getUTCDateString(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = `${now.getUTCMonth() + 1}`.padStart(2, '0');
  const d = `${now.getUTCDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}



