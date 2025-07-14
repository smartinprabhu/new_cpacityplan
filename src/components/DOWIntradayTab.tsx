import React, { useState, useMemo } from 'react';
import { Calendar, BarChart3, Table, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Label } from 'recharts';

interface IntradayData {
  lob: string;
  dow: string;
  date: string;
  halfHourData: number[];
}

interface Filters {
  businessUnit: string;
  lineOfBusiness: string;
  dateRange: {
    start: string;
    end: string;
  };
  selectedDOW: string;
  aggregationType: 'daily' | 'monthly' | 'yearly';
  dailyFilters: string[];
  monthlyFilters: string[];
  yearlyFilters: number[];
  intradayFilters: { start: number; end: number };
}

const DOWIntradayTab: React.FC = () => {
  const [activeView, setActiveView] = useState<'table' | 'chart'>('chart');
  const [analysisType, setAnalysisType] = useState<'dow' | 'intraday'>('dow');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [aggregationType, setAggregationType] = useState<'halfhour' | 'hourly' | 'daily' | 'weekly' | 'monthly'>('halfhour');
  const [filters, setFilters] = useState<Filters>({
    businessUnit: 'POS',
    lineOfBusiness: 'Phone',
    dateRange: {
      start: '2024-01-28',
      end: '2024-03-18'
    },
    selectedDOW: '',
    aggregationType: 'daily',
    dailyFilters: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    monthlyFilters: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    yearlyFilters: [new Date().getFullYear()],
    intradayFilters: { start: 0, end: 24 },
  });

  // Business Units - POS is the main BU
  const businessUnits = ['POS'];
  
  // Lines of Business - Phone, Chat, Case Types, etc.
  const linesOfBusiness = [
    'Phone', 
    'Chat', 
    'Case Type 1', 
    'Case Type 2', 
    'Case Type 3', 
    'Case Type 4', 
    'Case Type 5', 
    'Case Type 6'
  ];

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Generate all dates within the range
  const datesInRange = useMemo(() => {
    const dates = [];
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      dates.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: daysOfWeek[date.getDay()],
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    return dates;
  }, [filters.dateRange]);

  // Get days of week that fall within the selected date range
  const availableDOWs = useMemo(() => {
    const availableDays = new Set<string>();
    datesInRange.forEach(dateInfo => {
      availableDays.add(dateInfo.dayOfWeek);
    });
    return Array.from(availableDays).sort((a, b) => {
      return daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b);
    });
  }, [datesInRange]);

  // Generate mock intraday data for the date range
  const generateIntradayData = useMemo(() => {
    let data: IntradayData[] = [];
    
    datesInRange.forEach(({ date, dayOfWeek }) => {
      const halfHourData = Array.from({ length: 48 }, (_, index) => {
        // Generate volume data with realistic patterns based on time of day
        const hour = Math.floor(index / 2);
        const isBusinessHour = hour >= 8 && hour <= 18;
        const baseVolume = isBusinessHour ? Math.random() * 800 + 200 : Math.random() * 100 + 10;
        
        // Add some variation based on LOB type
        let lobMultiplier = 1;
        if (filters.lineOfBusiness === 'Phone') lobMultiplier = 1.5;
        else if (filters.lineOfBusiness === 'Chat') lobMultiplier = 1.2;
        else if (filters.lineOfBusiness.startsWith('Case Type')) lobMultiplier = 0.8;
        
        return Math.floor(baseVolume * lobMultiplier);
      });
      
      data.push({
        lob: filters.lineOfBusiness,
        dow: dayOfWeek,
        date,
        halfHourData
      });
    });

    // Apply aggregation filters
    if (analysisType === 'intraday') {
      if (filters.aggregationType === 'daily' && filters.dailyFilters.length > 0) {
        data = data.filter(item => filters.dailyFilters.includes(item.dow));
      }
      if (filters.aggregationType === 'monthly' && filters.monthlyFilters.length > 0) {
        data = data.filter(item => {
          const month = new Date(item.date).toLocaleString('en-US', { month: 'long' });
          return filters.monthlyFilters.includes(month);
        });
      }
      if (filters.aggregationType === 'yearly' && filters.yearlyFilters.length > 0) {
        data = data.filter(item => {
          const year = new Date(item.date).getFullYear();
          return filters.yearlyFilters.includes(year);
        });
      }

      data = data.map(item => {
        const halfHourData = item.halfHourData.map((volume, index) => {
          const hour = Math.floor(index / 2);
          if (hour >= filters.intradayFilters.start && hour < filters.intradayFilters.end) {
            return volume;
          }
          return 0;
        });
        return { ...item, halfHourData };
      });
    }
    
    return data;
  }, [datesInRange, filters]);

  // Calculate DOW averages
  const dowAverages = useMemo(() => {
    const dowData: { [key: string]: { totalVolume: number; count: number; halfHourTotals: number[] } } = {};
    
    // Initialize DOW data
    availableDOWs.forEach(dow => {
      dowData[dow] = {
        totalVolume: 0,
        count: 0,
        halfHourTotals: new Array(48).fill(0)
      };
    });

    // Aggregate data by DOW
    generateIntradayData.forEach(item => {
      if (dowData[item.dow]) {
        dowData[item.dow].count++;
        item.halfHourData.forEach((volume, index) => {
          dowData[item.dow].halfHourTotals[index] += volume;
          dowData[item.dow].totalVolume += volume;
        });
      }
    });

    // Calculate averages and percentages
    const result = availableDOWs.map(dow => {
      const data = dowData[dow];
      const avgHalfHourData = data.halfHourTotals.map(total => 
        data.count > 0 ? Math.round(total / data.count) : 0
      );
      const avgTotalVolume = data.count > 0 ? Math.round(data.totalVolume / data.count) : 0;
      
      // Calculate percentages for each half hour
      const percentages = avgHalfHourData.map(volume => 
        avgTotalVolume > 0 ? ((volume / avgTotalVolume) * 100) : 0
      );

      return {
        dow,
        avgHalfHourData,
        avgTotalVolume,
        percentages,
        count: data.count
      };
    });

    return result;
  }, [generateIntradayData, availableDOWs]);

  // Generate time slots for table headers
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  // Calculate week numbers for display
  const weekInfo = useMemo(() => {
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    
    const startWeek = Math.ceil((startDate.getTime() - new Date(startDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const endWeek = Math.ceil((endDate.getTime() - new Date(endDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    return {
      startWeek: `WK${startWeek}`,
      endWeek: `WK${endWeek}`,
      startDate: filters.dateRange.start,
      endDate: filters.dateRange.end
    };
  }, [filters.dateRange]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value
      };
      
      // Reset DOW selection if date range changes
      if (key === 'dateRange') {
        newFilters.selectedDOW = '';
      }
      
      return newFilters;
    });
  };

  const renderDOWTableView = () => {
    const dataToShow = filters.selectedDOW 
      ? dowAverages.filter(item => item.dow === filters.selectedDOW)
      : dowAverages;

    return (
      <div className="bg-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-auto max-h-96">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-600 sticky top-0 z-20">
                <th className="px-4 py-3 text-left text-sm font-medium text-white border-r border-slate-500 sticky left-0 bg-slate-600 z-30">
                  Time Interval
                </th>
                {dataToShow.map((dowData, index) => (
                  <th key={index} className="px-3 py-3 text-center text-sm font-medium text-white border-r border-slate-500 min-w-[120px]">
                    <div className="flex flex-col">
                      <span>{dowData.dow}</span>
                      <span className="text-xs text-gray-300">Avg: {dowData.avgTotalVolume.toLocaleString()}</span>
                    </div>
                  </th>
                ))}
                <th className="px-3 py-3 text-center text-sm font-medium text-white border-r border-slate-500 min-w-[120px] sticky right-0 bg-slate-600 z-30">
                  <div className="flex flex-col">
                    <span>Hourly Total</span>
                    <span className="text-xs text-gray-300">Avg & %</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((timeSlot, timeIndex) => (
                <tr key={timeIndex} className={timeIndex % 2 === 0 ? 'bg-slate-700' : 'bg-slate-750'}>
                  <td className="px-4 py-2 text-sm font-medium text-white border-r border-slate-600 sticky left-0 bg-slate-700 z-10">
                    {timeSlot}
                  </td>
                  {dataToShow.map((dowData, dowIndex) => {
                    const volume = dowData.avgHalfHourData[timeIndex];
                    const percentage = dowData.percentages[timeIndex];
                    
                    return (
                      <td key={dowIndex} className="px-3 py-2 text-center text-sm border-r border-slate-600">
                        <div className="flex flex-col">
                          <span className="text-gray-300">{volume.toLocaleString()}</span>
                          <span className="text-xs text-blue-400">{percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center text-sm border-r border-slate-600 sticky right-0 bg-slate-700 z-10">
                    <div className="flex flex-col">
                      <span className="text-gray-300 font-semibold">
                        {dataToShow.reduce((sum, dowData) => sum + dowData.avgHalfHourData[timeIndex], 0).toLocaleString()}
                      </span>
                      <span className="text-xs text-blue-400">
                        {(dataToShow.reduce((sum, dowData) => sum + dowData.percentages[timeIndex], 0) / dataToShow.length).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {/* Total Row for DOW */}
              <tr className="bg-slate-600 sticky bottom-0 z-20 border-t-2 border-slate-500">
                <td className="px-4 py-3 text-sm font-bold text-white border-r border-slate-500 sticky left-0 bg-slate-600 z-30">
                  Total Average
                </td>
                {dataToShow.map((dowData, dowIndex) => (
                  <td key={dowIndex} className="px-3 py-3 text-center text-sm border-r border-slate-600">
                    <div className="flex flex-col">
                      <span className="text-white font-semibold">{dowData.avgTotalVolume.toLocaleString()}</span>
                      <span className="text-xs text-blue-400">100.0%</span>
                    </div>
                  </td>
                ))}
                <td className="px-3 py-3 text-center text-sm border-r border-slate-600 sticky right-0 bg-slate-600 z-30">
                  <div className="flex flex-col">
                    <span className="text-white font-bold">
                      {dataToShow.reduce((sum, dowData) => sum + dowData.avgTotalVolume, 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-blue-400">100.0%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderIntradayTableView = () => {
    const intradayData = generateIntradayData.filter(item => 
      !filters.selectedDOW || item.dow === filters.selectedDOW
    );
    
    const datesToShow = datesInRange.filter(dateInfo => {
      if (filters.selectedDOW && dateInfo.dayOfWeek !== filters.selectedDOW) {
        return false;
      }
      return true;
    });

    return (
      <div className="bg-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-auto max-h-96">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-600 sticky top-0 z-20">
                <th className="px-4 py-3 text-left text-sm font-medium text-white border-r border-slate-500 sticky left-0 bg-slate-600 z-30">
                  Time Interval
                </th>
                {datesToShow.map((dateInfo, index) => (
                  <th key={index} className="px-3 py-3 text-center text-sm font-medium text-white border-r border-slate-500 min-w-[80px]">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-300">{dateInfo.dayOfWeek.slice(0, 3)}</span>
                      <span>{dateInfo.displayDate}</span>
                    </div>
                  </th>
                ))}
                <th className="px-3 py-3 text-center text-sm font-medium text-white border-r border-slate-500 min-w-[120px] sticky right-0 bg-slate-600 z-30">
                  <div className="flex flex-col">
                    <span>Hourly Total</span>
                    <span className="text-xs text-gray-300">Sum & %</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((timeSlot, timeIndex) => (
                <tr key={timeIndex} className={timeIndex % 2 === 0 ? 'bg-slate-700' : 'bg-slate-750'}>
                  <td className="px-4 py-2 text-sm font-medium text-white border-r border-slate-600 sticky left-0 bg-slate-700 z-10">
                    {timeSlot}
                  </td>
                  {datesToShow.map((dateInfo, dateIndex) => {
                    const dayData = intradayData.find(item => item.date === dateInfo.date);
                    const volume = dayData ? dayData.halfHourData[timeIndex] : 0;
                    
                    return (
                      <td key={dateIndex} className="px-3 py-2 text-center text-sm text-gray-300 border-r border-slate-600">
                        {volume.toLocaleString()}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center text-sm border-r border-slate-600 sticky right-0 bg-slate-700 z-10">
                    <span className="text-gray-300 font-semibold">
                      {datesToShow.reduce((sum, dateInfo) => {
                        const dayData = intradayData.find(item => item.date === dateInfo.date);
                        return sum + (dayData ? dayData.halfHourData[timeIndex] : 0);
                      }, 0).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {/* Total Row for Intraday */}
              <tr className="bg-slate-600 sticky bottom-0 z-20 border-t-2 border-slate-500">
                <td className="px-4 py-3 text-sm font-bold text-white border-r border-slate-500 sticky left-0 bg-slate-600 z-30">
                  Daily Total
                </td>
                {datesToShow.map((dateInfo, dateIndex) => {
                  const dayData = intradayData.find(item => item.date === dateInfo.date);
                  const dailyTotal = dayData ? dayData.halfHourData.reduce((sum, vol) => sum + vol, 0) : 0;
                  
                  return (
                    <td key={dateIndex} className="px-3 py-3 text-center text-sm text-white font-semibold border-r border-slate-600">
                      {dailyTotal.toLocaleString()}
                    </td>
                  );
                })}
                <td className="px-3 py-3 text-center text-sm border-r border-slate-600 sticky right-0 bg-slate-600 z-30">
                  <span className="text-white font-bold">
                    {datesToShow.reduce((sum, dateInfo) => {
                      const dayData = intradayData.find(item => item.date === dateInfo.date);
                      return sum + (dayData ? dayData.halfHourData.reduce((daySum, vol) => daySum + vol, 0) : 0);
                    }, 0).toLocaleString()}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDOWChartView = () => {
    const dataToShow = filters.selectedDOW 
      ? dowAverages.filter(item => item.dow === filters.selectedDOW)
      : dowAverages;

    const maxVolume = Math.max(...dataToShow.map(d => d.avgTotalVolume));

    return (
      <div className="bg-slate-700 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Average Volume Distribution by Day of Week</h3>
          <p className="text-sm text-gray-400">
            Selected LOB: {filters.lineOfBusiness} | Date Range: {weekInfo.startWeek} - {weekInfo.endWeek}
          </p>
        </div>
        
        <div className="flex items-end justify-between h-96 bg-slate-800 rounded p-4">
          {dataToShow.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1 mx-1">
              <div 
                className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-400 cursor-pointer"
                style={{ 
                  height: `${maxVolume > 0 ? (item.avgTotalVolume / maxVolume) * 300 : 10}px`,
                  minHeight: '10px'
                }}
                title={`${item.dow}: ${item.avgTotalVolume.toLocaleString()} avg volume (${item.count} days)`}
              />
              <div className="mt-2 text-sm text-gray-300 font-medium">
                {item.dow.slice(0, 3)}
              </div>
              <div className="text-xs text-gray-400">
                {item.avgTotalVolume.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderIntradayChartView = () => {
    // Filter data based on selected DOW
    const filteredData = generateIntradayData.filter(item => 
      !filters.selectedDOW || item.dow === filters.selectedDOW
    );

    let chartData: { label: string; value: number; date?: string }[] = [];
    let xAxisLabel = '';
    let yAxisLabel = 'Volume';

    switch (aggregationType) {
      case 'halfhour':
        // Show half-hour data across all selected dates
        chartData = [];
        filteredData.forEach(dayData => {
          dayData.halfHourData.forEach((volume, index) => {
            const hour = Math.floor(index / 2);
            const minute = (index % 2) * 30;
            const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const dateLabel = new Date(dayData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            chartData.push({
              label: `${dateLabel} ${timeLabel}`,
              value: volume,
              date: dayData.date
            });
          });
        });
        xAxisLabel = 'Date & Time (Half-Hour Intervals)';
        break;

      case 'hourly':
        // Aggregate half-hour data into hourly
        const hourlyData: { [key: string]: number } = {};
        filteredData.forEach(dayData => {
          for (let hour = 0; hour < 24; hour++) {
            const hourKey = `${dayData.date}-${hour.toString().padStart(2, '0')}:00`;
            const halfHour1 = dayData.halfHourData[hour * 2] || 0;
            const halfHour2 = dayData.halfHourData[hour * 2 + 1] || 0;
            hourlyData[hourKey] = halfHour1 + halfHour2;
          }
        });
        
        chartData = Object.entries(hourlyData).map(([key, value]) => {
          const [date, time] = key.split('-');
          const dateLabel = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return {
            label: `${dateLabel} ${time}`,
            value,
            date
          };
        });
        xAxisLabel = 'Date & Time (Hourly)';
        break;

      case 'daily':
        // Aggregate to daily totals
        chartData = filteredData.map(dayData => {
          const totalVolume = dayData.halfHourData.reduce((sum, vol) => sum + vol, 0);
          const dateLabel = new Date(dayData.date).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          });
          return {
            label: dateLabel,
            value: totalVolume,
            date: dayData.date
          };
        });
        xAxisLabel = 'Date';
        break;

      case 'weekly':
        // Aggregate to weekly totals
        const weeklyData: { [key: string]: { volume: number; dates: string[] } } = {};
        filteredData.forEach(dayData => {
          const date = new Date(dayData.date);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
          const weekKey = weekStart.toISOString().split('T')[0];
          
          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = { volume: 0, dates: [] };
          }
          
          const totalVolume = dayData.halfHourData.reduce((sum, vol) => sum + vol, 0);
          weeklyData[weekKey].volume += totalVolume;
          weeklyData[weekKey].dates.push(dayData.date);
        });
        
        chartData = Object.entries(weeklyData).map(([weekStart, data]) => {
          const startDate = new Date(weekStart);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          
          return {
            label: `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            value: data.volume,
            date: weekStart
          };
        });
        xAxisLabel = 'Week';
        break;

      case 'monthly':
        // Aggregate to monthly totals
        const monthlyData: { [key: string]: number } = {};
        filteredData.forEach(dayData => {
          const date = new Date(dayData.date);
          const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
          }
          
          const totalVolume = dayData.halfHourData.reduce((sum, vol) => sum + vol, 0);
          monthlyData[monthKey] += totalVolume;
        });
        
        chartData = Object.entries(monthlyData).map(([monthKey, volume]) => {
          const [year, month] = monthKey.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          
          return {
            label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
            value: volume,
            date: monthKey
          };
        });
        xAxisLabel = 'Month';
        break;
    }

    // Sort chart data by date
    chartData.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return 0;
    });

    const maxVolume = Math.max(...chartData.map(d => d.value));
    const minVolume = Math.min(...chartData.map(d => d.value));

    const renderChart = () => {
      if (chartData.length === 0) {
        return (
          <div className="flex items-center justify-center h-96 text-gray-400">
            No data available for the selected filters
          </div>
        );
      }

      return (
        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'line' && (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="label" stroke="#94a3b8">
                <Label value={xAxisLabel} offset={-5} position="insideBottom" fill="#94a3b8" />
              </XAxis>
              <YAxis stroke="#94a3b8">
                <Label value={yAxisLabel} angle={-90} position="insideLeft" fill="#94a3b8" style={{ textAnchor: 'middle' }} />
              </YAxis>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Legend wrapperStyle={{ color: '#cbd5e1' }} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          )}
          {chartType === 'area' && (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="label" stroke="#94a3b8">
                <Label value={xAxisLabel} offset={-5} position="insideBottom" fill="#94a3b8" />
              </XAxis>
              <YAxis stroke="#94a3b8">
                <Label value={yAxisLabel} angle={-90} position="insideLeft" fill="#94a3b8" style={{ textAnchor: 'middle' }} />
              </YAxis>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Legend wrapperStyle={{ color: '#cbd5e1' }} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#areaGradient)" />
            </AreaChart>
          )}
          {chartType === 'bar' && (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="label" stroke="#94a3b8">
                <Label value={xAxisLabel} offset={-5} position="insideBottom" fill="#94a3b8" />
              </XAxis>
              <YAxis stroke="#94a3b8">
                <Label value={yAxisLabel} angle={-90} position="insideLeft" fill="#94a3b8" style={{ textAnchor: 'middle' }} />
              </YAxis>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Legend wrapperStyle={{ color: '#cbd5e1' }} />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          )}
        </ResponsiveContainer>
      );
    };
    return (
      <div className="bg-slate-700 rounded-lg p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {aggregationType === 'halfhour' ? 'Half-Hour Volume Distribution' :
                 aggregationType === 'hourly' ? 'Hourly Volume Distribution' :
                 aggregationType === 'daily' ? 'Daily Volume Distribution' :
                 aggregationType === 'weekly' ? 'Weekly Volume Distribution' :
                 'Monthly Volume Distribution'}
              </h3>
              <p className="text-sm text-gray-400">
                LOB: {filters.lineOfBusiness} | {weekInfo.startWeek} - {weekInfo.endWeek}
                {filters.selectedDOW && ` | Filtered: ${filters.selectedDOW}`}
              </p>
            </div>
            
            {/* Chart Type and Aggregation Controls */}
            <div className="flex items-center space-x-4">
              {/* Chart Type Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-300">Chart:</label>
                <select 
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as 'line' | 'bar' | 'area')}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="line">Line</option>
                  <option value="bar">Bar</option>
                  <option value="area">Area</option>
                </select>
              </div>
              
              {/* Aggregation Type Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-300">Aggregation:</label>
                <select 
                  value={aggregationType}
                  onChange={(e) => setAggregationType(e.target.value as 'halfhour' | 'hourly' | 'daily' | 'weekly' | 'monthly')}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="halfhour">Half-Hour</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart Container */}
        <div className="bg-slate-800 p-4 rounded-lg">
          {renderChart()}
        </div>
        
        {/* Chart Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <p className="text-sm text-gray-400">
            {xAxisLabel} | {yAxisLabel}: {chartData.reduce((sum, item) => sum + item.value, 0).toLocaleString()} total
          </p>
          <p className="text-sm text-gray-400">
            Data Points: {chartData.length} | Range: {minVolume.toLocaleString()} - {maxVolume.toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-800 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-white">Tactical Capacity Insights</h1>
              <p className="text-sm text-gray-400">DOW & Intraday Analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Analysis Type Toggle */}
              <div className="flex items-center bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => {
                    setAnalysisType('dow');
                  }}
                  className={`px-3 py-1 text-sm rounded ${analysisType === 'dow' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  DOW
                </button>
                <button
                  onClick={() => {
                    setAnalysisType('intraday');
                    setAggregationType('halfhour');
                  }}
                  className={`px-3 py-1 text-sm rounded ${analysisType === 'intraday' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Intraday
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('table')}
                  className={`px-3 py-1 text-sm rounded ${activeView === 'table' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Table className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveView('chart')}
                  className={`px-3 py-1 text-sm rounded ${activeView === 'chart' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>

              <button className="flex items-center px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 flex-wrap">
            {/* Business Unit */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-300">BU:</label>
              <select 
                value={filters.businessUnit}
                onChange={(e) => handleFilterChange('businessUnit', e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {businessUnits.map(bu => (
                  <option key={bu} value={bu}>{bu}</option>
                ))}
              </select>
            </div>

            {/* Line of Business - Single Select */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-300">LOB:</label>
              <select 
                value={filters.lineOfBusiness}
                onChange={(e) => handleFilterChange('lineOfBusiness', e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {linesOfBusiness.map(lob => (
                  <option key={lob} value={lob}>{lob}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">
                ({weekInfo.startWeek} - {weekInfo.endWeek})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DOW Filter - Only show when relevant */}
      <div className="px-6 py-4 bg-slate-850 border-b border-slate-700">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-300 font-medium">
              {analysisType === 'dow' ? 'Filter DOW:' : 'Filter Days:'}
            </label>
            <div className="flex space-x-1">
              <button
                onClick={() => handleFilterChange('selectedDOW', '')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  filters.selectedDOW === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                All
              </button>
              {availableDOWs.map(day => (
                <button
                  key={day}
                  onClick={() => handleFilterChange('selectedDOW', day)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    filters.selectedDOW === day
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Aggregation Filters */}
      {analysisType === 'intraday' && (
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-300 font-medium">Aggregation:</label>
            <select
              value={filters.aggregationType}
              onChange={(e) => handleFilterChange('aggregationType', e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>

            {filters.aggregationType === 'daily' && (
              <div className="flex items-center space-x-2">
                {daysOfWeek.map(day => (
                  <label key={day} className="flex items-center space-x-1 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={filters.dailyFilters.includes(day)}
                      onChange={() => {
                        const newFilters = filters.dailyFilters.includes(day)
                          ? filters.dailyFilters.filter(d => d !== day)
                          : [...filters.dailyFilters, day];
                        handleFilterChange('dailyFilters', newFilters);
                      }}
                      className="form-checkbox h-4 w-4 bg-slate-600 border-slate-500 text-blue-500 focus:ring-blue-500"
                    />
                    <span>{day.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            )}

            {filters.aggregationType === 'monthly' && (
              <div className="flex items-center space-x-2">
                {Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('en-US', { month: 'long' })).map(month => (
                  <label key={month} className="flex items-center space-x-1 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={filters.monthlyFilters.includes(month)}
                      onChange={() => {
                        const newFilters = filters.monthlyFilters.includes(month)
                          ? filters.monthlyFilters.filter(m => m !== month)
                          : [...filters.monthlyFilters, month];
                        handleFilterChange('monthlyFilters', newFilters);
                      }}
                      className="form-checkbox h-4 w-4 bg-slate-600 border-slate-500 text-blue-500 focus:ring-blue-500"
                    />
                    <span>{month.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            )}

            {filters.aggregationType === 'yearly' && (
              <div className="flex items-center space-x-2">
                <select
                  value={filters.yearlyFilters[0] || ''}
                  onChange={(e) => handleFilterChange('yearlyFilters', [parseInt(e.target.value)])}
                  className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {/* Populate with available years from data */}
                  {Array.from(new Set(datesInRange.map(d => new Date(d.date).getFullYear()))).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {analysisType === 'intraday' && (
            <div className="mt-4 flex items-center space-x-4">
              <label className="text-sm text-gray-300 font-medium">Filter Hours:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={filters.intradayFilters.start}
                  onChange={(e) => handleFilterChange('intradayFilters', { ...filters.intradayFilters, start: parseInt(e.target.value) })}
                  className="w-32"
                />
                <span>{filters.intradayFilters.start}:00</span>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={filters.intradayFilters.end}
                  onChange={(e) => handleFilterChange('intradayFilters', { ...filters.intradayFilters, end: parseInt(e.target.value) })}
                  className="w-32"
                />
                <span>{filters.intradayFilters.end}:00</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        {analysisType === 'dow' ? (
          activeView === 'table' ? renderDOWTableView() : renderDOWChartView()
        ) : (
          activeView === 'table' ? renderIntradayTableView() : renderIntradayChartView()
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700 text-center">
        <p className="text-xs text-gray-500">© 2025 Aptino. All rights reserved.</p>
      </div>
    </div>
  );
};

export default DOWIntradayTab;