// news-sentiment.js - News Sentiment Overlay for Revolut Ticker Agent

let sentimentCache = {};

function fetchSentiment(ticker) {
  // Simulate news sentiment analysis (in production would call real news API)
  return new Promise((resolve) => {
    setTimeout(() => {
      const sentiments = {
        'AAPL': { score: 0.72, label: 'Positive', summary: 'Strong services growth and AI announcements driving positive coverage.' },
        'TSLA': { score: -0.31, label: 'Negative', summary: 'Margin pressure and competition concerns dominate recent headlines.' },
        'MSFT': { score: 0.68, label: 'Positive', summary: 'Cloud and AI momentum continue to impress analysts.' },
        'GOOGL': { score: 0.45, label: 'Neutral', summary: 'Mixed reactions to regulatory news and AI investments.' },
        default: { score: 0.12, label: 'Neutral', summary: 'Limited recent news coverage with balanced sentiment.' }
      };

      const data = sentiments[ticker] || sentiments.default;
      sentimentCache[ticker] = { ...data, timestamp: Date.now() };
      resolve(data);
    }, 600);
  });
}

function createSentimentBadge(ticker, element) {
  const existing = element.parentNode.querySelector('.sentiment-badge');
  if (existing) existing.remove();

  const badge = document.createElement('span');
  badge.className = 'sentiment-badge';
  badge.style.cssText = `
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 9999px;
    margin-left: 6px;
    font-weight: 600;
    display: inline-block;
    vertical-align: middle;
  `;

  badge.innerHTML = 'Loading...';

  element.parentNode.insertBefore(badge, element.nextSibling);

  fetchSentiment(ticker).then(data => {
    badge.innerHTML = `${data.label} (${Math.round(data.score * 100)}%)`;
    
    if (data.score > 0.3) {
      badge.style.background = '#dcfce7';
      badge.style.color = '#166534';
    } else if (data.score < -0.2) {
      badge.style.background = '#fee2e2';
      badge.style.color = '#991b1b';
    } else {
      badge.style.background = '#f3f4f6';
      badge.style.color = '#4b5563';
    }

    badge.title = data.summary;
  });
}

// Hook into existing ticker detection
const originalDetect = window.detectTickers || function() {};
window.detectTickers = function() {
  originalDetect();
  
  setTimeout(() => {
    document.querySelectorAll('[data-testid*="ticker"], .ticker-symbol, [class*="ticker"]').forEach(el => {
      const ticker = el.textContent.trim().toUpperCase();
      if (/^[A-Z]{1,5}$/.test(ticker)) {
        createSentimentBadge(ticker, el);
      }
    });
  }, 1200);
};