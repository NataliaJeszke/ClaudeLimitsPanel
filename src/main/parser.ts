import * as fs from 'fs'
import type { UsageData } from '../shared/types'

export interface ParsedUsage {
  model: string
  usage: UsageData
  date: string // YYYY-MM-DD
}

export interface ParseResult {
  entries: ParsedUsage[]
  newOffset: number
}

export function parseNewLines(filePath: string, fromOffset: number): ParseResult {
  const entries: ParsedUsage[] = []

  let stat: fs.Stats
  try {
    stat = fs.statSync(filePath)
  } catch {
    return { entries, newOffset: fromOffset }
  }

  const fileSize = stat.size
  if (fileSize <= fromOffset) {
    return { entries, newOffset: fromOffset }
  }

  const fd = fs.openSync(filePath, 'r')
  const bufferSize = fileSize - fromOffset
  const buffer = Buffer.alloc(bufferSize)

  try {
    fs.readSync(fd, buffer, 0, bufferSize, fromOffset)
  } finally {
    fs.closeSync(fd)
  }

  const text = buffer.toString('utf8')
  const lines = text.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    try {
      const data = JSON.parse(trimmed)

      if (data.type !== 'assistant') continue
      const message = data.message
      if (!message?.usage) continue

      const model: string = message.model ?? 'unknown'
      const usage = message.usage
      const cacheCreation = usage.cache_creation ?? {}

      // Extract date from entry timestamp, fall back to today
      let date: string
      try {
        const ts = new Date(data.timestamp)
        date = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}-${String(ts.getDate()).padStart(2, '0')}`
      } catch {
        const now = new Date()
        date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      }

      entries.push({
        model,
        date,
        usage: {
          input_tokens: usage.input_tokens ?? 0,
          output_tokens: usage.output_tokens ?? 0,
          cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
          cache_write_5m_tokens: cacheCreation.ephemeral_5m_input_tokens ?? 0,
          cache_write_1h_tokens: cacheCreation.ephemeral_1h_input_tokens ?? 0,
        }
      })
    } catch {
      // Skip malformed lines
    }
  }

  return { entries, newOffset: fileSize }
}
