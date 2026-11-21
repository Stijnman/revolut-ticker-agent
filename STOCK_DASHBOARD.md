# Interactive five-stock dashboard

Run `python3 stock_dashboard.py`, then open `http://127.0.0.1:8765`. No paid API key or Python dependencies required.

The dashboard monitors NVDA, DELL, MU, ADI, and HPE using Stooq's **delayed daily historical bars**. It displays the data date, previous-close percentage change, high/low, and watch signals. It **does not** place orders, predict optimal entries, or confirm a stock is available to your Revolut account.

## Optional email

Configure `SMTP_HOST`, `SMTP_PORT` (default 465), `SMTP_USER`, `SMTP_PASSWORD`, and `ALERT_EMAIL` in your local environment. Press **Email snapshot**. Credentials stay local. Never commit them to GitHub. Use a mail-provider app password where supported. Email is opt-in, not yet scheduled.

## Safety and limits

- The server binds to localhost only. No authentication or remote exposure.
- **No live trades or brokerage credentials.** Revolut trading integration is intentionally not claimed: an approved trading API and explicit per-order authorization would be required.
- Stooq data may be delayed, unavailable, or adjusted; prices are **not** executable quotes.
- Any failed quote produces NO DATA / NO SIGNAL, never a fabricated buy signal.
- Watch thresholds are heuristics, not investment advice. This is not an automated investment recommendation.
- Avoid using historical closing prices as market or limit order instructions.
