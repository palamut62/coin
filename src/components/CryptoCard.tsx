import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface CryptoCardProps {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  priceUsd: string;
  marketCapUsd: string;
  changePercent24Hr: string;
  volumeUsd24Hr: string;
  onClick: () => void;
}

const CryptoCard = ({ 
  rank, 
  symbol, 
  name, 
  priceUsd, 
  marketCapUsd, 
  changePercent24Hr,
  volumeUsd24Hr,
  onClick 
}: CryptoCardProps) => {
  const priceChange = parseFloat(changePercent24Hr);
  const isPositive = priceChange >= 0;
  const intensity = Math.min(Math.abs(priceChange) / 10, 1); // Maksimum %10 değişimde en koyu renk

  // Dinamik arka plan rengi hesaplama
  const getBgColor = () => {
    if (isPositive) {
      return `bg-gradient-to-br from-white to-green-${Math.ceil(intensity * 100)}`;
    } else {
      return `bg-gradient-to-br from-white to-red-${Math.ceil(intensity * 100)}`;
    }
  };

  return (
    <Card 
      onClick={onClick}
      className={`cursor-pointer transition-all hover:scale-[1.02] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${getBgColor()} hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-4xl font-bold">{rank}</p>
              <div className={`px-2 py-1 rounded ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="flex items-center gap-1">
                  {isPositive ? 
                    <TrendingUp className="w-4 h-4 text-green-600" /> : 
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  }
                  <span className={`text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(priceChange).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold mt-2">{symbol}</h3>
            <p className="text-gray-600">{name}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-mono font-bold">{formatCurrency(parseFloat(priceUsd))}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                Market Cap: {formatCurrency(parseFloat(marketCapUsd))}
              </p>
              <p className="text-sm text-gray-600">
                24h Vol: {formatCurrency(parseFloat(volumeUsd24Hr))}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoCard;