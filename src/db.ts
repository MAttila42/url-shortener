import process from 'node:process'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

const isDev = process.env.NODE_ENV !== 'development'

export const db = drizzle({
  connection: {
    url: isDev
      ? process.env.DATABASE_URL_LOCAL!
      : process.env.DATABASE_URL_REMOTE!,
    authToken: process.env.DATABASE_AUTH_TOKEN || 'N/A',
  },
})

export const Urls = sqliteTable('urls', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  ttl: integer('ttl', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(current_timestamp)`),
})
