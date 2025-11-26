import React from 'react';
import ReactECharts from 'echarts-for-react';

interface SeriesPoint {
  name: string;
  type: string;
  stack?: string;
  data: number[];
  color?: string;
}

const MonthlyOverviewChart: React.FC = () => {
  // Use day only (14, 15) as requested
  const categories = ['14', '15', '16', '17', '18', '19', '20'];

  // Sample values for income, expenses, and saving for each day
  const incomeSeries: SeriesPoint = {
    name: 'Income',
    type: 'bar',
    stack: 'total',
    data: [10, 60, 30, 40, 20, 70, 90, 10, 60, 30, 40, 20, 70, 90, 10, 60, 30, 40, 20, 70, 90],
    color: '#34D399',
  };

  const expenseSeries: SeriesPoint = {
    name: 'Expenses',
    type: 'bar',
    stack: 'total',
    data: [30, 10, 80, 20, 60, 50, 30, 30, 10, 80, 20, 60, 50, 30, 30, 10, 80, 20, 60, 50, 30],
    color: '#F43F5E',
  };

  const savingSeries: SeriesPoint = {
    name: 'Saving',
    type: 'bar',
    stack: 'total',
    data: [20, 30, 10, 60, 50, 10, 40, 20, 30, 10, 60, 50, 10, 40, 20, 30, 10, 60, 50, 10, 40],
    color: '#FBBF24',
  };

  const series = [incomeSeries, expenseSeries, savingSeries];

  // compute a minimum width for the chart so it can scroll horizontally if necessary
  const chartColumnWidth = 20; // width per category (smaller gaps when this is tight combined with barWidth)
  // keep an appropriate minimum width (no larger than necessary to reduce visual gaps when only few categories)
  const chartWidth = Math.max(categories.length * chartColumnWidth, 320);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '2%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: categories,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: '#9AA0A6' },
      },
    ],
    yAxis: [
      {
        type: 'value',
        splitLine: { show: false, lineStyle: { color: '#f3f3f3' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#9AA0A6' },
      },
    ],
    series: series.map((s, idx) => ({
      name: s.name,
      type: s.type,
      stack: s.stack,
      data: s.data,
      // only the topmost series will have the rounded top corners
      itemStyle: {
        color: s.color,
        borderRadius: idx === series.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0],
      },
      barWidth: 12,
      // minimize gaps between categories and series
      barGap: '0%',
      barCategoryGap: '15%',
    })),
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mt-4">
      <div className="overflow-x-auto">
        <div style={{ minWidth: chartWidth }}>
          <ReactECharts option={option} style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  );
};

export default MonthlyOverviewChart;
