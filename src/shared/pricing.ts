// Prices in USD per 1M tokens — source: https://docs.anthropic.com/en/docs/about-claude/pricing
export interface ModelPricing {
  input: number
  output: number
  cacheRead: number       // Cache hits & refreshes (0.1x base input)
  cacheWrite5m: number    // 5-minute cache write (1.25x base input)
  cacheWrite1h: number    // 1-hour cache write (2x base input)
}

// Hardcoded defaults — used when no cached pricing is available
export const DEFAULT_PRICING: Record<string, ModelPricing> = {
  'Claude Opus 4.7':   { input: 5,    output: 25,   cacheRead: 0.50,  cacheWrite5m: 6.25,  cacheWrite1h: 10   },
  'Claude Opus 4.6':   { input: 5,    output: 25,   cacheRead: 0.50,  cacheWrite5m: 6.25,  cacheWrite1h: 10   },
  'Claude Opus 4.5':   { input: 5,    output: 25,   cacheRead: 0.50,  cacheWrite5m: 6.25,  cacheWrite1h: 10   },
  'Claude Opus 4.1':   { input: 15,   output: 75,   cacheRead: 1.50,  cacheWrite5m: 18.75, cacheWrite1h: 30   },
  'Claude Opus 4':     { input: 15,   output: 75,   cacheRead: 1.50,  cacheWrite5m: 18.75, cacheWrite1h: 30   },
  'Claude Sonnet 4.6': { input: 3,    output: 15,   cacheRead: 0.30,  cacheWrite5m: 3.75,  cacheWrite1h: 6    },
  'Claude Sonnet 4.5': { input: 3,    output: 15,   cacheRead: 0.30,  cacheWrite5m: 3.75,  cacheWrite1h: 6    },
  'Claude Sonnet 4':   { input: 3,    output: 15,   cacheRead: 0.30,  cacheWrite5m: 3.75,  cacheWrite1h: 6    },
  'Claude Haiku 4.5':  { input: 1,    output: 5,    cacheRead: 0.10,  cacheWrite5m: 1.25,  cacheWrite1h: 2    },
  'Claude Haiku 3.5':  { input: 0.80, output: 4,    cacheRead: 0.08,  cacheWrite5m: 1.00,  cacheWrite1h: 1.60 },
}

// Runtime pricing table — populated from fetched or cached data
let activePricing: Record<string, ModelPricing> = { ...DEFAULT_PRICING }

export function setActivePricing(pricing: Record<string, ModelPricing>): void {
  activePricing = pricing
}

export function getActivePricing(): Record<string, ModelPricing> {
  return activePricing
}

export function getPricing(modelId: string): ModelPricing {
  // Normalize model ID to match pricing table keys
  // modelId looks like "claude-opus-4-6", "claude-sonnet-4-5-20250929" etc.
  const id = modelId.toLowerCase()

  // Try exact match by building a friendly name from the model ID
  for (const [name, pricing] of Object.entries(activePricing)) {
    const normalized = name.toLowerCase().replace(/\s+/g, '-')
    // "Claude Opus 4.6" → "claude-opus-4.6"
    // modelId: "claude-opus-4-6" or "claude-opus-4-6-20260101"
    const nameVersion = normalized.replace('claude-', '')
    // "opus-4.6" — match against "opus-4-6" or "opus-4.6"
    const idClean = id.replace('claude-', '').replace(/-\d{8,}$/, '') // strip date suffix
    // "opus-4-6"

    // Convert dots to dashes for comparison
    if (idClean === nameVersion.replace(/\./g, '-')) return pricing
    // Also try the other way
    if (idClean.replace(/-/g, '.') === nameVersion) return pricing
  }

  // Fuzzy match: find the closest model family + version
  if (/opus/.test(id)) {
    // Check version number
    const verMatch = id.match(/opus-4-?(\d)?/)
    const ver = verMatch?.[1] ? parseInt(verMatch[1]) : 0
    if (ver >= 5) return activePricing['Claude Opus 4.7'] ?? activePricing['Claude Opus 4.6'] ?? activePricing['Claude Opus 4.5'] ?? DEFAULT_PRICING['Claude Opus 4.6']
    return activePricing['Claude Opus 4.1'] ?? DEFAULT_PRICING['Claude Opus 4.1']
  }
  if (/sonnet/.test(id)) {
    return activePricing['Claude Sonnet 4.6'] ?? activePricing['Claude Sonnet 4.5'] ?? DEFAULT_PRICING['Claude Sonnet 4.6']
  }
  if (/haiku/.test(id)) {
    if (/3[.-]5/.test(id)) return activePricing['Claude Haiku 3.5'] ?? DEFAULT_PRICING['Claude Haiku 3.5']
    return activePricing['Claude Haiku 4.5'] ?? DEFAULT_PRICING['Claude Haiku 4.5']
  }

  // Final fallback: sonnet
  return DEFAULT_PRICING['Claude Sonnet 4.6']
}
