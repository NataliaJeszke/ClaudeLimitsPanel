import React, { useState } from 'react'
import ProgressBar from './ProgressBar'
import DailyBreakdown from './DailyBreakdown'
import type { DailySpending } from '../../shared/types'

interface CostPanelProps {
  totalSpentUSD: number
  monthlyBudget: number
  dailySpending: DailySpending[]
  currentMonth: string
  onSettings: () => void
}

export default function CostPanel({
  totalSpentUSD,
  monthlyBudget,
  dailySpending,
  currentMonth,
  onSettings
}: CostPanelProps) {
  const [showHistory, setShowHistory] = useState(false)
  const remaining = Math.max(0, monthlyBudget - totalSpentUSD)
  const percent = monthlyBudget > 0 ? (totalSpentUSD / monthlyBudget) * 100 : 0

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const todayEntry = dailySpending.find(d => d.date === todayStr)
  const todaySpent = todayEntry?.cost ?? 0

  const monthLabel = (() => {
    if (!currentMonth) return ''
    const [year, month] = currentMonth.split('-').map(Number)
    const date = new Date(year, month - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  })()

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {monthLabel}
        </span>
        <button onClick={onSettings} style={iconBtnStyle} title="Settings">
          ⚙
        </button>
      </div>

      {/* Main spending display */}
      <div style={{ textAlign: 'center', padding: '4px 0' }}>
        <div style={{ fontSize: '32px', fontWeight: '700', color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
          ${totalSpentUSD.toFixed(2)}
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
          of ${monthlyBudget.toFixed(2)} budget
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar value={percent} />

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Remaining</div>
          <div style={statValueStyle}>${remaining.toFixed(2)}</div>
        </div>
        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Today</div>
          <div style={statValueStyle}>${todaySpent.toFixed(4)}</div>
        </div>
        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Used</div>
          <div style={statValueStyle}>{percent.toFixed(1)}%</div>
        </div>
      </div>

      {/* History toggle */}
      <button
        onClick={() => setShowHistory(v => !v)}
        style={toggleBtnStyle}
      >
        {showHistory ? '▲ Hide history' : '▼ Daily history'}
      </button>

      {showHistory && (
        <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
          <DailyBreakdown dailySpending={dailySpending} />
        </div>
      )}
    </div>
  )
}

const statBoxStyle: React.CSSProperties = {
  flex: 1,
  textAlign: 'center',
  padding: '8px 4px',
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderRadius: '8px',
  margin: '0 3px',
}

const statLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '3px',
}

const statValueStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '600',
  color: 'rgba(255,255,255,0.9)',
  fontVariantNumeric: 'tabular-nums',
}

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.5)',
  cursor: 'pointer',
  fontSize: '16px',
  padding: '2px 4px',
  borderRadius: '4px',
}

const toggleBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.4)',
  cursor: 'pointer',
  fontSize: '11px',
  padding: '2px 0',
  textAlign: 'left',
}
