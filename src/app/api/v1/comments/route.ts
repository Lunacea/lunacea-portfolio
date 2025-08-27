import { detectBot } from '@arcjet/next';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import arcjet from '@/shared/libs/Arcjet';
import { db } from '@/shared/libs/DB';
import { comments } from '@/shared/models/Schema';

const listQuerySchema = z.object({
  slug: z.string().min(1),
});

const createBodySchema = z.object({
  slug: z.string().min(1),
  author: z.union([z.string().max(80), z.literal('')]).optional(),
  body: z.string().min(1).max(4000),
  parentId: z.number().int().positive().optional(),
});

export async function GET(request: Request) {
  // Basic bot protection (read): allow all but record bot blocks in LIVE mode
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
    const rows = await dbInstance.select().from(comments).where(eq(comments.slug, slug)).orderBy(desc(comments.createdAt)).limit(200);
    return NextResponse.json({ data: rows }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Stronger bot protection for write endpoints
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
  try {
    const { slug, author, body, parentId } = parsed.data;
    const authorValue = author && author.trim().length > 0 ? author.trim() : 'anonymous';
    const dailyId = generateDailyId(request, slug);
    const tripcode = generateTripcode(request);
    const dbInstance = await db.get();
    const [row] = await dbInstance.insert(comments).values({ slug, author: authorValue, body, parentId, dailyId, tripcode }).returning();
    return NextResponse.json({ data: row }, { status: 201 });
  } catch {
    // Log error for debugging (in production, use proper logging service)
    return NextResponse.json({ error: 'InternalError' }, { status: 500 });
  }
}

function generateDailyId(request: Request, slug: string): string {
  // 疑似的な日替わりID（IP + 日付 + slug を基にハッシュ化）
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const date = new Date();
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const seed = `${ip}|${y}-${m}-${d}|${slug}`;
  return shortHash(seed);
}

function generateTripcode(request: Request): string {
  // 簡易トリップ（IP + UA）
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const ua = request.headers.get('user-agent') || 'ua';
  return shortHash(`${ip}|${ua}`);
}

function shortHash(input: string): string {
  // Fowler–Noll–Vo variant (超簡易) -> 16進短縮（16桁）
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const n = Math.abs(hash >>> 0).toString(16).padStart(8, '0');
  return (n + n).slice(0, 16);
}

