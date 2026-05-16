import React from 'react'
import type { DailySpending } from '../../shared/types'

interface DailyBreakdownProps {
  dailySpending: DailySpending[]
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DailyBreakdown({ dailySpending }: DailyBreakdownProps) {
  const sorted = [...dailySpending].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14)

  if (sorted.length === 0) {
    return (
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textAlign: 'center', padding: '8px 0' }}>
        No spending recorded yet
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {sorted.map((entry) => (
        <div key={entry.date} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          padding: '3px 0',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{formatDate(entry.date)}</span>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontVariantNumeric: 'tabular-nums' }}>
            ${entry.cost.toFixed(4)}
          </span>
        </div>
      ))}
    </div>
  )
}
