import path from 'node:path';
import { Client } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { PHASE_PRODUCTION_BUILD } from 'next/dist/shared/lib/constants';
import { Env } from '@/shared/libs/Env';
import * as schema from '@/shared/models/Schema';

let client: Client | undefined;
let pgDrizzle: NodePgDatabase<typeof schema> | undefined;

// ビルド時はDB接続を試行しない
if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD && Env.DATABASE_URL) {
  try {
    client = new Client({ connectionString: Env.DATABASE_URL });
    await client.connect();
    pgDrizzle = drizzle(client, { schema });
    if (pgDrizzle) {
      await migrate(pgDrizzle, { migrationsFolder: path.join(process.cwd(), 'migrations') });
    }
  } catch (error) {
    // Development only - will be removed in production
    console.warn('Database connection failed during development:', error);
    // より詳細なエラー情報を出力
    if (error instanceof Error) {
      const errorDetails = {
        message: error.message,
        code: (error as NodeJS.ErrnoException).code,
        errno: (error as NodeJS.ErrnoException).errno,
        syscall: (error as NodeJS.ErrnoException).syscall
      };
      console.warn('Error details:', errorDetails);
    }
  }
}

// データベースインスタンスの取得（遅延初期化）
const getDb = async (): Promise<NodePgDatabase<typeof schema>> => {
  if (pgDrizzle) {
    return pgDrizzle;
  }

  if (!Env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    client = new Client({ connectionString: Env.DATABASE_URL });
    await client.connect();
    pgDrizzle = drizzle(client, { schema });
    return pgDrizzle;
  } catch (error) {
    throw new Error(`Failed to initialize database connection: ${error}`);
  }
};

export const db = {
  // 既存のpgDrizzleがある場合はそれを使用、なければ新しく接続
  get: async () => {
    if (pgDrizzle) {
      return pgDrizzle;
    }
    return await getDb();
  }
};
