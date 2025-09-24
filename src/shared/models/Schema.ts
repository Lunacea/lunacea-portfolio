import { boolean, index, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

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

// ブログ記事テーブル（ISR移行用）
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  content: text('content').notNull(), // MDXコンテンツ
  contentHtml: text('content_html'), // 変換済みHTML（キャッシュ用）
  excerpt: text('excerpt'),
  tags: text('tags').array(), // PostgreSQL配列
  publishedAt: timestamp('published_at', { mode: 'date' }),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  
  // ステータス管理
  status: varchar('status', { length: 20 }).notNull().default('draft'), // 'draft' | 'published' | 'archived'
  isPublished: boolean('is_published').default(false).notNull(),
  
  // メタデータ
  readingTime: integer('reading_time'), // 分単位
  viewCount: integer('view_count').default(0).notNull(),
  
  // 画像・OGP
  coverImage: varchar('cover_image', { length: 500 }),
  ogImage: varchar('og_image', { length: 500 }),
  
  // 作成者情報（Clerk User ID）
  authorId: varchar('author_id', { length: 255 }).notNull(),
  
  // SEO
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
}, (table) => ({
  slugIdx: index('blog_posts_slug_idx').on(table.slug),
  statusIdx: index('blog_posts_status_idx').on(table.status),
  publishedAtIdx: index('blog_posts_published_at_idx').on(table.publishedAt),
  authorIdx: index('blog_posts_author_idx').on(table.authorId),
}));

// 下書き・バージョン管理用テーブル
export const blogPostVersions = pgTable('blog_post_versions', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  createdBy: varchar('created_by', { length: 255 }).notNull(), // Clerk User ID
}, (table) => ({
  postVersionIdx: index('blog_post_versions_post_version_idx').on(table.postId, table.version),
}));