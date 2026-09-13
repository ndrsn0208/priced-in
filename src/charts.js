import { DATA } from './data.js';
import { compoundScenario, formatMultiple, formatReturn, linePath } from './math.js';

let serial = 0;
const num = value => Number(value).toFixed(1);
const timeLabel = value => `${Math.floor(value / 60).toString().padStart(2, '0')}:${Math.round(value % 60).toString().padStart(2, '0')}`;
export const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function chartSize(svg, height) {
  const width = svg.getBoundingClientRect().width;
  // Match SVG coordinates to CSS pixels so labels never shrink with the chart.
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.style.height = `${height}px`;
  return { width, height };
}

function watchChartWidth(svg, draw) {
  let previousWidth = 0;
  const update = () => {
    const width = svg.getBoundingClientRect().width;
    if (width > 0 && Math.abs(width - previousWidth) > 0.5) {
      previousWidth = width;
      draw();
    }
  };
  new ResizeObserver(update).observe(svg);
  update();
}

export function overlayChart({ compact = false } = {}) {
  const id = `overlay-${++serial}`;
  return `<div class="overlay-widget ${compact ? 'overlay-compact' : ''}" id="${id}" data-overlay>
    <div class="chart-toolbar">
      <div class="chart-legend">
        <button type="button" class="legend-toggle" data-line="fair" aria-pressed="true"><i class="legend-swatch fair"></i>BTC-implied probability</button>
        <button type="button" class="legend-toggle" data-line="ask" aria-pressed="true"><i class="legend-swatch ask"></i>Kalshi YES ask</button>
      </div>
      <span class="chart-unit">0–100 · % / ¢</span>
    </div>
    <div class="chart-stage" tabindex="0" role="group" aria-label="Recorded market chart. Use the left and right arrow keys to inspect observations.">
      <svg class="overlay-svg" viewBox="0 0 900 326" role="img" aria-label="Fifteen-minute recorded market comparison"></svg>
      <div class="chart-tooltip" hidden></div>
    </div>
    <div class="block-select" role="group" aria-label="Choose a recorded 15-minute market">
      ${DATA.blocks.map((b, i) => `<button type="button" data-block="${i}" aria-pressed="${i === 0}" aria-label="Show recorded market ${b.date} ${b.time} UTC"><span class="block-num">0${i + 1}</span><span>${b.date.replace(', 2026', '')}</span><span class="block-clock">${b.time}</span></button>`).join('')}
    </div>
    <div class="chart-caption"><span data-block-caption></span><span>Recorded data · June 2026 · UTC</span></div>
  </div>`;
}

function drawOverlay(widget, index) {
  const b = DATA.blocks[index];
  const svg = widget.querySelector('svg.overlay-svg');
  const { width, height } = chartSize(svg, svg.clientWidth < 640 ? 280 : 360);
  const left = 48;
  const right = width - 24;
  const top = 24;
  const bottom = height - 44;
  const x = t => left + t / 900 * (right - left);
  const y = value => bottom - value / 100 * (bottom - top);
  const ticks = width < 600 ? [0, 300, 600, 900] : [0, 180, 360, 540, 720, 900];
  widget.plot = { left, right, top, bottom, width, height, x, y };
  const p = values => linePath(values, (_, i) => x(b.t[i]), value => value === null ? NaN : y(value));
  svg.innerHTML = `
    <title>${b.date}, ${b.time} UTC: BTC-implied probability versus Kalshi YES ask</title>
    ${[0, 25, 50, 75, 100].map(t => `<g class="axis"><line x1="${left}" x2="${right}" y1="${y(t)}" y2="${y(t)}"/><text x="${left - 12}" y="${y(t) + 5}" text-anchor="end">${t}</text></g>`).join('')}
    ${ticks.map((t, i) => `<text class="axis-label" x="${x(t)}" y="${height - 14}" text-anchor="${i === 0 ? 'start' : i === ticks.length - 1 ? 'end' : 'middle'}">${width < 420 ? `${t / 60}m` : timeLabel(t)}</text>`).join('')}
    <path class="fair-line" d="${p(b.fair)}" fill="none" stroke-width="2" stroke-linejoin="round"/>
    <path class="ask-line" d="${p(b.ask)}" fill="none" stroke-width="2" stroke-linejoin="round"/>
    <g class="crosshair" visibility="hidden"><line x1="0" x2="0" y1="${top}" y2="${bottom}"/><circle class="dot-fair" r="4"/><circle class="dot-ask" r="4"/></g>`;
  widget.dataset.index = index;
  // Format the block end as a clock, including midnight rollover.
  const [hour, minute] = b.time.split(':').map(Number);
  const end = (hour * 60 + minute + 15) % 1440;
  widget.querySelector('[data-block-caption]').textContent =
    `${b.date} · ${b.time}–${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')} UTC`;
  widget.querySelectorAll('[data-block]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.block) === index)));
  widget.querySelectorAll('[data-line]').forEach(button => {
    svg.querySelector(`.${button.dataset.line}-line`).style.opacity = button.getAttribute('aria-pressed') === 'true' ? '1' : '0.06';
  });
}

export function oosChart() {
  const years = DATA.oos.years;
  return `<div class="oos-widget">
    <div class="chart-toolbar"><span class="eyebrow">HISTORICAL · OUT OF SAMPLE</span><span class="chart-unit">Direction hit rate</span></div>
    <svg class="oos-svg" role="img" aria-label="Historical out-of-sample direction accuracy: ${years.map(y => `${y.year}, ${y.hitRate} percent`).join('; ')}"></svg>
    <p class="fine-print">Five years of BTC history. OOS years shown: 2023–26. Historical direction tests, all predictions; separate from live Kalshi results.</p>
  </div>`;
}

function drawOos(svg) {
  const { width, height } = chartSize(svg, 300);
  const left = 48;
  const right = width - 8;
  const bottom = height - 38;
  const top = 28;
  const y = value => bottom - (value - 48) / 8.5 * (bottom - top);
  const slot = (right - left) / DATA.oos.years.length;
  const barWidth = Math.min(78, slot * 0.55);
  svg.innerHTML = `
    <title>Out-of-sample results by year, all predictions</title>
    ${[48, 50, 52, 54, 56].map(value => `<g class="axis"><line x1="${left}" x2="${right}" y1="${y(value)}" y2="${y(value)}" ${value === 50 ? 'class="baseline"' : ''}/><text x="${left - 10}" y="${y(value) + 5}" text-anchor="end">${value}%</text></g>`).join('')}
    ${DATA.oos.years.map((row, i) => {
      const center = left + slot * (i + 0.5);
      return `<g class="oos-bar"><rect x="${center - barWidth / 2}" y="${y(row.hitRate)}" width="${barWidth}" height="${bottom - y(row.hitRate)}" rx="2"/><text class="bar-value" x="${center}" y="${y(row.hitRate) - 14}" text-anchor="middle">${row.hitRate.toFixed(1)}%</text><text class="axis-label" x="${center}" y="${height - 9}" text-anchor="middle">${row.year}</text></g>`;
    }).join('')}`;
}

export function liveRecord({ title = 'Two months in the market.' } = {}) {
  return `<div class="live-record">
    <div class="record-heading"><span class="eyebrow">REPORTED LIVE · JUL–SEP 2026</span><span class="record-dot">BTC / 15 MIN</span></div>
    <h3>${title}</h3>
    <div class="record-numbers">
      <div><strong>55.2<span>%</span></strong><span>Hit rate</span></div>
      <div><strong>51.9<span>¢</span></strong><span>Average cost · fees included</span></div>
    </div>
    <div class="month-list">
      ${DATA.monthly.map(m => `<div><span>${m.label}${m.partial ? '*' : ''}</span><span class="month-track"><i style="width:${m.hitRate}%"></i></span><strong>${m.hitRate.toFixed(1)}%</strong></div>`).join('')}
    </div>
    <p class="fine-print">Headline figures reported by the team. Monthly snapshot through September 6; September is partial. Past results do not guarantee future returns.</p>
  </div>`;
}

export function compoundWidget() {
  const id = `compound-${++serial}`;
  const result = compoundScenario({ probability: DATA.live.hitRate / 100, cost: DATA.live.allInCost / 100, signalsPerDay: DATA.live.signalsPerDay });
  return `<div class="compound-widget" id="${id}" data-compound data-mode="live" data-edge-state="positive">
    <div class="compound-header">
      <span class="eyebrow">THE EDGE, COMPOUNDED</span>
      <button type="button" class="live-reset" data-live-reset aria-pressed="true"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16 7a6 6 0 1 0 .3 5M16 3v4h-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>Use live data</button>
    </div>
    <div class="compound-heading"><span>1-year return · hypothetical</span><div class="compound-result"><strong data-return>${formatReturn(result.multiple)}</strong><sup>*</sup></div><span class="compound-multiple"><b data-multiple>${formatMultiple(result.multiple)}</b>× starting capital</span></div>
    <div class="scenario-status"><span data-scenario-label>Reported live inputs</span><span>½ Kelly · ${DATA.live.signalsPerDay} signals / day</span></div>
    <div class="growth-stage" tabindex="0" role="group" aria-label="Hypothetical one-year growth. Use left and right arrow keys to inspect months.">
      <svg class="compound-svg" role="img" aria-label="Hypothetical compound growth over one year"></svg>
      <div class="growth-tooltip" hidden></div>
    </div>
    <div class="compound-controls">
      <label for="${id}-hit"><span>Win rate <output data-hit-output>${num(DATA.live.hitRate)}%</output></span><input id="${id}-hit" data-hit type="range" min="53" max="57" step="0.1" value="${DATA.live.hitRate}" aria-label="Assumed win rate in percent"></label>
      <label for="${id}-cost"><span>Entry, including fees <output data-cost-output>${num(DATA.live.allInCost)}¢</output></span><input id="${id}-cost" data-cost type="range" min="51" max="53" step="0.1" value="${DATA.live.allInCost}" aria-label="All-in entry price in cents"></label>
    </div>
    <div class="scenario-edge" role="status" aria-live="polite" aria-atomic="true"><span data-edge-label>Estimated edge per $1 contract</span><strong data-edge-cents>+${num(DATA.live.edgeCents)}¢</strong></div>
    <p class="compound-note">*Illustration, not realized performance. Assumes fixed odds and cost, ${DATA.live.signalsPerDay} independent signals a day, reinvestment and unlimited liquidity. Actual results can include losses.</p>
    <details class="math-details"><summary>Inputs &amp; sizing <span aria-hidden="true">+</span></summary><p>“Use live data” restores the team-reported July–September 2026 inputs: ${num(DATA.live.hitRate)}% wins, ${num(DATA.live.allInCost)}¢ all-in cost and approximately ${DATA.live.signalsPerDay} signals per day. This is a historical snapshot.</p><p>Half-Kelly allocates max(0, ½ × (p − c) / (1 − c)) of capital per signal. The curve compounds expected log growth for 365 days, with transaction fees already in the cost. API fees, slippage, capacity limits and changing conditions are excluded.</p></details>
  </div>`;
}

function drawCompound(widget) {
  const hitInput = Number(widget.querySelector('[data-hit]').value);
  const costInput = Number(widget.querySelector('[data-cost]').value);
  const probability = hitInput / 100;
  const cost = costInput / 100;
  const result = compoundScenario({ probability, cost, signalsPerDay: DATA.live.signalsPerDay });
  const isLive = hitInput === DATA.live.hitRate && costInput === DATA.live.allInCost;
  widget.dataset.mode = isLive ? 'live' : 'custom';
  widget.dataset.edgeState = result.edge > 0 ? 'positive' : result.edge < 0 ? 'negative' : 'zero';
  widget.querySelector('[data-live-reset]').setAttribute('aria-pressed', String(isLive));
  widget.querySelector('[data-scenario-label]').textContent = isLive ? 'Reported live inputs' : 'Your scenario';
  widget.querySelector('[data-return]').textContent = formatReturn(result.multiple);
  widget.querySelector('[data-multiple]').textContent = formatMultiple(result.multiple);
  widget.querySelector('[data-hit-output]').textContent = `${num(probability * 100)}%`;
  widget.querySelector('[data-cost-output]').textContent = `${num(cost * 100)}¢`;
  widget.querySelector('[data-hit]').setAttribute('aria-valuetext', `${num(hitInput)} percent win rate`);
  widget.querySelector('[data-cost]').setAttribute('aria-valuetext', `${num(costInput)} cents including fees`);
  widget.querySelector('[data-edge-cents]').textContent = `${result.edge > 0 ? '+' : result.edge < 0 ? '−' : ''}${num(Math.abs(result.edge) * 100)}¢`;
  widget.querySelector('[data-edge-label]').textContent = result.edge > 0 ? 'Estimated edge per $1 contract' : 'No positive edge · Kelly allocation is zero';
  widget.querySelector('.growth-tooltip').hidden = true;
  const maxValue = Math.max(result.multiple * 1.12, 2);
  const ticks = result.multiple > 100 ? [1, maxValue / 3, 2 * maxValue / 3] : [1, maxValue / 2, maxValue];
  const tickLabel = value => `${value === 1 ? '1' : value < 1000 ? Math.round(value) : formatMultiple(value)}×`;
  const svg = widget.querySelector('.compound-svg');
  const { width, height } = chartSize(svg, 208);
  const left = Math.max(48, ...ticks.map(t => tickLabel(t).length * 8.5 + 12));
  const right = width - 16;
  const bottom = height - 40;
  const top = 24;
  const x = day => left + day / 365 * (right - left);
  const y = value => bottom - (value - 1) / (maxValue - 1) * (bottom - top);
  widget.growthPlot = { left, right, top, bottom, x, y, result };
  const path = linePath(result.points, p => x(p.day), p => y(p.value));
  const id = `${widget.id}-fill`;
  const months = width < 480 ? [[0, 'Start'], [182, '6 mo'], [365, '1 year']] : [[0, 'Start'], [91, '3 mo'], [182, '6 mo'], [274, '9 mo'], [365, '1 year']];
  svg.innerHTML = `
    <title>Hypothetical half-Kelly illustration: ${formatMultiple(result.multiple)} times initial capital at one year, assuming ${num(probability * 100)} percent wins and ${num(cost * 100)} cents all-in cost</title>
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--accent)" stop-opacity=".19"/><stop offset="1" stop-color="var(--accent)" stop-opacity=".01"/></linearGradient></defs>
    ${ticks.map(t => `<g class="axis"><line x1="${left}" x2="${right}" y1="${y(t)}" y2="${y(t)}"/><text x="${left - 10}" y="${y(t) + 5}" text-anchor="end">${tickLabel(t)}</text></g>`).join('')}
    <path d="${path} L${right},${bottom} L${left},${bottom}Z" fill="url(#${id})"/>
    <path class="growth-line" d="${path}" fill="none" stroke-width="3.2"/>
    <circle cx="${right}" cy="${y(result.multiple)}" r="5" class="growth-dot"/>
    <g class="growth-crosshair" visibility="hidden"><line y1="${top}" y2="${bottom}"/><circle r="5"/></g>
    ${months.map(([day, label], i) => `<text class="axis-label" x="${x(day)}" y="${height - 10}" text-anchor="${i === 0 ? 'start' : i === months.length - 1 ? 'end' : 'middle'}">${label}</text>`).join('')}
  `;
  widget.dispatchEvent(new CustomEvent('scenariochange', { bubbles: true, detail: result }));
}

export function mountCharts() {
  document.querySelectorAll('[data-overlay]').forEach(widget => {
    watchChartWidth(widget.querySelector('.overlay-svg'), () => drawOverlay(widget, Number(widget.dataset.index || 0)));
    const stage = widget.querySelector('.chart-stage');
    const tooltip = widget.querySelector('.chart-tooltip');
    let hovered = 0;
    const inspect = index => {
      const b = DATA.blocks[Number(widget.dataset.index)];
      hovered = Math.max(0, Math.min(b.t.length - 1, index));
      const fair = b.fair[hovered];
      const ask = b.ask[hovered];
      const x = widget.plot.x(b.t[hovered]);
      const group = widget.querySelector('.crosshair');
      group.setAttribute('visibility', 'visible');
      const line = group.querySelector('line');
      line.setAttribute('x1', x); line.setAttribute('x2', x);
      for (const [name, value] of [['fair', fair], ['ask', ask]]) {
        const dot = group.querySelector(`.dot-${name}`);
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', value === null ? widget.plot.bottom : widget.plot.y(value));
        dot.style.visibility = value === null ? 'hidden' : 'visible';
      }
      tooltip.hidden = false;
      tooltip.innerHTML = `<b>+${timeLabel(b.t[hovered])}</b><span>BTC-implied <strong>${fair === null ? 'No quote' : `${num(fair)}%`}</strong></span><span>Kalshi ask <strong>${ask === null ? 'No quote' : `${num(ask)}¢`}</strong></span>`;
      tooltip.style.left = `${Math.max(8, Math.min(x + 12, stage.clientWidth - tooltip.offsetWidth - 8))}px`;
    };
    widget.addEventListener('click', event => {
      const block = event.target.closest('[data-block]');
      if (block) {
        drawOverlay(widget, Number(block.dataset.block));
        tooltip.hidden = true;
      }
      const line = event.target.closest('[data-line]');
      if (line) {
        line.setAttribute('aria-pressed', String(line.getAttribute('aria-pressed') !== 'true'));
        drawOverlay(widget, Number(widget.dataset.index));
      }
    });
    stage.addEventListener('pointermove', event => {
      const bounds = stage.querySelector('svg').getBoundingClientRect();
      const normalized = (event.clientX - bounds.left - widget.plot.left) / (widget.plot.right - widget.plot.left);
      inspect(Math.round(normalized * (DATA.blocks[Number(widget.dataset.index)].t.length - 1)));
    });
    stage.addEventListener('pointerleave', () => {
      widget.querySelector('.crosshair').setAttribute('visibility', 'hidden');
      tooltip.hidden = true;
    });
    stage.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        inspect(hovered + (event.key === 'ArrowRight' ? 5 : -5));
      }
    });
  });
  document.querySelectorAll('.oos-svg').forEach(svg => watchChartWidth(svg, () => drawOos(svg)));
  document.querySelectorAll('[data-compound]').forEach(widget => {
    watchChartWidth(widget.querySelector('.compound-svg'), () => drawCompound(widget));
    widget.addEventListener('input', () => drawCompound(widget));
    widget.addEventListener('click', event => {
      const button = event.target.closest('[data-live-reset]');
      if (!button) return;
      widget.querySelector('[data-hit]').value = DATA.live.hitRate;
      widget.querySelector('[data-cost]').value = DATA.live.allInCost;
      drawCompound(widget);
    });
    const stage = widget.querySelector('.growth-stage');
    const tooltip = widget.querySelector('.growth-tooltip');
    let day = 0;
    const inspect = nextDay => {
      day = Math.max(0, Math.min(365, Math.round(nextDay)));
      const { x, y, result } = widget.growthPlot;
      const value = Math.exp(result.logGrowth * day * DATA.live.signalsPerDay);
      const crosshair = widget.querySelector('.growth-crosshair');
      crosshair.setAttribute('visibility', 'visible');
      crosshair.querySelector('line').setAttribute('x1', x(day));
      crosshair.querySelector('line').setAttribute('x2', x(day));
      crosshair.querySelector('circle').setAttribute('cx', x(day));
      crosshair.querySelector('circle').setAttribute('cy', y(value));
      tooltip.textContent = `Day ${day} · ${formatMultiple(value)}× · ${formatReturn(value)}`;
      tooltip.hidden = false;
      tooltip.style.left = `${Math.max(4, Math.min(x(day) + 12, stage.clientWidth - tooltip.offsetWidth - 4))}px`;
    };
    stage.addEventListener('pointermove', event => {
      const bounds = widget.querySelector('.compound-svg').getBoundingClientRect();
      inspect((event.clientX - bounds.left - widget.growthPlot.left) / (widget.growthPlot.right - widget.growthPlot.left) * 365);
    });
    stage.addEventListener('pointerleave', () => {
      widget.querySelector('.growth-crosshair').setAttribute('visibility', 'hidden');
      tooltip.hidden = true;
    });
    stage.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        inspect(day + (event.key === 'ArrowRight' ? 30 : -30));
      }
    });
  });
}
