import { DailyHistory, ChartDataPoint, TimeRange, LogEntry } from './types';
import { STORAGE_KEY } from './constants';

/**
 * Returns current date as YYYY-MM-DD string
 * Uses local time to respect user's midnight
 */
export const getTodayKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const loadHistory = (): DailyHistory => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to load history", e);
    return {};
  }
};

export const saveHistory = (history: DailyHistory) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save history", e);
  }
};

/**
 * Generates data points for the charts based on the selected range
 */
export const getChartData = (history: DailyHistory, range: TimeRange): ChartDataPoint[] => {
  const today = new Date();
  const data: ChartDataPoint[] = [];

  if (range === 'week' || range === 'month') {
    const daysBack = range === 'week' ? 7 : 30;
    
    for (let i = daysBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const val = history[key] || 0;
      
      // Label formatting
      let label = '';
      if (range === 'week') {
        // Mon, Tue
        label = d.toLocaleDateString('en-US', { weekday: 'short' }); 
      } else {
        // 1, 15, 30 (Day numbers)
        label = String(d.getDate());
      }

      data.push({
        label,
        value: val,
        isToday: i === 0
      });
    }
  } else if (range === 'year') {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      
      // Sum up all days in this month
      let monthTotal = 0;
      Object.keys(history).forEach(dateKey => {
        if (dateKey.startsWith(monthKey)) {
          monthTotal += history[dateKey];
        }
      });

      data.push({
        label: d.toLocaleDateString('en-US', { month: 'short' }), // Jan, Feb
        value: monthTotal,
        isToday: i === 0 // Current month
      });
    }
  }

  return data;
};

/**
 * Generates a sorted list of daily entries for the log view
 */
export const getLogData = (history: DailyHistory): LogEntry[] => {
  return Object.entries(history)
    .sort((a, b) => b[0].localeCompare(a[0])) // Sort by date key descending (YYYY-MM-DD)
    .map(([dateKey, count]) => {
      const [y, m, d] = dateKey.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      
      return {
        dateKey,
        count,
        formattedDate: dateObj.toLocaleDateString('en-US', {
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric'
        })
      };
    });
};