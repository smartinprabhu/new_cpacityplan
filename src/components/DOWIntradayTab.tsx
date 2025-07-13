import React, { useState, useMemo } from 'react';
import { Calendar, BarChart3, Table, Download, TrendingUp, BarChart, Activity } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

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
}

const DOWIntradayTab: React.FC = () => {
  const [activeView, setActiveView] = useState<'table' | 'chart'>('chart');
  const [analysisType, setAnalysisType] = useState<'dow' | 'intraday'>('dow');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('bar');
  const [aggregationType, setAggregationType] = useState<'halfhour' | 'hourly' | 'daily' | 'weekly' | 'monthly'>('halfhour');
  const [filters, setFilters] = useState<Filters>({
    businessUnit: 'All',
    lineOfBusiness: 'All',
    dateRange: {
      start: '2024-03-09',
      end: '2024-03-18'
    },
    selectedDOW: 'All'
  });

  // Sample data
  const sampleData: IntradayData[] = [
    {
      lob: 'Retail',
      dow: 'Saturday',
      date: '2024-03-09',
      halfHourData: [135, 91, 119, 102, 36, 23, 126, 89, 145, 67, 123, 78, 156, 134, 98, 112, 87, 145, 167, 189, 201, 178, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134]
    },
    {
      lob: 'Retail',
      dow: 'Sunday',
      date: '2024-03-10',
      halfHourData: [157, 56, 30, 69, 154, 124, 145, 78, 123, 89, 145, 167, 189, 156, 134, 123, 145, 167, 189, 201, 178, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123]
    },
    {
      lob: 'Retail',
      dow: 'Monday',
      date: '2024-03-11',
      halfHourData: [45, 111, 160, 92, 60, 155, 67, 89, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 201, 178, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145]
    },
    {
      lob: 'Retail',
      dow: 'Tuesday',
      date: '2024-03-12',
      halfHourData: [148, 60, 154, 92, 29, 163, 28, 67, 89, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 201, 178, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123]
    },
    {
      lob: 'Retail',
      dow: 'Wednesday',
      date: '2024-03-13',
      halfHourData: [37, 148, 109, 104, 157, 134, 28, 89, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 201, 178, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145]
    },
    {
      lob: 'Retail',
      dow: 'Thursday',
      date: '2024-03-14',
      halfHourData: [147, 62, 129, 35, 105, 56, 102, 89, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 201, 178, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145]
    },
    {
      lob: 'Retail',
      dow: 'Friday',
      date: '2024-03-15',
      halfHourData: [55, 145, 53, 23, 114, 164, 56, 89, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 201, 178, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145]
    },
    {
      lob: 'Retail',
      dow: 'Saturday',
      date: '2024-03-16',
      halfHourData: [27, 27, 46, 85, 64, 27, 46, 89, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 201, 178, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145]
    },
    {
      lob: 'Retail',
      dow: 'Sunday',
      date: '2024-03-17',
      halfHourData: [49, 164, 47, 111, 129, 59, 26, 89, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 201, 178, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145]
    },
    {
      lob: 'Retail',
      dow: 'Monday',
      date: '2024-03-18',
      halfHourData: [107, 23, 147, 123, 72, 78, 44, 89, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 201, 178, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145, 167, 189, 156, 134, 123, 145]
    }
  ];

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    return sampleData.filter(item => {
      const itemDate = new Date(item.date);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      const dateInRange = itemDate >= startDate && itemDate <= endDate;
      const dowMatch = filters.selectedDOW === 'All' || item.dow === filters.selectedDOW;
      const lobMatch = filters.lineOfBusiness === 'All' || item.lob === filters.lineOfBusiness;
      
      return dateInRange && dowMatch && lobMatch;
    });
  }, [filters, sampleData]);

  // Generate chart data based on aggregation type
  const chartData = useMemo(() => {
    if (analysisType === 'dow') {
      // DOW analysis - aggregate by day of week
      const dowData: { [key: string]: number } = {};
      
      filteredData.forEach(dayData => {
        if (!dowData[dayData.dow]) {
          dowData[dayData.dow] = 0;
        }
        const totalVolume = dayData.halfHourData.reduce((sum, vol) => sum + vol, 0);
        dowData[dayData.dow] += totalVolume;
      });

      const dowOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return dowOrder.map(dow => ({
        name: dow,
        volume: dowData[dow] || 0
      })).filter(item => item.volume > 0);
    } else {
      // Intraday analysis
      switch (aggregationType) {
        case 'halfhour':
          // Show each half-hour interval for each date
          const halfHourData: any[] = [];
          filteredData.forEach(dayData => {
            dayData.halfHourData.forEach((volume, index) => {
              const hour = Math.floor(index / 2);
              const minute = (index % 2) * 30;
              const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              halfHourData.push({
                name: `${dayData.date} ${timeLabel}`,
                time: timeLabel,
                date: dayData.date,
                volume: volume
              });
            });
          });
          return halfHourData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        case 'hourly':
          // Aggregate half-hour data into hourly
          const hourlyData: any[] = [];
          filteredData.forEach(dayData => {
            for (let hour = 0; hour < 24; hour++) {
              const firstHalf = dayData.halfHourData[hour * 2] || 0;
              const secondHalf = dayData.halfHourData[hour * 2 + 1] || 0;
              const hourlyVolume = firstHalf + secondHalf;
              
              hourlyData.push({
                name: `${dayData.date} ${hour.toString().padStart(2, '0')}:00`,
                time: `${hour.toString().padStart(2, '0')}:00`,
                date: dayData.date,
                volume: hourlyVolume
              });
            }
          });
          return hourlyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        case 'daily':
          // Show daily totals
          return filteredData.map(dayData => ({
            name: dayData.date,
            date: dayData.date,
            volume: dayData.halfHourData.reduce((sum, vol) => sum + vol, 0)
          })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        case 'weekly':
          // Aggregate by week
          const weeklyData: { [key: string]: number } = {};
          filteredData.forEach(dayData => {
            const date = new Date(dayData.date);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
            const weekKey = weekStart.toISOString().split('T')[0];
            
            if (!weeklyData[weekKey]) {
              weeklyData[weekKey] = 0;
            }
            const totalVolume = dayData.halfHourData.reduce((sum, vol) => sum + vol, 0);
            weeklyData[weekKey] += totalVolume;
          });

          return Object.entries(weeklyData).map(([week, volume]) => ({
            name: `Week of ${week}`,
            date: week,
            volume
          })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        case 'monthly':
          // Aggregate by month
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

          return Object.entries(monthlyData).map(([month, volume]) => ({
            name: month,
            date: month,
            volume
          })).sort((a, b) => a.date.localeCompare(b.date));

        default:
          return [];
      }
    }
  }, [filteredData, analysisType, aggregationType]);

  // Format volume for display
  const formatVolume = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{label}</p>
          <p className="text-blue-400 font-semibold">
            Volume: {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-96 text-gray-400">
          No data available for the selected filters
        </div>
      );
    }

    const totalVolume = chartData.reduce((sum, item) => sum + item.volume, 0);

    return (
      <div className="space-y-6">
        {/* Chart Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            {/* Chart Type Selector */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              {[
                { type: 'bar', icon: BarChart, label: 'Bar' },
                { type: 'line', icon: TrendingUp, label: 'Line' },
                { type: 'area', icon: Activity, label: 'Area' }
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    chartType === type
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Aggregation Type Selector (only for intraday) */}
            {analysisType === 'intraday' && (
              <div className="flex bg-gray-700 rounded-lg p-1">
                {[
                  { type: 'halfhour', label: 'Half-Hour' },
                  { type: 'hourly', label: 'Hourly' },
                  { type: 'daily', label: 'Daily' },
                  { type: 'weekly', label: 'Weekly' },
                  { type: 'monthly', label: 'Monthly' }
                ].map(({ type, label }) => (
                  <button
                    key={type}
                    onClick={() => setAggregationType(type as any)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      aggregationType === type
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Volume</p>
            <p className="text-lg font-semibold text-white">{totalVolume.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{chartData.length} data points</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {analysisType === 'dow' 
              ? 'Volume by Day of Week' 
              : `Volume by ${aggregationType.charAt(0).toUpperCase() + aggregationType.slice(1)}`
            }
          </h3>
          
          <div style={{ width: '100%', height: '400px', overflowX: 'auto' }}>
            <ResponsiveContainer width={Math.max(800, chartData.length * 50)} height={400}>
              {chartType === 'bar' ? (
                <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF"
                    angle={chartData.length > 10 ? -45 : 0}
                    textAnchor={chartData.length > 10 ? 'end' : 'middle'}
                    height={chartData.length > 10 ? 80 : 60}
                    interval={0}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tickFormatter={formatVolume}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="volume" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </RechartsBarChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF"
                    angle={chartData.length > 10 ? -45 : 0}
                    textAnchor={chartData.length > 10 ? 'end' : 'middle'}
                    height={chartData.length > 10 ? 80 : 60}
                    interval={0}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tickFormatter={formatVolume}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF"
                    angle={chartData.length > 10 ? -45 : 0}
                    textAnchor={chartData.length > 10 ? 'end' : 'middle'}
                    height={chartData.length > 10 ? 80 : 60}
                    interval={0}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tickFormatter={formatVolume}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorVolume)"
                    strokeWidth={2}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderDOWTableView = () => {
    const dowData: { [key: string]: { total: number; days: number } } = {};
    
    filteredData.forEach(dayData => {
      if (!dowData[dayData.dow]) {
        dowData[dayData.dow] = { total: 0, days: 0 };
      }
      const totalVolume = dayData.halfHourData.reduce((sum, vol) => sum + vol, 0);
      dowData[dayData.dow].total += totalVolume;
      dowData[dayData.dow].days += 1;
      dowData[dayData.dow].days += 1;
    });

    const grandTotal = Object.values(dowData).reduce((sum, data) => sum + data.total, 0);
    const dowOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 sticky left-0 bg-gray-700 z-20">
                  Day of Week
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-200">
                  Total Volume
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-200">
                  Avg per Day
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-200">
                  Avg per Day
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-200 sticky right-0 bg-gray-700 z-30">
                  <div>Total & %</div>
                  <div className="text-xs text-gray-400 font-normal">Avg & %</div>
                  <div className="text-xs text-gray-400 font-normal">Avg & %</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {dowOrder.map((dow, index) => {
                const data = dowData[dow];
                if (!data) return null;
                
                const percentage = grandTotal > 0 ? (data.total / grandTotal * 100) : 0;
                const avgPerDay = data.days > 0 ? data.total / data.days : 0;
                const avgPercentage = grandTotal > 0 ? (avgPerDay / (grandTotal / Object.keys(dowData).length) * 100) : 0;
                
                return (
                  <tr key={dow} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                    <td className="px-6 py-4 text-sm font-medium text-white sticky left-0 bg-inherit z-10">
                      {dow}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 text-right">
                      {data.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 text-right">
                      {Math.round(avgPerDay).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 text-right">
                      {Math.round(avgPerDay).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right sticky right-0 bg-inherit z-20">
                      <div className="text-white font-medium">
                        {data.total.toLocaleString()} ({percentage.toFixed(1)}%)
                      </div>
                      <div className="text-gray-400 text-xs">
                        {Math.round(avgPerDay).toLocaleString()} ({avgPercentage.toFixed(1)}%)
                      </div>
                      <div className="text-gray-400 text-xs">
                        {Math.round(avgPerDay).toLocaleString()} ({avgPercentage.toFixed(1)}%)
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-blue-900 border-t-2 border-blue-600">
                <td className="px-6 py-4 text-sm font-bold text-white sticky left-0 bg-blue-900 z-10">
                  Total
                </td>
                <td className="px-6 py-4 text-sm font-bold text-white text-right">
                  {grandTotal.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-white text-right">
                  {Math.round(grandTotal / Object.keys(dowData).length).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-white text-right">
                  {Math.round(grandTotal / Object.keys(dowData).length).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-white text-right sticky right-0 bg-blue-900 z-20">
                  <div>{grandTotal.toLocaleString()} (100.0%)</div>
                  <div className="text-blue-200 text-xs">
                    {Math.round(grandTotal / Object.keys(dowData).length).toLocaleString()} (100.0%)
                  </div>
                  <div className="text-blue-200 text-xs">
                    {Math.round(grandTotal / Object.keys(dowData).length).toLocaleString()} (100.0%)
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
    if (filteredData.length === 0) {
      return (
        <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
          No data available for the selected filters
        </div>
      );
    }

    const timeLabels = Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(i / 2);
      const minute = (i % 2) * 30;
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    });

    const hourlyTotals = timeLabels.map((_, timeIndex) => {
      return filteredData.reduce((sum, dayData) => sum + (dayData.halfHourData[timeIndex] || 0), 0);
    });

    const dailyTotals = filteredData.map(dayData => 
      dayData.halfHourData.reduce((sum, vol) => sum + vol, 0)
    );

    const grandTotal = dailyTotals.reduce((sum, total) => sum + total, 0);

    const hourlyTotals = timeLabels.map((_, timeIndex) => {
      return filteredData.reduce((sum, dayData) => sum + (dayData.halfHourData[timeIndex] || 0), 0);
    });

    const dailyTotals = filteredData.map(dayData => 
      dayData.halfHourData.reduce((sum, vol) => sum + vol, 0)
    );

    const grandTotal = dailyTotals.reduce((sum, total) => sum + total, 0);

    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200 sticky left-0 bg-gray-700 z-20">
                  <div>Time</div>
                  <div>Interval</div>
                  <div>Interval</div>
                </th>
                {filteredData.map((dayData, index) => {
                  const date = new Date(dayData.date);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  
                  const date = new Date(dayData.date);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  
                  return (
                    <th key={index} className="px-4 py-3 text-center text-sm font-semibold text-gray-200 min-w-[100px]">
                      <div>{dayName}</div>
                      <div>{monthDay}</div>
                      <div>{monthDay}</div>
                    </th>
                  );
                })}
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-200 sticky right-0 bg-gray-700 z-30 min-w-[120px]">
                  <div>Hourly Total</div>
                  <div className="text-xs text-gray-400 font-normal">Sum & %</div>
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-200 sticky right-0 bg-gray-700 z-30 min-w-[120px]">
                  <div>Hourly Total</div>
                  <div className="text-xs text-gray-400 font-normal">Sum & %</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {timeLabels.map((timeLabel, timeIndex) => (
                <tr key={timeIndex} className={timeIndex % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                  <td className="px-4 py-3 text-sm font-medium text-white sticky left-0 bg-inherit z-10">
                    {timeLabel}
                  </td>
                  {filteredData.map((dayData, dayIndex) => (
                    <td key={dayIndex} className="px-4 py-3 text-sm text-gray-300 text-center">
                      {(dayData.halfHourData[timeIndex] || 0).toLocaleString()}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-sm text-center sticky right-0 bg-inherit z-20">
                    <div className="text-white font-medium">
                      {hourlyTotals[timeIndex].toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-xs">
                      ({grandTotal > 0 ? ((hourlyTotals[timeIndex] / grandTotal) * 100).toFixed(1) : '0.0'}%)
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center sticky right-0 bg-inherit z-20">
                    <div className="text-white font-medium">
                      {hourlyTotals[timeIndex].toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-xs">
                      ({grandTotal > 0 ? ((hourlyTotals[timeIndex] / grandTotal) * 100).toFixed(1) : '0.0'}%)
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-900 border-t-2 border-blue-600">
                <td className="px-4 py-3 text-sm font-bold text-white sticky left-0 bg-blue-900 z-10">
                  <div>Daily</div>
                  <div>Total</div>
                </td>
                {dailyTotals.map((total, index) => (
                  <td key={index} className="px-4 py-3 text-sm font-bold text-white text-center">
                    <div>{total.toLocaleString()}</div>
                    <div className="text-blue-200 text-xs">(100.0%)</div>
                  </td>
                ))}
                <td className="px-4 py-3 text-sm font-bold text-white text-center sticky right-0 bg-blue-900 z-20">
                  <div>{grandTotal.toLocaleString()}</div>
                  <div className="text-blue-200 text-xs">(100.0%)</div>
                </td>
              </tr>
              <tr className="bg-blue-900 border-t-2 border-blue-600">
                <td className="px-4 py-3 text-sm font-bold text-white sticky left-0 bg-blue-900 z-10">
                  <div>Daily</div>
                  <div>Total</div>
                </td>
                {dailyTotals.map((total, index) => (
                  <td key={index} className="px-4 py-3 text-sm font-bold text-white text-center">
                    <div>{total.toLocaleString()}</div>
                    <div className="text-blue-200 text-xs">(100.0%)</div>
                  </td>
                ))}
                <td className="px-4 py-3 text-sm font-bold text-white text-center sticky right-0 bg-blue-900 z-20">
                  <div>{grandTotal.toLocaleString()}</div>
                  <div className="text-blue-200 text-xs">(100.0%)</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          {/* Analysis Type Toggle */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setAnalysisType('dow')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                analysisType === 'dow'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }`}
            >
              Day of Week
            </button>
            <button
              onClick={() => setAnalysisType('intraday')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                analysisType === 'intraday'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }`}
            >
              Intraday
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveView('chart')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'chart'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Chart
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }`}
            >
              <Table className="w-4 h-4" />
              Table
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          {/* DOW Filter */}
          <select
            value={filters.selectedDOW}
            onChange={(e) => setFilters(prev => ({ ...prev, selectedDOW: e.target.value }))}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Days</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>

          {/* Date Range */}
          <div className="flex gap-2 items-center">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, start: e.target.value }
              }))}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, end: e.target.value }
              }))}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Content */}
      {activeView === 'chart' ? (
        renderChart()
      ) : (
        analysisType === 'dow' ? renderDOWTableView() : renderIntradayTableView()
      )}
    </div>
  );
};

export default DOWIntradayTab;