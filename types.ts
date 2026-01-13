export interface RippleData {
  id: number;
  x: number;
  y: number;
  text: string;
}

export interface TouchPosition {
  x: number;
  y: number;
}

// Key is YYYY-MM-DD, Value is the count for that day
export type DailyHistory = Record<string, number>;

export interface ChartDataPoint {
  label: string;
  value: number;
  isToday?: boolean;
}

export interface LogEntry {
  dateKey: string;
  count: number;
  formattedDate: string;
}

export type TimeRange = 'week' | 'month' | 'year' | 'log';