import React from 'react'

interface ProgressBarProps {
  value: number // 0-100
}

export default function ProgressBar({ value }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  const getColor = () => {
    if (clamped < 50) return '#34d399' // green
    if (clamped < 80) return '#fbbf24' // yellow
    return '#f87171' // red
  }

  return (
    <div style={{
      width: '100%',
      height: '8px',
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: '4px',
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${clamped}%`,
        height: '100%',
        backgroundColor: getColor(),
        borderRadius: '4px',
        transition: 'width 0.4s ease, background-color 0.4s ease',
      }} />
    </div>
  )
}
