declare module 'lightweight-charts' {
  export interface ChartOptions {
    width?: number;
    height?: number;
    layout?: {
      background?: {
        color?: string;
      };
      textColor?: string;
    };
    grid?: {
      vertLines?: {
        color?: string;
      };
      horzLines?: {
        color?: string;
      };
    };
    crosshair?: {
      mode?: CrosshairMode;
    };
    rightPriceScale?: {
      borderColor?: string;
    };
    timeScale?: {
      borderColor?: string;
      timeVisible?: boolean;
    };
  }

  interface BaseSeriesOptions {
    color?: string;
    lineWidth?: number;
    priceFormat?: {
      type: string;
    };
    priceScaleId?: string;
    scaleMargins?: {
      top: number;
      bottom: number;
    };
  }

  interface CandlestickSeriesOptions extends BaseSeriesOptions {
    upColor?: string;
    downColor?: string;
    borderVisible?: boolean;
    wickUpColor?: string;
    wickDownColor?: string;
  }

  interface LineSeriesOptions extends BaseSeriesOptions {
    color?: string;
    lineWidth?: number;
  }

  interface AreaSeriesOptions extends BaseSeriesOptions {
    lineColor?: string;
    topColor?: string;
    bottomColor?: string;
  }

  interface HistogramSeriesOptions extends BaseSeriesOptions {
    color?: string;
  }

  export interface IChartApi {
    applyOptions(options: ChartOptions): void;
    resize(width: number, height: number): void;
    timeScale(): ITimeScaleApi;
    addCandlestickSeries(options?: CandlestickSeriesOptions): ISeriesApi<'Candlestick'>;
    addLineSeries(options?: LineSeriesOptions): ISeriesApi<'Line'>;
    addAreaSeries(options?: AreaSeriesOptions): ISeriesApi<'Area'>;
    addHistogramSeries(options?: HistogramSeriesOptions): ISeriesApi<'Histogram'>;
    removeSeries(): void;
    remove(): void;
  }

  export interface ITimeScaleApi {
    fitContent(): void;
  }

  export interface ISeriesApi<T extends string> {
    setData(data: any[]): void;
  }

  export enum CrosshairMode {
    Normal = 0,
    Magnet = 1,
  }

  export function createChart(container: HTMLElement, options?: ChartOptions): IChartApi;
}
