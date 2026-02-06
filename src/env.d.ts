declare module 'bun' {
  interface Env {
    NODE_ENV: string
    DATABASE_URL_LOCAL: string
    DATABASE_URL_REMOTE: string
    DATABASE_AUTH_TOKEN: string
    AUTH_SECRET: string
  }
}
