import chokidar, { FSWatcher } from 'chokidar'
import { homedir } from 'os'
import path from 'path'
import { parseNewLines } from './parser'
import { calculateCost } from './calculator'
import { addSpending, getLastProcessedOffset, setLastProcessedOffset } from './store'

const CLAUDE_PROJECTS = path.join(homedir(), '.claude', 'projects')

let watcher: FSWatcher | null = null
let onUpdateCallback: (() => void) | null = null

function processFile(filePath: string): void {
  if (!filePath.endsWith('.jsonl')) return

  // Skip subagent directories — only process top-level <project>/<session>.jsonl
  const relative = path.relative(CLAUDE_PROJECTS, filePath)
  const parts = relative.split(path.sep)
  if (parts.length !== 2) return

  try {
    const offset = getLastProcessedOffset(filePath)
    const result = parseNewLines(filePath, offset)

    if (result.newOffset <= offset) return

    let totalCost = 0
    for (const entry of result.entries) {
      totalCost += calculateCost(entry.model, entry.usage)
    }

    if (totalCost > 0) {
      addSpending(totalCost)
      console.log(`[watcher] +$${totalCost.toFixed(4)} from ${parts[1]}`)
      if (onUpdateCallback) onUpdateCallback()
    }

    setLastProcessedOffset(filePath, result.newOffset)
  } catch (err) {
    console.error('[watcher] Error processing file:', filePath, err)
  }
}

export function startWatcher(onUpdate: () => void): void {
  onUpdateCallback = onUpdate

  watcher = chokidar.watch(`${CLAUDE_PROJECTS}/**/*.jsonl`, {
    persistent: true,
    ignoreInitial: false,
    usePolling: true,
    interval: 2000,
    depth: 1, // only <project>/<file>.jsonl — skip deeper subdirs
  })

  watcher.on('add', processFile)
  watcher.on('change', processFile)
  watcher.on('error', (err) => console.error('[watcher] Error:', err))
}

export function stopWatcher(): void {
  if (watcher) {
    watcher.close()
    watcher = null
  }
}
