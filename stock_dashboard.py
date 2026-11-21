"""Local, dependency-free research dashboard. No brokerage order submission."""
import csv
import html
import io
import json
import os
import smtplib
import ssl
import time
from datetime import datetime, timezone
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import URLError
from urllib.request import Request, urlopen

TICKERS = ("NVDA", "DELL", "MU", "ADI", "HPE")
CACHE = {}
CACHE_SECONDS = 900
PORT = int(os.getenv("DASHBOARD_PORT", "8765"))
WATCH = {symbol: {"drop_pct": 3.0, "rise_pct": 5.0} for symbol in TICKERS}

def quote(symbol):
    if symbol not in TICKERS:
        raise ValueError("Unsupported symbol")
    cached = CACHE.get(symbol)
    if cached and time.monotonic() - cached[0] < CACHE_SECONDS:
        return cached[1]
    req = Request("https://stooq.com/q/d/l/?s=" + symbol.lower() + ".us&i=d", headers={"User-Agent": "StockResearchDashboard/1.0"})
    with urlopen(req, timeout=12) as response:
        data = response.read(1_000_000).decode("utf-8")
    rows = list(csv.DictReader(io.StringIO(data)))
    valid = [r for r in rows if r.get("Close") and r["Close"] != "N/D"]
    if len(valid) < 2:
        raise ValueError("Insufficient price history")
    latest, previous = valid[-1], valid[-2]
    price, prior = float(latest["Close"]), float(previous["Close"])
    if price <= 0 or prior <= 0:
        raise ValueError("Invalid price")
    result = {"symbol": symbol, "date": latest["Date"], "close": price,
              "previous_close": prior, "change_pct": round((price / prior - 1) * 100, 2),
              "day_low": float(latest["Low"]), "day_high": float(latest["High"]),
              "volume": int(float(latest["Volume"])), "source": "Stooq daily bars",
              "delayed": True, "fetched_utc": datetime.now(timezone.utc).isoformat()}
    CACHE[symbol] = (time.monotonic(), result)
    return result

def classify(q):
    if q["change_pct"] <= -WATCH[q["symbol"]]["drop_pct"]:
        return "WATCH DIP — not a buy instruction"
    if q["change_pct"] >= WATCH[q["symbol"]]["rise_pct"]:
        return "WATCH MOMENTUM — not a buy instruction"
    return "WAIT"

def send_email(subject, body):
    required = ("SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "ALERT_EMAIL")
    missing = [key for key in required if not os.getenv(key)]
    if missing:
        return {"sent": False, "reason": "Missing: " + ", ".join(missing)}
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = os.environ["SMTP_USER"]
    msg["To"] = os.environ["ALERT_EMAIL"]
    msg.set_content(body)
    with smtplib.SMTP_SSL(os.environ["SMTP_HOST"], int(os.getenv("SMTP_PORT", "465")),
                         timeout=15, context=ssl.create_default_context()) as smtp:
        smtp.login(os.environ["SMTP_USER"], os.environ["SMTP_PASSWORD"])
        smtp.send_message(msg)
    return {"sent": True}

def snapshot():
    rows = []
    for symbol in TICKERS:
        try:
            q = quote(symbol)
            q["signal"] = classify(q)
            rows.append(q)
        except (URLError, TimeoutError, ValueError, OSError) as exc:
            rows.append({"symbol": symbol, "error": str(exc), "signal": "NO DATA — NO SIGNAL"})
    return rows

PAGE = """<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Revolut Stock Research</title>
<style>body{font:16px system-ui;background:#101827;color:#e7eef8;max-width:1100px;margin:35px auto;padding:16px}
button{background:#39c5bb;color:#07131c;border:0;border-radius:8px;padding:12px;cursor:pointer}
table{width:100%;border-collapse:collapse}td,th{padding:12px;border-bottom:1px solid #334155;text-align:left}
small{color:#a6b5c9}.error{color:#ff8d8d}</style>
<h1>Five-stock research dashboard</h1>
<p>NVDA · DELL · MU · ADI · HPE</p>
<p><strong>Research only.</strong> Delayed daily closes; not live executable Revolut prices.
No automatic purchases. Confirm availability and orders in Revolut.</p>
<button onclick="load()">Refresh prices</button> <button onclick="email()">Email snapshot</button>
<p id="status"></p><div id="results"></div>
<script>
async function load(){
 const status=document.getElementById('status');status.textContent='Loading…';
 try {const r=await fetch('/api/quotes');const data=await r.json();
 const table=document.createElement('table');
 const head=document.createElement('tr');
 ['Ticker','Date','Close USD','Daily %','Day low','Day high','Signal'].forEach(x=>{let th=document.createElement('th');th.textContent=x;head.append(th)});table.append(head);
 data.forEach(q=>{let tr=document.createElement('tr');[q.symbol,q.date||'—',q.close??'—',q.change_pct??'—',q.day_low??'—',q.day_high??'—',q.signal].forEach(v=>{let td=document.createElement('td');td.textContent=String(v);tr.append(td)});table.append(tr)});
 document.getElementById('results').replaceChildren(table);status.textContent='Updated. Data can be delayed; never treat as an executable quote.';
 }catch(e){status.textContent='Data unavailable: '+e.message}
}
async function email(){const r=await fetch('/api/email',{method:'POST'});document.getElementById('status').textContent=JSON.stringify(await r.json())}
load();
</script></html>"""

class Handler(BaseHTTPRequestHandler):
    def reply(self, status, body, content_type="application/json"):
        encoded = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", content_type + "; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(encoded)

    def do_GET(self):
        if self.path == "/":
            return self.reply(200, PAGE, "text/html")
        if self.path == "/api/quotes":
            return self.reply(200, json.dumps(snapshot()))
        self.reply(404, '{"error":"Not found"}')

    def do_POST(self):
        if self.path != "/api/email":
            return self.reply(404, '{"error":"Not found"}')
        rows = snapshot()
        body = "\n".join(f"{q['symbol']}: {q.get('close','N/A')} USD | {q['signal']} | {q.get('date','N/A')}" for q in rows)
        try:
            result = send_email("Five-stock research snapshot", body + "\nDelayed data; research only.")
        except (OSError, smtplib.SMTPException) as exc:
            result = {"sent": False, "reason": str(exc)}
        self.reply(200 if result["sent"] else 503, json.dumps(result))

if __name__ == "__main__":
    print(f"Dashboard: http://127.0.0.1:{PORT}")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
