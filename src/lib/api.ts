import axios from 'axios';

const BASE_URL = 'https://api.coincap.io/v2';

interface Asset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  priceUsd: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  changePercent24Hr: string;
}

interface AssetsResponse {
  data: Asset[];
  timestamp: number;
}

interface HistoryDataPoint {
  priceUsd: string;
  time: number;
  date: string;
}

interface HistoryResponse {
  data: HistoryDataPoint[];
  timestamp: number;
}

interface OHLCVDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface OHLCVResponse {
  data: OHLCVDataPoint[];
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }
  return response.json();
};

export const fetchTopAssets = async (): Promise<AssetsResponse> => {
  const response = await fetch(`${BASE_URL}/assets?limit=50`);
  return handleResponse(response);
};

export const fetchAssetDetails = async (id: string) => {
  const response = await axios.get(`${BASE_URL}/assets/${id}`);
  return response.data;
};

export const fetchAssetHistory = async (id: string, interval = '24h'): Promise<OHLCVResponse> => {
  try {
    const intervals: Record<string, { interval: string, limit: number }> = {
      '1h': { interval: 'm1', limit: 60 },
      '24h': { interval: 'm15', limit: 96 },
      '7d': { interval: 'h1', limit: 168 },
      '30d': { interval: 'h6', limit: 120 },
      '1y': { interval: 'd1', limit: 365 },
    };

    const { interval: apiInterval, limit } = intervals[interval] || intervals['24h'];

    console.log('Fetching asset history:', {
      id,
      interval: apiInterval,
      limit
    });

    const response = await axios.get(`${BASE_URL}/assets/${id}/history`, {
      params: {
        interval: apiInterval,
        limit,
      },
    });

    if (!response.data.data || !response.data.data.length) {
      throw new Error('Invalid API response: No data received');
    }

    // OHLCV verilerini oluştur
    const data = response.data.data;
    const ohlcvData = [];
    let currentCandle: any = null;
    let candleCount = 0;

    for (let i = 0; i < data.length; i++) {
      const price = parseFloat(data[i].priceUsd);
      const timestamp = Math.floor(new Date(data[i].time).getTime() / 1000);
      const volume = parseFloat(data[i].volumeUsd);

      if (!currentCandle) {
        currentCandle = {
          time: timestamp,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: volume
        };
      } else {
        // Mevcut mum için değerleri güncelle
        currentCandle.high = Math.max(currentCandle.high, price);
        currentCandle.low = Math.min(currentCandle.low, price);
        currentCandle.close = price;
        currentCandle.volume += volume;
      }

      candleCount++;

      // Her 4 veri noktasında bir mum oluştur
      if (candleCount === 4 || i === data.length - 1) {
        ohlcvData.push({ ...currentCandle });
        currentCandle = null;
        candleCount = 0;
      }
    }

    console.log('Processed OHLCV Data:', {
      inputLength: data.length,
      outputLength: ohlcvData.length,
      firstCandle: ohlcvData[0],
      lastCandle: ohlcvData[ohlcvData.length - 1]
    });

    return { data: ohlcvData };
  } catch (error) {
    console.error('Error fetching asset history:', error);
    throw error;
  }
};