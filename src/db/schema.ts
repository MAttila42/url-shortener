import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const Urls = sqliteTable('urls', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  ttl: integer('ttl', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(current_timestamp)`),
})
