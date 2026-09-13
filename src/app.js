import { arrow, overlayChart, oosChart, liveRecord, compoundWidget, mountCharts } from './charts.js';

const eyebrow = text => `<span class="eyebrow">${text}</span>`;
const logo = `<svg class="logo-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path class="logo-reference" d="M5 5h22"/><path d="M8 12v7a8 8 0 0 0 16 0v-7"/></svg><span>undercent</span>`;
const button = (text, href, secondary = false) => `<a class="button ${secondary ? 'button-secondary' : ''}" href="${href}">${text}${arrow}</a>`;

function priceFormula() {
  return `<div class="price-formula">
    <div class="formula-intro">${eyebrow('BTC PRICE → 15-MINUTE PROBABILITY')}<p>Put Bitcoin and the contract on the same scale.</p></div>
    <div class="probability-equation" role="math" aria-label="The probability of YES is approximately the normal cumulative distribution of log of the estimated settlement price divided by the strike, divided by the square root of the remaining variance.">
      <span>P(YES)</span><span>≈</span><span class="equation-function">Φ<span class="equation-paren">(</span><span class="equation-fraction"><span>ln(Ŝ / K)</span><span>√V(τ)</span></span><span class="equation-paren">)</span></span>
    </div>
    <details class="formula-details"><summary>The formula, explained <span aria-hidden="true">+</span></summary>
      <div class="formula-definitions"><p><b>Ŝ</b> estimates Bitcoin’s settlement price. <b>K</b> is the contract’s strike. <b>V(τ)</b> is the remaining log-price variance; <b>τ</b> is seconds to settlement. <b>Φ</b> turns that distance into a probability.</p><p>The plotted curves account for Kalshi’s final-minute settlement average. Before the last minute, Ŝ = spot and V(τ) = σ²(τ − 40). In the final minute, Ŝ = (1 − τ/60)A + (τ/60)S and V(τ) = σ²τ³/10800.</p><p>S is current BTC spot; A is the observed average so far in the final minute. σ = σ₁₅/30, using recent 15-minute volatility. This is the price-implied baseline shown in the chart.</p></div>
    </details>
  </div>`;
}

function edgeFormula() {
  return `<div class="edge-equation" aria-label="55.2 percent win rate minus 51.9 cents all-in cost leaves 3.3 cents of estimated edge per one dollar contract">
    <div><strong>55.2<span>%</span></strong><span>Win rate</span></div><span class="equation-operation">−</span>
    <div><strong>51.9<span>¢</span></strong><span>Entry, including fees</span></div><span class="equation-operation">=</span>
    <div><strong>3.3<span>¢</span></strong><span>Edge per $1 contract</span></div>
  </div>`;
}

function apiSection() {
  return `<section class="access-section section" id="access"><div class="wrap">
    <div class="section-heading"><div>${eyebrow('04 / THE API')}<h2>We send the signal.<br><em>You keep the keys.</em></h2></div><p>Independent Bitcoin predictions, delivered as one simple response. Your Kalshi account and execution stay in your own environment.</p></div>
    <div class="api-layout">
      <div class="api-preview">
        <div class="api-preview-top"><span>EXAMPLE RESPONSE</span><button type="button" class="copy-button" data-copy aria-label="Copy illustrative API response"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="7" y="7" width="9" height="10" rx="1.5" stroke="currentColor"/><path d="M12 7V3H3v10h4" stroke="currentColor"/></svg><span>Copy example</span></button></div>
        <code><span class="code-market">BTC15M</span>,YES,<b>0.552</b></code>
        <div class="response-fields"><span>Market</span><span>Direction</span><span>Probability</span></div>
        <div class="api-status"><span>Prediction API</span><span class="coming-label">Coming soon</span></div>
        <p class="fine-print">Illustrative response format. Access details will be announced at launch.</p>
      </div>
      <div class="privacy-copy">${eyebrow('PRIVATE BY DESIGN')}<h3>Your account stays yours.</h3><p>We only provide prediction signals. We never receive your Kalshi keys or access your Kalshi account. Your agent handles the connection to Kalshi using credentials you keep locally.</p><div class="privacy-tags"><span>Signals from us</span><span>Keys stay with you</span></div></div>
    </div>
    <div class="delivery-flow" aria-label="Planned delivery: Undercent sends a signal to your own agent, which uses your own credentials to connect to your Kalshi account.">
      <div class="flow-source"><span class="eyebrow">UNDERCENT</span><strong>Prediction signal</strong><span>Market · direction · probability</span></div><span class="flow-arrow" aria-hidden="true">${arrow}</span><div class="flow-owned"><span class="eyebrow">YOUR ENVIRONMENT</span><div><strong>Your agent</strong><span aria-hidden="true">${arrow}</span><strong>Your Kalshi account</strong></div><span>Your credentials stay on your side.</span></div>
    </div>
    <div class="skill-preview">
      <div>${eyebrow('THE CLAUDE SETUP SKILL')}<h3>One install.<br>Your own trading agent.</h3><p>The planned skill sets up an agent in your environment. It listens for our predictions and triggers your Kalshi execution according to your settings. We recommend half-Kelly sizing.</p></div>
      <div class="skill-steps"><div><span>01</span><p>Install the agent with the Claude skill.</p></div><div><span>02</span><p>Connect your Kalshi account locally.</p></div><div><span>03</span><p>Receive signals. Execute on your terms.</p></div><span class="coming-badge">One-click setup · Coming soon</span></div>
    </div>
  </div></section>`;
}

function page() {
  return `<a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header wrap"><a class="brand" href="#main" aria-label="Undercent home">${logo}</a><nav class="primary-nav" aria-label="Main navigation"><a href="#principle">The principle</a><a href="#record">The record</a><a href="#access">The API</a></nav><a class="header-cta" href="#access">API <span>Coming soon</span>${arrow}</a></header>
    <main id="main">
      <section class="paper-hero wrap">
        <div class="hero-copy">${eyebrow('<i class="tiny-dot"></i> KALSHI · BTC 15-MIN MARKETS')}<h1>Don’t predict<br>Bitcoin.<br><em>Predict entry cost.</em></h1><p>A prediction API for Kalshi’s 15-minute Bitcoin markets. We look for contracts that cost less than their chance of winning.</p><div class="hero-actions">${button('See how it works', '#principle')}${button('Explore the API', '#access', true)}</div><div class="hero-proof"><div><strong>55.2%</strong><span>Reported live hit rate</span></div><div><strong>51.9¢</strong><span>All-in entry cost</span></div></div><p class="hero-period">Live on Kalshi · July–September 2026</p></div>
        ${compoundWidget()}
      </section>
      <section class="principle-section section wrap" id="principle">
        <div class="section-heading"><div>${eyebrow('01 / THE PRICE IS A PREDICTION')}<h2>The market already<br>prices the move.</h2></div><p>In an efficient prediction market, the ask price roughly reflects the event’s probability at that moment. A 52¢ ask is a 52% break-even probability before fees; the spread also affects the quote.</p></div>
        <p class="chart-intro">Convert BTC spot into a 15-minute probability and place it beside the Kalshi ask. The two curves largely move together.</p>
        <div class="chart-shell" id="market">${overlayChart()}</div>
        <div class="curve-evidence"><div><strong>0.98</strong><span>Median correlation</span></div><div><strong>691</strong><span>Recorded markets</span></div><p>Six recorded 15-minute markets to explore. Switch the date or move across the chart to compare the two prices.</p></div>
        ${priceFormula()}
        <p class="principle-takeaway">Predicting Bitcoin’s direction alone creates no edge <em>when that information is already in the ask.</em></p>
      </section>
      <section class="edge-section" id="objective"><div class="wrap">
        <div class="section-heading"><div>${eyebrow('02 / WHAT WE LOOK FOR')}<h2>A cheaper entry.<br><em>Enough wins to clear it.</em></h2></div><p>Our objective is to find markets where the side we select can be bought for less than its chance of winning. A modest hit rate can be enough. It has to beat the entry price, including fees.</p></div>
        ${edgeFormula()}
        <p class="edge-note">That is the idea: earn the gap between how often you win and what you pay. Positive expected value plays out over many trades; it does not mean every trade wins.</p>
      </div></section>
      <section class="record-section section wrap" id="record">
        <div class="history-layout"><div class="history-copy">${eyebrow('03 / THE RECORD')}<h2>Above 50%.<br>Every test year.</h2><p>Historical direction accuracy stays in the 53–55% range across these out-of-sample years. The aim is a repeatable signal with an entry price that leaves room.</p><span class="history-period">Five years of BTC history · OOS shown: 2023–26</span></div><div class="history-panel">${oosChart()}</div></div>
        <div class="live-layout"><div class="live-intro">${eyebrow('LIVE ON KALSHI')}<h2>Two months.<br>In the market.</h2><p>55.2% of signals settled our way, at a reported average cost of 51.9¢ including fees. About 11 signals a day.</p><a class="text-link" href="#main">Explore a year at these inputs ${arrow}</a></div>${liveRecord({title:'The live record'})}</div>
      </section>
      ${apiSection()}
    </main>
    <footer class="site-footer wrap"><a class="brand" href="#main" aria-label="Undercent home">${logo}</a><p>Bitcoin prediction signals. Delivered by API.</p><span>© 2026 Undercent · Not affiliated with Kalshi.</span></footer>`;
}

document.querySelector('#app').innerHTML = page();
mountCharts();

document.addEventListener('click', async event => {
  const copy = event.target.closest('[data-copy]');
  if (!copy) return;
  const label = copy.querySelector('span');
  try {
    await navigator.clipboard.writeText('BTC15M,YES,0.552');
    label.textContent = 'Copied';
    document.querySelector('#announcer').textContent = 'Example response copied to clipboard.';
    setTimeout(() => { label.textContent = 'Copy example'; }, 2200);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(copy.closest('.api-preview').querySelector('code'));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    label.textContent = 'Select the example';
    document.querySelector('#announcer').textContent = 'Example selected. Use your copy shortcut.';
  }
});
