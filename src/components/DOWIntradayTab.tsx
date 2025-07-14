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
      end: '2024-03-18',
    },
    selectedDOW: '',
    aggregationType: 'daily',
    dailyFilters: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    monthlyFilters: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    yearlyFilters: [new Date().getFullYear()],
    intradayFilters: { start: 0, end: 24 },
  });

  const businessUnits = ['POS'];
  const linesOfBusiness = [
    'Phone',
    'Chat',
    'Case Type 1',
    'Case Type 2',
    'Case Type 3',
    'Case Type 4',
    'Case Type 5',
    'Case Type 6',
  ];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Generate all dates within the range
  const datesInRange = useMemo(() => {
    const dates = [];
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
      return [];
    }
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      dates.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: daysOfWeek[date.getDay()],
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    return dates;
  }, [filters.dateRange]);

  // Get available days of the week
  const availableDOWs = useMemo(() => {
    const availableDays = new Set<string>();
    datesInRange.forEach((dateInfo) => availableDays.add(dateInfo.dayOfWeek));
    return Array.from(availableDays).sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));
  }, [datesInRange]);

  // Generate mock intraday data
  const generateIntradayData = useMemo(() => {
    const data: IntradayData[] = [];
    datesInRange.forEach(({ date, dayOfWeek }) => {
      const halfHourData = Array.from({ length: 48 }, (_, index) => {
        const hour = Math.floor(index / 2);
        const isBusinessHour = hour >= 8 && hour <= 18;
        const baseVolume = isBusinessHour ? Math.random() * 800 + 200 : Math.random() * 100 + 10;
        let lobMultiplier = 1;
        if (filters.lineOfBusiness === 'Phone') lobMultiplier = 1.5;
        else if (filters.lineOfBusiness === 'Chat') lobMultiplier = 1.2;
        else if (filters.lineOfBusiness.startsWith('Case Type')) lobMultiplier = 0.8;
        return Math.floor(baseVolume * lobMultiplier);
      });
      data.push({ lob: filters.lineOfBusiness, dow: dayOfWeek, date, halfHourData });
    });

    // Apply aggregation filters
    let filteredData = data;
    if (analysisType === 'intraday') {
      if (filters.aggregationType === 'daily' && filters.dailyFilters.length > 0) {
        filteredData = filteredData.filter((item) => filters.dailyFilters.includes(item.dow));
      }
      if (filters.aggregationType === 'monthly' && filters.monthlyFilters.length > 0) {
        filteredData = filteredData.filter((item) => {
          const month = new Date(item.date).toLocaleString('en-US', { month: 'long' });
          return filters.monthlyFilters.includes(month);
        });
      }
      if (filters.aggregationType === 'yearly' && filters.yearlyFilters.length > 0) {
        filteredData = filteredData.filter((item) => {
          const year = new Date(item.date).getFullYear();
          return filters.yearlyFilters.includes(year);
        });
      }
      filteredData = filteredData.map((item) => {
        const halfHourData = item.halfHourData.map((volume, index) => {
          const hour = Math.floor(index / 2);
          return hour >= filters.intradayFilters.start && hour < filters.intradayFilters.end ? volume : 0;
        });
        return { ...item, halfHourData };
      });
    }
    return filteredData;
  }, [datesInRange, filters, analysisType]);

  // Calculate DOW averages
  const dowAverages = useMemo(() => {
    const dowData: { [key: string]: { totalVolume: number; count: number; halfHourTotals: number[] } } = {};
    availableDOWs.forEach((dow) => {
      dowData[dow] = { totalVolume: 0, count: 0, halfHourTotals: new Array(48).fill(0) };
    });
    generateIntradayData.forEach((item) => {
      if (dowData[item.dow]) {
        dowData[item.dow].count++;
        item.halfHourData.forEach((volume, index) => {
          dowData[item.dow].halfHourTotals[index] += volume;
          dowData[item.dow].totalVolume += volume;
        });
      }
    });
    return availableDOWs.map((dow) => {
      const data = dowData[dow];
      const avgHalfHourData = data.halfHourTotals.map((total) => (data.count > 0 ? Math.round(total / data.count) : 0));
      const avgTotalVolume = data.count > 0 ? Math.round(data.totalVolume / data.count) : 0;
      const percentages = avgHalfHourData.map((volume) => (avgTotalVolume > 0 ? (volume / avgTotalVolume) * 100 : 0));
      return { dow, avgHalfHourData, avgTotalVolume, percentages, count: data.count };
    });
  }, [generateIntradayData, availableDOWs]);

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  // Calculate week numbers
  const weekInfo = useMemo(() => {
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    const startWeek = Math.ceil(
      (startDate.getTime() - new Date(startDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const endWeek = Math.ceil(
      (endDate.getTime() - new Date(endDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    return {
      startWeek: `WK${startWeek}`,
      endWeek: `WK${endWeek}`,
      startDate: filters.dateRange.start,
      endDate: filters.dateRange.end,
    };
  }, [filters.dateRange]);

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      if (key === 'dateRange') {
        newFilters.selectedDOW = '';
      }
      return newFilters;
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Time Interval', ...dowAverages.map((d) => d.dow), 'Hourly Total'];
    const rows = timeSlots.map((timeSlot, timeIndex) => {
      const row = [timeSlot];
      dowAverages.forEach((dowData) => {
        row.push(`${dowData.avgHalfHourData[timeIndex].toLocaleString()} (${dowData.percentages[timeIndex].toFixed(1)}%)`);
      });
      row.push(
        dowAverages
          .reduce((sum, dowData) => sum + dowData.avgHalfHourData[timeIndex], 0)
          .toLocaleString()
      );
      return row.join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'intraday_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Render DOW Table View
  const renderDOWTableView = () => {
    const dataToShow = filters.selectedDOW ? dowAverages.filter((item) => item.dow === filters.selectedDOW) : dowAverages;
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
                  <th
                    key={index}
                    className="px-3 py-3 text-center text-sm font-medium text-white border-r border-slate-500 min-w-[120px]"
                  >
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
                    const volume = dowData.avgHalfHourData[timeIndex] || 0;
                    const percentage = dowData.percentages[timeIndex] || 0;
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
                        {dataToShow
                          .reduce((sum, dowData) => sum + (dowData.avgHalfHourData[timeIndex] || 0), 0)
                          .toLocaleString()}
                      </span>
                      <span className="text-xs text-blue-400">
                        {(
                          dataToShow.reduce((sum, dowData) => sum + (dowData.percentages[timeIndex] || 0), 0) /
                          (dataToShow.length || 1)
                        ).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
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

  // Render Intraday Table View
  const renderIntradayTableView = () => {
    const intradayData = generateIntradayData.filter((item) => !filters.selectedDOW || item.dow === filters.selectedDOW);
    const datesToShow = datesInRange.filter((dateInfo) => !filters.selectedDOW || dateInfo.dayOfWeek === filters.selectedDOW);
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
                  <th
                    key={index}
                    className="px-3 py-3 text-center text-sm font-medium text-white border-r border-slate-500 min-w-[80px]"
                  >
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
                    const dayData = intradayData.find((item) => item.date === dateInfo.date);
                    const volume = dayData ? dayData.halfHourData[timeIndex] || 0 : 0;
                    return (
                      <td
                        key={dateIndex}
                        className="px-3 py-2 text-center text-sm text-gray-300 border-r border-slate-600"
                      >
                        {volume.toLocaleString()}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center text-sm border-r border-slate-600 sticky right-0 bg-slate-700 z-10">
                    <span className="text-gray-300 font-semibold">
                      {datesToShow
                        .reduce((sum, dateInfo) => {
                          const dayData = intradayData.find((item) => item.date === dateInfo.date);
                          return sum + (dayData ? dayData.halfHourData[timeIndex] || 0 : 0);
                        }, 0)
                        .toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-600 sticky bottom-0 z-20 border-t-2 border-slate-500">
                <td className="px-4 py-3 text-sm font-bold text-white border-r border-slate-500 sticky left-0 bg-slate-600 z-30">
                  Daily Total
                </td>
                {datesToShow.map((dateInfo, dateIndex) => {
                  const dayData = intradayData.find((item) => item.date === dateInfo.date);
                  const dailyTotal = dayData ? dayData.halfHourData.reduce((sum, vol) => sum + (vol || 0), 0) : 0;
                  return (
                    <td
                      key={dateIndex}
                      className="px-3 py-3 text-center text-sm text-white font-semibold border-r border-slate-600"
                    >
                      {dailyTotal.toLocaleString()}
                    </td>
                  );
                })}
                <td className="px-3 py-3 text-center text-sm border-r border-slate-600 sticky right-0 bg-slate-600 z-30">
                  <span className="text-white font-bold">
                    {datesToShow
                      .reduce((sum, dateInfo) => {
                        const dayData = intradayData.find((item) => item.date === dateInfo.date);
                        return sum + (dayData ? dayData.halfHourData.reduce((daySum, vol) => daySum + (vol || 0), 0) : 0);
                      }, 0)
                      .toLocaleString()}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render DOW Chart View
  const renderDOWChartView = () => {
    const dataToShow = filters.selectedDOW ? dowAverages.filter((item) => item.dow === filters.selectedDOW) : dowAverages;
    if (!dataToShow.length) {
      return <div className="flex items-center justify-center h-96 text-gray-400">No data available</div>;
    }
    return (
      <div className="bg-slate-700 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Average Volume Distribution by Day of Week</h3>
          <p className="text-sm text-gray-400">
            Selected LOB: {filters.lineOfBusiness} | Date Range: {weekInfo.startWeek} - {weekInfo.endWeek}
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dataToShow}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="dow" stroke="#94a3b8" label={{ value: 'Day of the Week', position: 'insideBottom', offset: -5, fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" label={{ value: 'Volume', angle: -90, position: 'insideLeft', textAnchor: 'middle', fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} labelStyle={{ color: '#cbd5e1' }} />
            <Legend wrapperStyle={{ color: '#cbd5e1' }} />
            <Bar dataKey="avgTotalVolume" fill="#3b82f6" name="Average Volume" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render Intraday Chart View
  const renderIntradayChartView = () => {
    const filteredData = generateIntradayData.filter((item) => !filters.selectedDOW || item.dow === filters.selectedDOW);
    let chartData: { label: string; value: number; date?: string }[] = [];
    let xAxisLabel = '';
    let yAxisLabel = 'Volume';
    let overallAverage = 0;

    switch (aggregationType) {
      case 'halfhour': // This will be displayed as "Intraday"
        chartData = filteredData.flatMap((dayData) =>
          dayData.halfHourData.map((volume, index) => {
            const hour = Math.floor(index / 2);
            const minute = (index % 2) * 30;
            const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const dateLabel = new Date(dayData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
            return { label: `${dateLabel} ${timeLabel}`, value: volume || 0, date: `${dayData.date}T${timeLabel}` };
          })
        ).filter((d) => d.value !== null && d.value !== undefined);
        xAxisLabel = 'Date & Time';
        break;

      case 'hourly':
        const hourlyData: { [key: string]: number } = {};
        filteredData.forEach((dayData) => {
          for (let hour = 0; hour < 24; hour++) {
            const hourKey = `${dayData.date}T${hour.toString().padStart(2, '0')}:00`;
            const halfHour1 = dayData.halfHourData[hour * 2] || 0;
            const halfHour2 = dayData.halfHourData[hour * 2 + 1] || 0;
            hourlyData[hourKey] = halfHour1 + halfHour2;
          }
        });
        chartData = Object.entries(hourlyData).map(([key, value]) => {
          const [date, time] = key.split('T');
          const dateLabel = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
          return { label: `${dateLabel} ${time}`, value: value || 0, date: key };
        }).filter((d) => d.value !== null && d.value !== undefined);
        xAxisLabel = 'Date & Time';
        break;

      case 'daily':
        chartData = filteredData.map((dayData) => {
          const totalVolume = dayData.halfHourData.reduce((sum, vol) => sum + (vol || 0), 0);
          const dateLabel = new Date(dayData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: '2-digit' });
          return { label: dateLabel, value: totalVolume, date: dayData.date };
        }).filter((d) => d.value !== null && d.value !== undefined);
        xAxisLabel = 'Date';
        break;

      case 'weekly':
        const weeklyData: { [key: string]: { volume: number; dates: string[] } } = {};
        filteredData.forEach((dayData) => {
          const date = new Date(dayData.date);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekKey = weekStart.toISOString().split('T')[0];
          if (!weeklyData[weekKey]) weeklyData[weekKey] = { volume: 0, dates: [] };
          const totalVolume = dayData.halfHourData.reduce((sum, vol) => sum + (vol || 0), 0);
          weeklyData[weekKey].volume += totalVolume;
          weeklyData[weekKey].dates.push(dayData.date);
        });
        chartData = Object.entries(weeklyData).map(([weekStart, data]) => {
          const startDate = new Date(weekStart);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          return {
            label: `Week ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            value: data.volume || 0,
            date: weekStart,
          };
        }).filter((d) => d.value !== null && d.value !== undefined);
        xAxisLabel = 'Week';
        break;

      case 'monthly':
        const monthlyData: { [key: string]: number } = {};
        filteredData.forEach((dayData) => {
          const date = new Date(dayData.date);
          const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          if (!monthlyData[monthKey]) monthlyData[monthKey] = 0;
          const totalVolume = dayData.halfHourData.reduce((sum, vol) => sum + (vol || 0), 0);
          monthlyData[monthKey] += totalVolume;
        });
        chartData = Object.entries(monthlyData).map(([monthKey, volume]) => {
          const [year, month] = monthKey.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          return { label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }), value: volume || 0, date: monthKey };
        }).filter((d) => d.value !== null && d.value !== undefined);
        xAxisLabel = 'Month';
        break;

      default:
        chartData = [];
        xAxisLabel = '';
    }

    // Sort chart data by date
    chartData.sort((a, b) => (a.date && b.date ? new Date(a.date).getTime() - new Date(b.date).getTime() : 0));

    // Calculate overall average
    if (chartData.length > 0) {
      const totalVolume = chartData.reduce((sum, item) => sum + item.value, 0);
      overallAverage = totalVolume / chartData.length;
    }

    // Add overall average to each data point for the average line
    const chartDataWithAverage = chartData.map(item => ({
      ...item,
      average: overallAverage
    }));

    const minVolume = chartData.length > 0 ? Math.min(...chartData.map((d) => d.value)) : 0;
    const maxVolume = chartData.length > 0 ? Math.max(...chartData.map((d) => d.value)) : 0;

    // Calculate dynamic width based on data points and aggregation type
    const getChartWidth = () => {
      const baseWidth = 800;
      const minWidth = 1200;
      const maxWidth = 3000;
      
      let pointWidth = 50;
      if (aggregationType === 'halfhour') pointWidth = 30;
      else if (aggregationType === 'hourly') pointWidth = 40;
      else if (aggregationType === 'daily') pointWidth = 60;
      else if (aggregationType === 'weekly') pointWidth = 100;
      else if (aggregationType === 'monthly') pointWidth = 150;
      
      const calculatedWidth = Math.max(minWidth, chartData.length * pointWidth);
      return Math.min(maxWidth, calculatedWidth);
    };
    const renderChart = () => {
      if (!chartData.length) {
        return <div className="flex items-center justify-center h-96 text-gray-400">No data available for the selected filters</div>;
      }

      const chartWidth = getChartWidth();
      const showXAxisLabels = chartData.length <= 50; // Only show labels if not too many points
      const labelInterval = Math.max(0, Math.floor(chartData.length / 15)); // Show max 15 labels

      return (
        <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
          <ResponsiveContainer width={chartWidth} height={450}>
            {chartType === 'line' ? (
              <LineChart data={chartDataWithAverage} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  interval={labelInterval}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  tick={showXAxisLabels ? { fontSize: 11, fill: '#94a3b8' } : false}
                />
                <YAxis
                  stroke="#94a3b8"
                  yAxisId="left"
                  orientation="left"
                  fontSize={12}
                  label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', textAnchor: 'middle', fill: '#94a3b8' }}
                />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} labelStyle={{ color: '#cbd5e1' }} />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ r: chartData.length > 100 ? 0 : 3 }} 
                  name="Volume"
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={false}
                  name={`Overall Average (${Math.round(overallAverage).toLocaleString()})`}
                />
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={chartDataWithAverage} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  interval={labelInterval}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  tick={showXAxisLabels ? { fontSize: 11, fill: '#94a3b8' } : false}
                />
                <YAxis
                  stroke="#94a3b8"
                  yAxisId="left"
                  orientation="left"
                  fontSize={12}
                  label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', textAnchor: 'middle', fill: '#94a3b8' }}
                />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} labelStyle={{ color: '#cbd5e1' }} />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Area 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#areaGradient)"
                  name="Volume"
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={false}
                  name={`Overall Average (${Math.round(overallAverage).toLocaleString()})`}
                />
              </AreaChart>
            ) : (
              <BarChart data={chartDataWithAverage} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  interval={labelInterval}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  tick={showXAxisLabels ? { fontSize: 11, fill: '#94a3b8' } : false}
                />
                <YAxis
                  stroke="#94a3b8"
                  yAxisId="left"
                  orientation="left"
                  fontSize={12}
                  label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', textAnchor: 'middle', fill: '#94a3b8' }}
                />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} labelStyle={{ color: '#cbd5e1' }} />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Bar yAxisId="left" dataKey="value" fill="#3b82f6" name="Volume" />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={false}
                  name={`Overall Average (${Math.round(overallAverage).toLocaleString()})`}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      );
    };

    return (
      <div className="bg-slate-700 rounded-lg p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {aggregationType === 'halfhour'
                  ? 'Intraday Volume Distribution'
                  : aggregationType === 'hourly'
                  ? 'Hourly Volume Distribution'
                  : aggregationType === 'daily'
                  ? 'Daily Volume Distribution'
                  : aggregationType === 'weekly'
                  ? 'Weekly Volume Distribution'
                  : 'Monthly Volume Distribution'}
              </h3>
              <p className="text-sm text-gray-400">
                LOB: {filters.lineOfBusiness} | {weekInfo.startWeek} - {weekInfo.endWeek}
                {filters.selectedDOW && ` | Filtered: ${filters.selectedDOW}`}
                {overallAverage > 0 && ` | Avg: ${Math.round(overallAverage).toLocaleString()}`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
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
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-300">Aggregation:</label>
                <select
                  value={aggregationType}
                  onChange={(e) =>
                    setAggregationType(e.target.value as 'halfhour' | 'hourly' | 'daily' | 'weekly' | 'monthly')
                  }
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="halfhour">Intraday</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">{renderChart()}</div>
        {chartData.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <p>
              {xAxisLabel} | Total {yAxisLabel}: {chartData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
            </p>
            <p>
              Data Points: {chartData.length} | Range: {minVolume.toLocaleString()} - {maxVolume.toLocaleString()} | Avg: {Math.round(overallAverage).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-800 text-white">
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-white">Tactical Capacity Insights</h1>
              <p className="text-sm text-gray-400">DOW & Intraday Analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setAnalysisType('dow')}
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
              <button
                onClick={exportToCSV}
                className="flex items-center px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4 flex-wrap">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-300">BU:</label>
              <select
                value={filters.businessUnit}
                onChange={(e) => handleFilterChange('businessUnit', e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {businessUnits.map((bu) => (
                  <option key={bu} value={bu}>
                    {bu}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-300">LOB:</label>
              <select
                value={filters.lineOfBusiness}
                onChange={(e) => handleFilterChange('lineOfBusiness', e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {linesOfBusiness.map((lob) => (
                  <option key={lob} value={lob}>
                    {lob}
                  </option>
                ))}
              </select>
            </div>
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
      <div className="px-6 py-4 bg-slate-850 border-b border-slate-700">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-300 font-medium">{analysisType === 'dow' ? 'Filter DOW:' : 'Filter Days:'}</label>
            <div className="flex space-x-1">
              <button
                onClick={() => handleFilterChange('selectedDOW', '')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  filters.selectedDOW === '' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                All
              </button>
              {availableDOWs.map((day) => (
                <button
                  key={day}
                  onClick={() => handleFilterChange('selectedDOW', day)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    filters.selectedDOW === day ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        {analysisType === 'dow' ? activeView === 'table' ? renderDOWTableView() : renderDOWChartView() : activeView === 'table' ? renderIntradayTableView() : renderIntradayChartView()}
      </div>
      <div className="px-6 py-4 border-t border-slate-700 text-center">
        <p className="text-xs text-gray-500">© 2025 Aptino. All rights reserved.</p>
      </div>
    </div>
  );
};

export default DOWIntradayTab;