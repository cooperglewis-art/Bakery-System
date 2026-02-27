export interface ForecastPoint {
  date: string;
  actual?: number;
  predicted?: number;
}

export interface CostTrendPoint {
  date: string;
  unitCost: number;
  rollingAverage?: number;
}

export interface ReorderAlert {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  currentStock: number;
  forecastedUsage14d: number;
  daysRemaining: number;
  minStockLevel: number | null;
}
