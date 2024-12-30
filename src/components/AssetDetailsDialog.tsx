import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useMemo, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { fetchAssetHistory, fetchAssetDetails } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ComposedChart, Bar, Area, ReferenceLine } from 'recharts';
import { calculateRSI, calculateMACD, calculateBollingerBands } from "@/lib/indicators";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeCrypto, getCryptoNews, getCoinInfo } from "@/lib/xai";

interface AssetDetailsDialogProps {
  assetId: string | null;
  onClose: () => void;
}

const TIME_PERIODS = [
  { value: '1h', label: '1 Saat' },
  { value: '24h', label: '24 Saat' },
  { value: '7d', label: '7 Gün' },
  { value: '30d', label: '30 Gün' },
  { value: '1y', label: '1 Yıl' },
];

const CHART_TYPES = [
  { value: 'candlestick', label: 'Mum Grafiği' },
  { value: 'line', label: 'Çizgi Grafiği' },
  { value: 'area', label: 'Alan Grafiği' },
];

const INDICATORS = [
  { value: 'none', label: 'Yok' },
  { value: 'rsi', label: 'RSI' },
  { value: 'macd', label: 'MACD' },
  { value: 'bollinger', label: 'Bollinger Bands' },
];

const AssetDetailsDialog = ({ assetId, onClose }: AssetDetailsDialogProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [selectedChartType, setSelectedChartType] = useState('line');
  const [selectedIndicator, setSelectedIndicator] = useState('none');
  const [showVolume, setShowVolume] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [analysis, setAnalysis] = useState<string>('');
  const [news, setNews] = useState<string>('');
  const [coinInfo, setCoinInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: details } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => fetchAssetDetails(assetId!),
    enabled: !!assetId,
  });

  const { data: history } = useQuery({
    queryKey: ['assetHistory', assetId, selectedPeriod],
    queryFn: () => fetchAssetHistory(assetId!, selectedPeriod),
    enabled: !!assetId,
  });

  const asset = details?.data;
  const prices = history?.data?.map(item => item.close) || [];
  
  // İndikatörleri hesapla
  const rsi = useMemo(() => calculateRSI(prices), [prices]);
  const macd = useMemo(() => calculateMACD(prices), [prices]);
  const bollingerBands = useMemo(() => calculateBollingerBands(prices), [prices]);

  const chartData = history?.data?.map((item: any, index: number) => ({
    date: new Date(item.time * 1000).toLocaleString(),
    price: item.close,
    open: item.open,
    high: item.high,
    low: item.low,
    volume: item.volume,
    // İndikatör değerlerini ekle
    rsi: rsi[index],
    macd: macd.macd[index],
    signal: macd.signal[index],
    histogram: macd.histogram[index],
    upper: bollingerBands.upper[index],
    middle: bollingerBands.middle[index],
    lower: bollingerBands.lower[index],
  }));

  const CustomBar = (props: any) => {
    const { x, y, width, height, histogram } = props;
    const fill = histogram >= 0 ? '#26a69a' : '#ef5350';
    
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        opacity={0.8}
      />
    );
  };

  const renderIndicator = () => {
    if (!chartData || selectedIndicator === 'none') return null;

    return (
      <ResponsiveContainer width="100%" height={200}>
        {selectedIndicator === 'rsi' ? (
          <ComposedChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[0, 100]}
              ticks={[0, 20, 30, 50, 70, 80, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '10px'
              }}
            />
            <Line
              type="monotone"
              dataKey="rsi"
              stroke="#2962FF"
              dot={false}
            />
            {/* Aşırı alım/satım seviyeleri */}
            <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="green" strokeDasharray="3 3" />
          </ComposedChart>
        ) : selectedIndicator === 'macd' ? (
          <ComposedChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '10px'
              }}
            />
            <Line
              type="monotone"
              dataKey="macd"
              stroke="#2962FF"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="signal"
              stroke="#FF9800"
              dot={false}
            />
            <Bar
              dataKey="histogram"
              shape={<CustomBar />}
            />
          </ComposedChart>
        ) : (
          <ComposedChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '10px'
              }}
              formatter={(value: any) => [`$${parseFloat(value).toLocaleString()}`]}
            />
            <Line
              type="monotone"
              dataKey="upper"
              stroke="#FF9800"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="middle"
              stroke="#2962FF"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="lower"
              stroke="#FF9800"
              dot={false}
            />
          </ComposedChart>
        )}
      </ResponsiveContainer>
    );
  };

  const renderChart = () => {
    if (!chartData) return null;

    return (
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              yAxisId="price"
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            {showVolume && (
              <YAxis
                yAxisId="volume"
                orientation="right"
                tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '10px'
              }}
              formatter={(value: any, name: string) => [
                name === 'volume' 
                  ? `$${(value / 1000000).toFixed(2)}M`
                  : `$${parseFloat(value).toLocaleString()}`,
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            {selectedChartType === 'line' && (
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2962FF"
                dot={false}
                yAxisId="price"
              />
            )}
            {selectedChartType === 'area' && (
              <Area
                type="monotone"
                dataKey="price"
                stroke="#2962FF"
                fill="#2962FF"
                fillOpacity={0.1}
                yAxisId="price"
              />
            )}
            {selectedChartType === 'candlestick' && (
              <>
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke="#26a69a"
                  dot={false}
                  yAxisId="price"
                />
                <Line
                  type="monotone"
                  dataKey="low"
                  stroke="#ef5350"
                  dot={false}
                  yAxisId="price"
                />
              </>
            )}
            {showVolume && (
              <Bar
                dataKey="volume"
                fill="#82ca9d"
                opacity={0.3}
                yAxisId="volume"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {selectedIndicator !== 'none' && (
          <div className="h-[200px] border-t border-gray-200 pt-4">
            {renderIndicator()}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (!asset) return;

    const fetchAnalysisAndNews = async () => {
      setIsLoading(true);
      try {
        const [analysisResult, newsResult, infoResult] = await Promise.all([
          analyzeCrypto(
            asset.name,
            parseFloat(asset.priceUsd),
            parseFloat(asset.changePercent24Hr),
            parseFloat(asset.marketCapUsd),
            parseFloat(asset.volumeUsd24Hr)
          ),
          getCryptoNews(asset.name),
          getCoinInfo(asset.name)
        ]);

        setAnalysis(analysisResult);
        setNews(newsResult);
        setCoinInfo(infoResult);
      } catch (error) {
        console.error('Error fetching analysis and news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisAndNews();
  }, [asset]);

  return (
    <Dialog open={!!assetId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">
            {!asset ? (
              "Kripto Varlık Detayları"
            ) : (
              <div className="flex items-center justify-between">
                <span>{asset.name} ({asset.symbol})</span>
                <span className={`text-2xl ${parseFloat(asset.changePercent24Hr) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(parseFloat(asset.priceUsd))} ({parseFloat(asset.changePercent24Hr).toFixed(2)}%)
                </span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {!asset ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-gray-600">Market Cap</p>
                <p className="text-xl font-mono">{formatCurrency(parseFloat(asset.marketCapUsd))}</p>
              </div>
              <div>
                <p className="text-gray-600">24h Volume</p>
                <p className="text-xl font-mono">{formatCurrency(parseFloat(asset.volumeUsd24Hr))}</p>
              </div>
              <div>
                <p className="text-gray-600">Supply / Max Supply</p>
                <p className="text-xl font-mono">
                  {parseFloat(asset.supply).toLocaleString()} / 
                  {asset.maxSupply ? parseFloat(asset.maxSupply).toLocaleString() : '∞'}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Zaman Aralığı" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_PERIODS.map(period => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedChartType} onValueChange={setSelectedChartType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Grafik Tipi" />
                </SelectTrigger>
                <SelectContent>
                  {CHART_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="İndikatör" />
                </SelectTrigger>
                <SelectContent>
                  {INDICATORS.map(indicator => (
                    <SelectItem key={indicator.value} value={indicator.value}>
                      {indicator.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant={showVolume ? "default" : "outline"}
                onClick={() => setShowVolume(!showVolume)}
              >
                Volume
              </Button>

              <Button
                variant={showGrid ? "default" : "outline"}
                onClick={() => setShowGrid(!showGrid)}
              >
                Grid
              </Button>
            </div>

            <Tabs defaultValue="chart" className="mt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="chart">Grafik</TabsTrigger>
                <TabsTrigger value="info">Genel Bilgiler</TabsTrigger>
                <TabsTrigger value="analysis">AI Analizi</TabsTrigger>
                <TabsTrigger value="news">Haberler</TabsTrigger>
              </TabsList>

              <TabsContent value="chart">
                <div className="border-2 border-black p-4 rounded-lg bg-white">
                  {renderChart()}
                </div>
              </TabsContent>

              <TabsContent value="info">
                <div className="border-2 border-black p-4 rounded-lg bg-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                  ) : (
                    <div className="prose max-w-none">
                      <h3 className="text-xl font-bold mb-4">Coin Hakkında</h3>
                      <div className="whitespace-pre-wrap max-h-[400px] overflow-y-auto pr-4">{coinInfo}</div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analysis">
                <div className="border-2 border-black p-4 rounded-lg bg-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                  ) : (
                    <div className="prose max-w-none">
                      <h3 className="text-xl font-bold mb-4">AI Analizi</h3>
                      <div className="whitespace-pre-wrap max-h-[400px] overflow-y-auto pr-4">{analysis}</div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="news">
                <div className="border-2 border-black p-4 rounded-lg bg-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                  ) : (
                    <div className="prose max-w-none">
                      <h3 className="text-xl font-bold mb-4">Son Gelişmeler</h3>
                      <div className="whitespace-pre-wrap max-h-[400px] overflow-y-auto pr-4">{news}</div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssetDetailsDialog;
