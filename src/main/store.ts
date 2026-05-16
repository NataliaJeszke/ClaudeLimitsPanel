import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import type { StoreSchema, DailySpending, ResetRecord } from '../shared/types'

const STORE_PATH = path.join(os.homedir(), '.claude-limits-panel.json')

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getToday(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const DEFAULT: StoreSchema = {
  monthlyBudget: 100,
  currentMonth: getCurrentMonth(),
  totalSpentUSD: 0,
  dailySpending: [],
  lastProcessedOffsets: {},
  resetHistory: [],
  launchAtLogin: false,
}

function load(): StoreSchema {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    // Strip legacy fields from old store
    const { userType, subscriptionPlan, ...rest } = parsed
    return { ...DEFAULT, ...rest }
  } catch {
    return { ...DEFAULT }
  }
}

function save(data: StoreSchema): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8')
}

export function checkAutoReset(): boolean {
  const data = load()
  const current = getCurrentMonth()
  if (data.currentMonth !== current) {
    const record: ResetRecord = {
      month: data.currentMonth,
      totalSpent: data.totalSpentUSD,
      dailySpending: data.dailySpending,
      resetAt: new Date().toISOString(),
    }
    save({ ...data, currentMonth: current, totalSpentUSD: 0, dailySpending: [], resetHistory: [...data.resetHistory, record] })
    return true
  }
  return false
}

export function addSpending(amount: number): void {
  if (amount <= 0) return
  const data = load()
  const today = getToday()
  const daily = [...data.dailySpending]
  const idx = daily.findIndex(d => d.date === today)
  if (idx >= 0) {
    daily[idx] = { ...daily[idx], cost: daily[idx].cost + amount }
  } else {
    daily.push({ date: today, cost: amount })
  }
  save({ ...data, totalSpentUSD: data.totalSpentUSD + amount, dailySpending: daily })
}

export function getLastProcessedOffset(filePath: string): number {
  return load().lastProcessedOffsets[filePath] ?? 0
}

export function setLastProcessedOffset(filePath: string, offset: number): void {
  const data = load()
  save({ ...data, lastProcessedOffsets: { ...data.lastProcessedOffsets, [filePath]: offset } })
}

export function resetMonth(): void {
  const data = load()
  const record: ResetRecord = {
    month: data.currentMonth,
    totalSpent: data.totalSpentUSD,
    dailySpending: data.dailySpending,
    resetAt: new Date().toISOString(),
  }
  save({ ...data, currentMonth: getCurrentMonth(), totalSpentUSD: 0, dailySpending: [], resetHistory: [...data.resetHistory, record] })
}

export function clearAllData(): void {
  save({ ...DEFAULT, currentMonth: getCurrentMonth() })
}

export function getStoreData() {
  const data = load()
  return {
    totalSpentUSD: data.totalSpentUSD,
    monthlyBudget: data.monthlyBudget,
    dailySpending: data.dailySpending,
    currentMonth: data.currentMonth,
  }
}

export function setMonthlyBudget(budget: number): void {
  save({ ...load(), monthlyBudget: budget })
}

export function setLaunchAtLogin(value: boolean): void {
  save({ ...load(), launchAtLogin: value })
}
