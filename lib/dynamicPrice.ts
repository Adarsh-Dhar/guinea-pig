// Dynamic pricing utility for token price based on demand and time decay

export interface PriceState {
  currentPrice: number;
  lastBuyTimestamp: number; // ms since epoch
  basePrice: number; // Should be set to project.project.tokenPrice
  decayRatePerHour: number;
  priceImpactPerToken: number;
}

// Helper to initialize price state from project data
export function initializePriceState({
  initialPrice,
  decayRatePerHour = 0.01,
  priceImpactPerToken = 0.02,
}: {
  initialPrice: number;
  decayRatePerHour?: number;
  priceImpactPerToken?: number;
}): PriceState {
  return {
    currentPrice: initialPrice,
    lastBuyTimestamp: Date.now(),
    basePrice: initialPrice,
    decayRatePerHour,
    priceImpactPerToken,
  };
}

// Calculate decayed price based on time since last buy
export function getCurrentPrice({
  currentPrice,
  lastBuyTimestamp,
  basePrice,
  decayRatePerHour,
}: {
  currentPrice: number;
  lastBuyTimestamp: number;
  basePrice: number; // Should be project.project.tokenPrice
  decayRatePerHour: number;
}): number {
  const now = Date.now();
  const hoursSinceLastBuy = (now - lastBuyTimestamp) / 3600000;
  let decayedPrice = currentPrice - decayRatePerHour * hoursSinceLastBuy;
  return Math.max(decayedPrice, basePrice);
}

// Calculate new price after a buy
export function getPriceAfterBuy({
  currentPrice,
  amount,
  priceImpactPerToken,
}: {
  currentPrice: number;
  amount: number;
  priceImpactPerToken: number;
}): number {
  return currentPrice + priceImpactPerToken * amount;
} 