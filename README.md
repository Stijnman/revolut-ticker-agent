# Revolut Ticker Agent

Browser extension that detects stock tickers on **Revolut Invest** pages, fetches Finnhub quotes, and shows range-based signals plus optional AI co-pilot UI modules.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

- Automatic ticker detection on Revolut pages
- Real-time Finnhub quotes (rate-limited)
- Buy / caution / neutral range signals
- Popup, alerts UI, portfolio dashboard
- Optional UI modules: AI co-pilot, news sentiment (`ui/`)
- API key stored in `chrome.storage.local` (not committed)

## Install (unpacked)

1. Clone this repository
2. Open `chrome://extensions` (or Edge equivalent)
3. Enable **Developer mode** → **Load unpacked** → select this folder
4. Set your Finnhub API key (see below)
5. Open a Revolut Invest page

## Configure API key

Get a free key at [finnhub.io](https://finnhub.io). Then in the extension service worker console or a small options page message:

```js
chrome.storage.local.set({ finnhubApiKey: "YOUR_KEY" })
```

Or send a message: `{ type: "SET_API_KEY", key: "YOUR_KEY" }`.

## Signal logic

`position = (current - low) / (high - low)`

| Position | Signal |
|----------|--------|
| ≤ 35% of day range | buy (near low) |
| ≥ 65% | caution (near high) |
| else | neutral |

## Related

- [revolut-ticker-ai-assistant](https://github.com/Stijnman/revolut-ticker-ai-assistant) — sister package with the same core

## Disclaimer

Not financial advice. For research/education only.

## License

MIT © 2026 Stijnman
