# Revolut Ticker Agent - Browser Extension

A browser extension that detects stock tickers on Revolut Invest pages and provides real-time investment signals.

## Features

- **Automatic Ticker Detection**: Scans Revolut pages for stock symbols
- **Real-time Data**: Fetches latest price, daily low/high from Finnhub API
- **Smart Indicators**: Shows green (good) or red (caution) indicators based on price position
- **AI Investment Co-Pilot**: Instant thesis generation with confidence scores and recommended actions
- **Smart Alert System**: Custom price targets, signal flips, volume spikes with notifications
- **News Sentiment Overlay**: Real-time sentiment badges and summaries
- **Portfolio Health Dashboard**: Aggregated view of tracked tickers
- **Persistent Memory & Learning**: GROKAI improves over time based on historical performance
- **Rate Limiting & Security**: 1.5s between API calls, API key never exposed

## Installation

1. Clone or download this repository
2. Go to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `revolut-ticker-agent` folder

## Configuration

1. Get a free API key from [Finnhub](https://finnhub.io)
2. Open `background.js` and replace `YOUR_FINNHUB_API_KEY_HERE` with your actual key
3. Reload the extension

## How It Works

1. Extension detects ticker symbols on Revolut pages
2. Sends ticker to Finnhub API (rate-limited)
3. Calculates position in daily range: `(current - low) / (high - low)`
4. Shows **green** if price is in bottom 35% of range (closer to low = potential buy)
5. Shows **red** if price is in top 65% of range (closer to high = caution)
6. AI Co-Pilot generates thesis on demand
7. Alerts trigger notifications when conditions met
8. Stores results in persistent memory for future reference and learning

## Autonomous Features

- Full sprint state machine for self-managed development
- Autonomous testing and auto-adjustment
- Self-improving AI logic via GROKAI

## Files

- `manifest.json` - Extension configuration (Manifest V3)
- `background.js` - API calls, rate limiting, memory, AI thesis generation
- `content.js` - Ticker detection, indicators, AI Co-Pilot integration
- `ui/ai-copilot.js` - AI Investment Co-Pilot UI and logic
- `ui/news-sentiment.js` - News Sentiment Overlay
- `popup.html/js` - Status popup
- `dashboard.html/js` - Portfolio dashboard
- `alerts.html/js` - Alert management
- `core/sprint-state-machine.js` - Autonomous sprint executor
- `testing/autonomous-test-runner.js` - Self-testing framework
- `README.md` - This file

## Rate Limiting

- 1.5 seconds between API calls
- Uses cached data when available (5-minute cache)

## Security

- API key stored only in background script (never exposed to content scripts)
- All data stored locally in browser storage
- No external tracking or data exfiltration

---

**Version 1.0.0** | Built autonomously by 4-agent ecosystem | 2026-05-18

**Repository**: https://github.com/Stijnman/revolut-ticker-agent