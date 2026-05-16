import { checkAutoReset } from './store'

let intervalId: ReturnType<typeof setInterval> | null = null

export function startScheduler(onReset?: () => void): void {
  // Check immediately on startup
  const didReset = checkAutoReset()
  if (didReset && onReset) onReset()

  // Then check every hour
  intervalId = setInterval(() => {
    const reset = checkAutoReset()
    if (reset && onReset) onReset()
  }, 60 * 60 * 1000)
}

export function stopScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
