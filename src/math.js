/**
 * All costs are fractions of the $1 payout, including fees.
 * stake is the fraction of available capital spent on each contract batch.
 */
export function compoundScenario({
  probability = 0.552,
  cost = 0.519,
  signalsPerDay = 11,
  days = 365,
  kellyFraction = 0.5,
} = {}) {
  if (!(probability > 0 && probability < 1 && cost > 0 && cost < 1)) {
    throw new RangeError('Probability and cost must be strictly between zero and one.');
  }
  if (!(days >= 0 && signalsPerDay >= 0 && kellyFraction >= 0 && kellyFraction <= 1)) {
    throw new RangeError('Invalid duration, frequency, or Kelly fraction.');
  }
  const edge = probability - cost;
  const stake = Math.max(0, kellyFraction * edge / (1 - cost));
  const winMultiplier = 1 + stake * (1 - cost) / cost;
  const loseMultiplier = 1 - stake;
  const logGrowth = probability * Math.log(winMultiplier)
    + (1 - probability) * Math.log(loseMultiplier);
  const observations = days * signalsPerDay;
  const multiple = Math.exp(logGrowth * observations);
  const points = Array.from({ length: 74 }, (_, i) => {
    const day = days * i / 73;
    return { day, value: Math.exp(logGrowth * day * signalsPerDay) };
  });
  return { edge, stake, logGrowth, observations, multiple, winMultiplier, loseMultiplier, points };
}

export function linePath(points, getX, getY) {
  let penDown = false;
  return points.map((point, i) => {
    const x = getX(point, i);
    const y = getY(point, i);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      penDown = false;
      return '';
    }
    const command = penDown ? 'L' : 'M';
    penDown = true;
    return `${command}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

export function formatMultiple(value) {
  if (value < 10) return value.toFixed(2);
  if (value < 1000) return value.toFixed(1);
  if (value >= 1e12) return value.toExponential(1).replace('e+', 'e');
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function formatReturn(multiple) {
  const percent = (multiple - 1) * 100;
  const magnitude = Math.abs(percent);
  const text = magnitude >= 1e6
    ? formatMultiple(magnitude)
    : new Intl.NumberFormat('en-US', { maximumFractionDigits: magnitude < 100 ? 1 : 0 }).format(magnitude);
  return `${percent > 0 ? '+' : percent < 0 ? '−' : ''}${text}%`;
}
