// RSI (Relative Strength Index) hesaplama
export const calculateRSI = (prices: number[], period = 14): number[] => {
  const rsi: number[] = [];
  const changes: number[] = [];
  
  // Fiyat değişimlerini hesapla
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  // İlk RSI değerini hesapla
  let avgGain = 0;
  let avgLoss = 0;
  
  // İlk period için ortalama kazanç ve kayıpları hesapla
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i];
    if (changes[i] < 0) avgLoss += Math.abs(changes[i]);
  }
  
  avgGain = avgGain / period;
  avgLoss = avgLoss / period;

  // İlk RSI değerini ekle
  let rs = avgGain / avgLoss;
  rsi.push(100 - (100 / (1 + rs)));

  // Kalan değerler için RSI hesapla
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;

    rs = avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }

  // Başlangıçtaki eksik değerleri doldur
  const padding = new Array(period).fill(null);
  return [...padding, ...rsi];
};

// MACD (Moving Average Convergence Divergence) hesaplama
export const calculateMACD = (prices: number[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9): { 
  macd: number[], 
  signal: number[], 
  histogram: number[] 
} => {
  // EMA hesaplama yardımcı fonksiyonu
  const calculateEMA = (data: number[], period: number): number[] => {
    const k = 2 / (period + 1);
    const ema: number[] = [data[0]];
    
    for (let i = 1; i < data.length; i++) {
      ema.push(data[i] * k + ema[i - 1] * (1 - k));
    }
    
    return ema;
  };

  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  
  // MACD Line hesapla
  const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
  
  // Signal Line hesapla (MACD'nin 9 günlük EMA'sı)
  const signalLine = calculateEMA(macdLine, signalPeriod);
  
  // Histogram hesapla (MACD - Signal)
  const histogram = macdLine.map((macd, i) => macd - signalLine[i]);

  return {
    macd: macdLine,
    signal: signalLine,
    histogram: histogram
  };
};

// Bollinger Bands hesaplama
export const calculateBollingerBands = (prices: number[], period = 20, multiplier = 2): {
  upper: number[],
  middle: number[],
  lower: number[]
} => {
  const upper: number[] = [];
  const middle: number[] = [];
  const lower: number[] = [];
  
  // Her nokta için hesapla
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      middle.push(null);
      lower.push(null);
      continue;
    }
    
    // Period için fiyatları al
    const periodPrices = prices.slice(i - period + 1, i + 1);
    
    // SMA (Simple Moving Average) hesapla
    const sma = periodPrices.reduce((sum, price) => sum + price, 0) / period;
    
    // Standart sapma hesapla
    const squaredDiffs = periodPrices.map(price => Math.pow(price - sma, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    upper.push(sma + (multiplier * standardDeviation));
    middle.push(sma);
    lower.push(sma - (multiplier * standardDeviation));
  }
  
  return { upper, middle, lower };
};