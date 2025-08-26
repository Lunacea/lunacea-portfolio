import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  author: varchar('author', { length: 80 }).notNull(),
  // 5ch風の簡易識別情報
  dailyId: varchar('daily_id', { length: 16 }).notNull(),
  tripcode: varchar('tripcode', { length: 16 }).notNull(),
  // スレッド（親コメント）
  parentId: integer('parent_id'),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
