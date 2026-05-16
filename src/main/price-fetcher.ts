import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as https from 'https'
import { ModelPricing, DEFAULT_PRICING, setActivePricing } from '../shared/pricing'

const PRICING_CACHE_PATH = path.join(os.homedir(), '.claude-limits-panel-pricing.json')
const PRICING_URL = 'https://platform.claude.com/docs/en/about-claude/pricing'

interface CachedPricing {
  fetchedAt: string
  pricing: Record<string, ModelPricing>
}

function loadCachedPricing(): Record<string, ModelPricing> | null {
  try {
    const raw = fs.readFileSync(PRICING_CACHE_PATH, 'utf8')
    const cached: CachedPricing = JSON.parse(raw)
    if (cached.pricing && Object.keys(cached.pricing).length > 0) {
      return cached.pricing
    }
  } catch {}
  return null
}

function saveCachedPricing(pricing: Record<string, ModelPricing>): void {
  const data: CachedPricing = {
    fetchedAt: new Date().toISOString(),
    pricing,
  }
  try {
    fs.writeFileSync(PRICING_CACHE_PATH, JSON.stringify(data, null, 2), 'utf8')
  } catch (err) {
    console.error('[price-fetcher] Failed to save cache:', err)
  }
}

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const doRequest = (requestUrl: string, redirects = 0) => {
      if (redirects > 3) { reject(new Error('Too many redirects')); return }

      const urlObj = new URL(requestUrl)
      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: { 'User-Agent': 'ClaudeLimitsPanel/1.0' },
        timeout: 10000,
      }

      const req = https.request(options, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let redirectUrl = res.headers.location
          if (redirectUrl.startsWith('/')) {
            redirectUrl = `https://${urlObj.hostname}${redirectUrl}`
          }
          doRequest(redirectUrl, redirects + 1)
          return
        }
        if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return }

        let body = ''
        res.on('data', (chunk: Buffer) => body += chunk.toString())
        res.on('end', () => resolve(body))
      })

      req.on('error', reject)
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
      req.end()
    }

    doRequest(url)
  })
}

function parsePricingFromHtml(html: string): Record<string, ModelPricing> | null {
  const result: Record<string, ModelPricing> = {}

  // HTML format: <td>Claude Opus 4.7</td><td>$5 / MTok</td><td>$6.25 / MTok</td>...
  // Match table rows with 5 price columns: Base Input | 5m Cache Write | 1h Cache Write | Cache Read | Output
  const rowRegex = /<td[^>]*>(Claude\s+(?:Opus|Sonnet|Haiku)\s+[\d.]+)[^<]*<\/td>\s*<td[^>]*>\$([0-9.]+)\s*\/\s*MTok<\/td>\s*<td[^>]*>\$([0-9.]+)\s*\/\s*MTok<\/td>\s*<td[^>]*>\$([0-9.]+)\s*\/\s*MTok<\/td>\s*<td[^>]*>\$([0-9.]+)\s*\/\s*MTok<\/td>\s*<td[^>]*>\$([0-9.]+)\s*\/\s*MTok<\/td>/gi

  let match
  while ((match = rowRegex.exec(html)) !== null) {
    const modelName = match[1].trim()
    const baseInput = parseFloat(match[2])
    const cacheWrite5m = parseFloat(match[3])
    const cacheWrite1h = parseFloat(match[4])
    const cacheRead = parseFloat(match[5])
    const output = parseFloat(match[6])

    if (!isNaN(baseInput) && !isNaN(output)) {
      result[modelName] = {
        input: baseInput,
        output,
        cacheRead,
        cacheWrite5m,
        cacheWrite1h,
      }
    }
  }

  return Object.keys(result).length > 0 ? result : null
}

export async function initPricing(): Promise<void> {
  // 1. Try to load cached pricing first (instant, no network)
  const cached = loadCachedPricing()
  if (cached) {
    setActivePricing(cached)
    console.log('[price-fetcher] Loaded cached pricing from disk')
  } else {
    setActivePricing({ ...DEFAULT_PRICING })
    console.log('[price-fetcher] Using hardcoded default pricing')
  }

  // 2. Try to fetch fresh pricing in the background
  try {
    const html = await fetchUrl(PRICING_URL)
    const freshPricing = parsePricingFromHtml(html)

    if (freshPricing) {
      setActivePricing(freshPricing)
      saveCachedPricing(freshPricing)
      console.log(`[price-fetcher] Fetched fresh pricing (${Object.keys(freshPricing).length} models)`)
    } else {
      console.log('[price-fetcher] Could not parse pricing from page — keeping current pricing')
    }
  } catch (err) {
    console.log('[price-fetcher] Network unavailable or URL changed — keeping current pricing')
  }
}
