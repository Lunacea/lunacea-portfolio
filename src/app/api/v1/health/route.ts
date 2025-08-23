import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const traceId = crypto.randomUUID();
  return NextResponse.json(
    {
      status: 'ok',
      traceId,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': 'https://lunacea.jp',
      },
    },
  );
}
