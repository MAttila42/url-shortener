import type { Env } from 'bun'
import type { Context } from 'elysia'
import * as crypto from 'node:crypto'
import cors from '@elysiajs/cors'
import { and, eq, lt, ne } from 'drizzle-orm'
import { Elysia, redirect, t } from 'elysia'
import { db, Urls } from './db'

async function createId() {
  let id
  let exists
  do {
    id = crypto.randomBytes(3).toString('base64url')
    const [result] = await db.select().from(Urls).where(eq(Urls.id, id))
    exists = !!result
  } while (exists)
  return id
}

const app = new Elysia({
  strictPath: false,
  aot: false,
})
  .use(cors())
  .get('/:id', async ({ params: { id }, status }) => {
    const [result] = await db.select().from(Urls).where(eq(Urls.id, id))

    if (!result)
      return status(404)

    const ttl = Number(result.ttl)
    if (ttl !== 0 && ttl < Date.now()) {
      await db.delete(Urls).where(eq(Urls.id, id))
      return status(404)
    }

    (async () => await db
      .delete(Urls)
      .where(and(
        lt(Urls.ttl, new Date()),
        ne(Urls.ttl, new Date(0)),
      )))()

    return redirect(result.url)
  })
  .post('/', async ({ body, status, request }) => {
    const ttl = body.ttl
      ? new Date(Date.now() + body.ttl)
      : new Date (0)

    const [{ insertedId }] = await db.insert(Urls).values({
      id: await createId(),
      url: body.url,
      ttl,
    }).returning({ insertedId: Urls.id })
    const url = new URL(request.url)
    return status(201, `${url.origin}/${insertedId}`)
  }, {
    body: t.Object({
      url: t.String(),
      ttl: t.Optional(t.Number()),
    }),
  })

export default {
  async fetch(
    request: Request,
    _env: Env,
    _ctx: Context,
  ): Promise<Response> {
    return await app.fetch(request)
  },
}
