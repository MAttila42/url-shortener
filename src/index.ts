import type { Env } from 'bun'
import type { Context } from 'elysia'
import cors from '@elysiajs/cors'
import { Elysia } from 'elysia'

const app = new Elysia({
  strictPath: false,
  aot: false,
})
  .use(cors())
  .get('/', () => 'Hello Elysia')

export default {
  async fetch(
    request: Request,
    _env: Env,
    _ctx: Context,
  ): Promise<Response> {
    return await app.fetch(request)
  },
}
