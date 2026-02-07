import process from 'node:process'
import { parseArgs } from 'node:util'

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    minutes: {
      type: 'string',
    },
    hours: {
      type: 'string',
    },
    days: {
      type: 'string',
    },
  },
  allowPositionals: true,
})

const url = positionals[0]

if (!url) {
  console.error('Usage: bun scripts/add-url.ts <url> [--minutes <m>] [--hours <h>] [--days <d>]')
  process.exit(1)
}

const apiUrl = process.env.API_URL
const apiKey = process.env.API_KEY

if (!apiUrl) {
  console.error('Error: API_URL environment variable is not set.')
  process.exit(1)
}

if (!apiKey) {
  console.error('Error: API_KEY environment variable is not set.')
  process.exit(1)
}

let ttlMs = 0
if (values.minutes)
  ttlMs += Number(values.minutes) * 60 * 1000
if (values.hours)
  ttlMs += Number(values.hours) * 60 * 60 * 1000
if (values.days)
  ttlMs += Number(values.days) * 24 * 60 * 60 * 1000

const payload: { url: string, ttl?: number } = { url }

if (ttlMs > 0)
  payload.ttl = ttlMs

async function run() {
  try {
    const response = await fetch(apiUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`)
      const text = await response.text()
      if (text)
        console.error(text)
      process.exit(1)
    }

    const result = await response.text()
    // eslint-disable-next-line no-console
    console.log(result)
  }
  catch (error) {
    console.error('Failed to send request:', error)
    process.exit(1)
  }
}

run()
