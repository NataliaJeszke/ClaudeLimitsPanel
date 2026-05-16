import { useState, useEffect } from 'react'
import type { UsageUpdate } from '../../shared/types'

interface UseUsageDataReturn extends UsageUpdate {
  loading: boolean
}

declare global {
  interface Window {
    electronAPI: {
      getUsageData: () => Promise<UsageUpdate>
      updateBudget: (budget: number) => Promise<boolean>
      resetMonth: () => Promise<boolean>
      clearAllData: () => Promise<boolean>
      setLaunchAtLogin: (value: boolean) => Promise<boolean>
      onUsageUpdate: (callback: (data: UsageUpdate) => void) => void
      removeUsageUpdateListener: () => void
    }
  }
}

export function useUsageData(): UseUsageDataReturn {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<UsageUpdate>({
    totalSpentUSD: 0,
    monthlyBudget: 100,
    dailySpending: [],
    currentMonth: '',
  })

  useEffect(() => {
    window.electronAPI.getUsageData().then((d) => {
      setData(d)
      setLoading(false)
    })
    window.electronAPI.onUsageUpdate((d) => setData(d))
    return () => window.electronAPI.removeUsageUpdateListener()
  }, [])

  return { ...data, loading }
}
