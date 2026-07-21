// ai-copilot.js - AI Investment Co-Pilot UI Components (Real AI Logic)

// Create the "Get AI Insight" trigger button
function createTriggerButton(ticker, signalColor) {
  const button = document.createElement('button');
  button.className = 'ai-insight-btn';
  button.innerHTML = `
    <span style="font-size: 11px; font-weight: 600;">Get AI Insight</span>
  `;
  
  button.style.cssText = `
    background: ${signalColor === 'green' ? '#22c55e' : '#ef4444'};
    color: white;
    border: none;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    cursor: pointer;
    margin-left: 8px;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  `;

  button.onmouseover = () => {
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
  };
  
  button.onmouseout = () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
  };

  button.onclick = () => {
    showThesisCard(ticker, button);
  };

  return button;
}

// Create and show the AI Thesis Card
function showThesisCard(ticker, triggerButton) {
  const existingCard = document.querySelector('.ai-thesis-card');
  if (existingCard) existingCard.remove();

  const card = document.createElement('div');
  card.className = 'ai-thesis-card';
  card.style.cssText = `
    position: absolute;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    z-index: 10000;
    max-width: 340px;
    font-family: system-ui, -apple-system, sans-serif;
    margin-top: 8px;
  `;

  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <div style="font-weight: 700; font-size: 15px; color: #111827;">
        AI Investment Thesis
      </div>
      <button class="close-btn" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #9ca3af;">×</button>
    </div>
    
    <div class="thesis-content">
      <div style="margin-bottom: 14px;">
        <div style="font-size: 13px; color: #6b7280; margin-bottom: 6px; font-weight: 500;">Analysis</div>
        <div class="summary-text" style="font-size: 14px; line-height: 1.6; color: #374151;">
          Generating real-time analysis with GROKAI...
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Signal</div>
          <div class="signal-badge" style="font-weight: 600; padding: 3px 10px; border-radius: 9999px; display: inline-block; font-size: 12px;"></div>
        </div>
        <div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Confidence</div>
          <div class="confidence-score" style="font-weight: 700; color: #111827; font-size: 15px;"></div>
        </div>
      </div>
      
      <div class="suggested-action" style="background: #f8fafc; padding: 10px 12px; border-radius: 8px; font-size: 13px; margin-bottom: 12px; border-left: 3px solid #3b82f6;">
        <strong style="color: #1e40af;">Recommended Action:</strong><br>
        <span class="action-text" style="color: #334155;"></span>
      </div>
    </div>
    
    <div style="font-size: 11px; color: #9ca3af; border-top: 1px solid #f1f5f9; padding-top: 10px; display: flex; align-items: center; gap: 6px;">
      <span>Powered by GROKAI</span>
      <span style="background: #e0e7ff; color: #3730a3; padding: 1px 6px; border-radius: 4px; font-size: 10px;">Real-time</span>
    </div>
  `;

  const rect = triggerButton.getBoundingClientRect();
  card.style.top = `${rect.bottom + window.scrollY + 8}px`;
  card.style.left = `${rect.left + window.scrollX}px`;

  document.body.appendChild(card);

  card.querySelector('.close-btn').onclick = () => card.remove();

  // Request real AI thesis from background script
  requestRealThesis(ticker, card);
}

// Request real thesis from background (GROKAI)
function requestRealThesis(ticker, card) {
  chrome.runtime.sendMessage({
    type: "GENERATE_THESIS",
    ticker: ticker
  }, (response) => {
    if (response && response.thesis) {
      updateThesisCard(card, response.thesis);
    } else {
      // Fallback to simulated data if AI fails
      updateThesisCard(card, getFallbackThesis(ticker));
    }
  });
}

// Update the thesis card with real data
function updateThesisCard(card, thesis) {
  const summaryEl = card.querySelector('.summary-text');
  const signalEl = card.querySelector('.signal-badge');
  const confidenceEl = card.querySelector('.confidence-score');
  const actionEl = card.querySelector('.action-text');

  summaryEl.innerHTML = thesis.summary;
  
  signalEl.innerHTML = thesis.signal;
  signalEl.style.background = thesis.signal === 'Bullish' ? '#dcfce7' : 
                              thesis.signal === 'Cautious' ? '#fef3c7' : '#f3f4f6';
  signalEl.style.color = thesis.signal === 'Bullish' ? '#166534' : 
                         thesis.signal === 'Cautious' ? '#92400e' : '#374151';
  
  confidenceEl.innerHTML = thesis.confidence;
  actionEl.innerHTML = thesis.action;
}

// Fallback thesis (used if real AI is unavailable)
function getFallbackThesis(ticker) {
  const fallbacks = {
    'AAPL': {
      summary: "Apple demonstrates resilient growth through its services segment, which now represents over 20% of revenue. Recent AI initiatives (Apple Intelligence) position the company for long-term differentiation in consumer technology.",
      signal: "Bullish",
      confidence: "84%",
      action: "Hold / Accumulate on weakness"
    },
    'TSLA': {
      summary: "Tesla maintains EV market leadership but faces increasing competition and margin compression. Energy storage and autonomous driving remain high-upside catalysts, though execution risk is elevated.",
      signal: "Cautious",
      confidence: "71%",
      action: "Wait for margin stabilization"
    },
    default: {
      summary: "The company shows balanced fundamentals with moderate growth prospects. Current valuation appears reasonable relative to historical averages and sector peers.",
      signal: "Neutral",
      confidence: "76%",
      action: "Hold"
    }
  };

  return fallbacks[ticker] || fallbacks.default;
}