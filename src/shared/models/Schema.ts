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

// 記事評価の投票テーブル
// 1日1票/日替わりID(dailyId)をユニーク制約で保証する
export const postRatingVotes = pgTable('post_rating_votes', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  // 'up' | 'down'
  voteValue: varchar('vote_value', { length: 8 }).notNull(),
  dailyId: varchar('daily_id', { length: 16 }).notNull(),
  tripcode: varchar('tripcode', { length: 16 }).notNull(),
  // YYYY-MM-DD（UTC）を格納してユニーク判定に使用
  voteDay: varchar('vote_day', { length: 10 }).notNull(),
  votedAt: timestamp('voted_at', { mode: 'date' }).defaultNow().notNull(),
});