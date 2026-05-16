import React, { useState } from 'react'
import { useUsageData } from './hooks/useUsageData'
import CostPanel from './components/CostPanel'
import Settings from './components/Settings'

type View = 'panel' | 'settings'

export default function App() {
  const [view, setView] = useState<View>('panel')
  const data = useUsageData()

  if (data.loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Loading…</div>
      </div>
    )
  }

  if (view === 'settings') {
    return (
      <Settings
        monthlyBudget={data.monthlyBudget}
        onBack={() => setView('panel')}
      />
    )
  }

  return (
    <CostPanel
      totalSpentUSD={data.totalSpentUSD}
      monthlyBudget={data.monthlyBudget}
      dailySpending={data.dailySpending}
      currentMonth={data.currentMonth}
      onSettings={() => setView('settings')}
    />
  )
}
