export interface UsageData {
  input_tokens: number
  output_tokens: number
  cache_read_input_tokens: number
  cache_write_5m_tokens: number
  cache_write_1h_tokens: number
}

export interface DailySpending {
  date: string // YYYY-MM-DD
  cost: number
}

export interface ResetRecord {
  month: string // YYYY-MM
  totalSpent: number
  dailySpending: DailySpending[]
  resetAt: string // ISO date
}

export interface StoreSchema {
  monthlyBudget: number
  currentMonth: string // YYYY-MM
  totalSpentUSD: number
  dailySpending: DailySpending[]
  lastProcessedOffsets: Record<string, number>
  resetHistory: ResetRecord[]
}

export interface UsageUpdate {
  totalSpentUSD: number
  monthlyBudget: number
  dailySpending: DailySpending[]
  currentMonth: string
}
