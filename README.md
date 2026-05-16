# Claude Limits Panel

A macOS menu bar app for monitoring [Claude Code](https://claude.ai/code) API spending in real-time.

![macOS](https://img.shields.io/badge/macOS-000000?style=flat&logo=apple&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-47848F?style=flat&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

## Features

- Real-time tracking of Claude Code API token usage and costs
- Monthly budget with color-coded progress bar (green → yellow → red)
- 14-day spending history breakdown
- Live pricing fetched from Anthropic docs (with offline cache fallback)
- Automatic monthly reset
- Customizable monthly budget limit

## How It Works

The app watches `~/.claude/projects/**/*.jsonl` — the session log files written by Claude Code. For each new entry it:

1. Parses token counts (input, output, cache read/write) and the model used
2. Calculates cost using live pricing from Anthropic (or a local cache)
3. Aggregates spending per day and stores it in `~/.claude-limits-panel.json`
4. Sends an update to the React UI via Electron IPC

The menu bar icon reflects current state at a glance. Clicking it opens the panel with today's spending, the monthly total, and the daily breakdown.

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop framework | [Electron](https://www.electronjs.org/) 34 |
| UI | [React](https://react.dev/) 19 + TypeScript |
| Bundler | [Vite](https://vitejs.dev/) 8 |
| Menu bar | [menubar](https://github.com/maxogden/menubar) |
| File watching | [chokidar](https://github.com/paulmillr/chokidar) |
| Persistence | [electron-store](https://github.com/sindresorhus/electron-store) |
| Packaging | [electron-builder](https://www.electron.build/) |

## Getting Started

### Prerequisites

- macOS
- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

Opens the app with Vite HMR. The Electron window reflects React changes instantly.

### Run packaged (without building DMG)

```bash
npm run build
npm run preview
```

## Building the Installer

To create a `.dmg` installer for macOS:

```bash
npm run build
npm run package
```

The output will be in the `release/` directory:

```
release/
└── Claude Limits Panel-1.0.0.dmg
```

Double-click the DMG, drag the app to Applications, and launch it from there. The app will appear in the menu bar.

> **Note:** The app is not code-signed. On first launch macOS may block it — go to **System Settings → Privacy & Security** and click **Open Anyway**.

## Project Structure

```
src/
├── main/               # Electron main process
│   ├── index.ts        # App init, menubar setup, IPC handlers
│   ├── preload.ts      # Context bridge (main ↔ renderer)
│   ├── watcher.ts      # Watches .jsonl files for new entries
│   ├── parser.ts       # Parses Claude Code session logs
│   ├── calculator.ts   # Calculates cost from token usage
│   ├── scheduler.ts    # Monthly auto-reset scheduler
│   ├── store.ts        # Persistent data (electron-store)
│   └── price-fetcher.ts# Fetches live pricing from Anthropic
├── renderer/           # React UI
│   ├── App.tsx
│   └── components/
│       ├── CostPanel.tsx
│       ├── ProgressBar.tsx
│       ├── DailyBreakdown.tsx
│       └── Settings.tsx
└── shared/
    ├── types.ts
    └── pricing.ts
```

## Data Files

| File | Purpose |
|---|---|
| `~/.claude-limits-panel.json` | Spending data and budget settings |
| `~/.claude-limits-panel-pricing.json` | Cached pricing from Anthropic |

## License

ISC
