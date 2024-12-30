import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTopAssets } from "@/lib/api";
import CryptoCard from "@/components/CryptoCard";
import AssetDetailsDialog from "@/components/AssetDetailsDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, TrendingDown, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow, subDays } from "date-fns";
import { tr } from "date-fns/locale";

type SortOption = "rank" | "priceHighToLow" | "priceLowToHigh" | "change24h" | "volume24h";

const Index = () => {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rank");
  const { toast } = useToast();
  
  const { data: assets, isLoading, error, refetch } = useQuery({
    queryKey: ['assets'],
    queryFn: fetchTopAssets,
    refetchInterval: 30000, // Auto refresh every 30 seconds
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing data",
      description: "Getting the latest crypto prices and market data.",
    });
  };

  const filterAndSortAssets = (assets: any[]) => {
    let filtered = assets.filter(asset => 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case "priceHighToLow":
        return filtered.sort((a, b) => parseFloat(b.priceUsd) - parseFloat(a.priceUsd));
      case "priceLowToHigh":
        return filtered.sort((a, b) => parseFloat(a.priceUsd) - parseFloat(b.priceUsd));
      case "change24h":
        return filtered.sort((a, b) => parseFloat(b.changePercent24Hr) - parseFloat(a.changePercent24Hr));
      case "volume24h":
        return filtered.sort((a, b) => parseFloat(b.volumeUsd24Hr) - parseFloat(a.volumeUsd24Hr));
      default:
        return filtered.sort((a, b) => parseInt(a.rank) - parseInt(b.rank));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6F7]">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-gray-600" />
          <p className="text-2xl font-bold">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6F7]">
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold text-red-600">Error loading market data</p>
          <Button onClick={() => refetch()} variant="outline" className="border-2 border-black">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const filteredAssets = filterAndSortAssets(assets?.data || []);
  const topGainers = [...(assets?.data || [])]
    .sort((a, b) => parseFloat(b.changePercent24Hr) - parseFloat(a.changePercent24Hr))
    .slice(0, 3);
  
  const topLosers = [...(assets?.data || [])]
    .sort((a, b) => parseFloat(a.changePercent24Hr) - parseFloat(b.changePercent24Hr))
    .slice(0, 3);

  const recentlyAdded = [...(assets?.data || [])]
    .sort((a, b) => parseInt(b.rank) - parseInt(a.rank))
    .slice(0, 3)
    .map(asset => ({
      ...asset,
      listedDate: subDays(new Date(), Math.min(parseInt(asset.rank) * 2, 365))
    }));

  return (
    <div className="min-h-screen bg-[#F6F6F7] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b-4 border-black pb-4">
          <h1 className="text-5xl font-black mb-4 md:mb-0">
            Crypto Assets
          </h1>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="border-2 border-black hover:bg-black hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {topGainers.length > 0 && (
            <div className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold">Top Gainers (24h)</h2>
              </div>
              <div className="space-y-2">
                {topGainers.map(asset => (
                  <div 
                    key={asset.id} 
                    className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedAssetId(asset.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{asset.symbol}</span>
                      <span className="text-gray-600">{asset.name}</span>
                    </div>
                    <span className="text-green-600 font-mono">
                      +{parseFloat(asset.changePercent24Hr).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topLosers.length > 0 && (
            <div className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold">Top Losers (24h)</h2>
              </div>
              <div className="space-y-2">
                {topLosers.map(asset => (
                  <div 
                    key={asset.id} 
                    className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedAssetId(asset.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{asset.symbol}</span>
                      <span className="text-gray-600">{asset.name}</span>
                    </div>
                    <span className="text-red-600 font-mono">
                      {parseFloat(asset.changePercent24Hr).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentlyAdded.length > 0 && (
            <div className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">Recently Added</h2>
              </div>
              <div className="space-y-2">
                {recentlyAdded.map(asset => (
                  <div 
                    key={asset.id} 
                    className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedAssetId(asset.id)}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{asset.symbol}</span>
                        <span className="text-gray-600">{asset.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(asset.listedDate, { addSuffix: true, locale: tr })} eklendi
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-blue-600 font-mono">
                        Rank #{asset.rank}
                      </span>
                      <span className={`text-sm font-mono ${parseFloat(asset.changePercent24Hr) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(asset.changePercent24Hr) >= 0 ? '+' : ''}{parseFloat(asset.changePercent24Hr).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <Input
              placeholder="Search by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-black"
            />
          </div>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full md:w-[200px] border-2 border-black">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rank">Market Cap Rank</SelectItem>
              <SelectItem value="priceHighToLow">Price (High to Low)</SelectItem>
              <SelectItem value="priceLowToHigh">Price (Low to High)</SelectItem>
              <SelectItem value="change24h">24h Change</SelectItem>
              <SelectItem value="volume24h">24h Volume</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset: any) => (
            <CryptoCard
              key={asset.id}
              {...asset}
              onClick={() => setSelectedAssetId(asset.id)}
            />
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No assets found matching your search criteria</p>
          </div>
        )}
      </div>
      <AssetDetailsDialog
        assetId={selectedAssetId}
        onClose={() => setSelectedAssetId(null)}
      />
    </div>
  );
};

export default Index;