import React, { useState, useEffect } from 'react'

interface SettingsProps {
  monthlyBudget: number
  onBack: () => void
}

export default function Settings({ monthlyBudget, onBack }: SettingsProps) {
  const [budget, setBudget] = useState(String(monthlyBudget))
  const [launch, setLaunch] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setBudget(String(monthlyBudget)) }, [monthlyBudget])

  const handleSave = async () => {
    const parsed = parseFloat(budget)
    if (!isNaN(parsed) && parsed > 0) {
      await window.electronAPI.updateBudget(parsed)
    }
    await window.electronAPI.setLaunchAtLogin(launch)
    setSaved(true)
    setTimeout(() => { setSaved(false); onBack() }, 800)
  }

  const handleResetMonth = async () => {
    if (!confirmReset) { setConfirmReset(true); return }
    await window.electronAPI.resetMonth()
    setConfirmReset(false)
    onBack()
  }

  const handleClearAll = async () => {
    if (!confirmClear) { setConfirmClear(true); return }
    await window.electronAPI.clearAllData()
    setConfirmClear(false)
    onBack()
  }

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={onBack} style={backBtnStyle}>←</button>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Settings</span>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Monthly Budget (USD)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>$</span>
          <input
            type="number"
            value={budget}
            min="1"
            step="1"
            onChange={e => setBudget(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={labelStyle}>Launch at login</span>
        <button onClick={() => setLaunch(v => !v)} style={{ ...toggleStyle, backgroundColor: launch ? '#6d28d9' : 'rgba(255,255,255,0.1)' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', transform: launch ? 'translateX(16px)' : 'translateX(0)', transition: 'transform 0.2s ease' }} />
        </button>
      </div>

      <button onClick={handleSave} style={saveBtnStyle}>
        {saved ? '✓ Saved' : 'Save Settings'}
      </button>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '4px' }}>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0 0 10px' }}>DANGER ZONE</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={handleResetMonth} style={dangerBtnStyle}>
            {confirmReset ? '⚠ Confirm reset month?' : 'Reset current month'}
          </button>
          <button onClick={handleClearAll} style={{ ...dangerBtnStyle, borderColor: 'rgba(248,113,113,0.4)', color: '#f87171' }}>
            {confirmClear ? '⚠ Confirm clear ALL data?' : 'Clear all data'}
          </button>
        </div>
      </div>
    </div>
  )
}

const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px' }
const labelStyle: React.CSSProperties = { fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }
const inputStyle: React.CSSProperties = { flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '14px', padding: '6px 10px', outline: 'none' }
const saveBtnStyle: React.CSSProperties = { background: '#6d28d9', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: '10px' }
const dangerBtnStyle: React.CSSProperties = { background: 'none', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '8px', color: '#fbbf24', cursor: 'pointer', fontSize: '12px', padding: '8px' }
const backBtnStyle: React.CSSProperties = { background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }
const toggleStyle: React.CSSProperties = { width: '36px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }
