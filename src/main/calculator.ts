import { getPricing } from '../shared/pricing'
import type { UsageData } from '../shared/types'

export function calculateCost(model: string, usage: UsageData): number {
  const p = getPricing(model)
  const M = 1_000_000

  return (
    (usage.input_tokens * p.input / M) +
    (usage.output_tokens * p.output / M) +
    (usage.cache_read_input_tokens * p.cacheRead / M) +
    (usage.cache_write_5m_tokens * p.cacheWrite5m / M) +
    (usage.cache_write_1h_tokens * p.cacheWrite1h / M)
  )
}
