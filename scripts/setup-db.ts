import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import { createClient } from '@libsql/client'

function fileDbUrlToFsPath(dbUrl: string): string {
  if (!dbUrl.startsWith('file:'))
    throw new Error(`Expected file: URL, got: ${dbUrl}`)

  const rest = dbUrl.slice('file:'.length)

  if (rest.startsWith('/'))
    return fileURLToPath(new URL(dbUrl))

  if (rest.startsWith('//'))
    return fileURLToPath(new URL(dbUrl))

  const decoded = decodeURIComponent(rest)
  if (path.isAbsolute(decoded) || /^[a-z]:[\\/]/i.test(decoded))
    return path.resolve(decoded)

  return path.resolve(process.cwd(), decoded)
}

const url = process.env.DATABASE_URL_LOCAL
if (!url)
  throw new Error('Missing DATABASE_URL_LOCAL')

if (!url.startsWith('file:'))
  throw new Error(`DATABASE_URL_LOCAL must start with "file:", got: ${url}`)

const filePath = fileDbUrlToFsPath(url)
const dir = path.dirname(filePath)
fs.mkdirSync(dir, { recursive: true })

const client = createClient({ url })
await client.execute('SELECT 1')
client.close()

// eslint-disable-next-line no-console
console.log(`Local SQLite DB ready at: ${filePath}`)
