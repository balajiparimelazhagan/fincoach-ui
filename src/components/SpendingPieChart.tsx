import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { CategoryBudget } from '../services/statsService';

const COLORS = [
  '#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
];

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

interface SpendingPieChartProps {
  categories: CategoryBudget[];
}

const SpendingPieChart: React.FC<SpendingPieChartProps> = ({ categories }) => {
  const data = useMemo(() =>
    categories
      .filter(c => c.current_actual > 0)
      .sort((a, b) => b.current_actual - a.current_actual)
      .map((c, i) => ({
        name: c.category_name,
        value: Math.round(c.current_actual),
        itemStyle: { color: COLORS[i % COLORS.length] },
      })),
    [categories]
  );

  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  const option = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      formatter: (params: any) =>
        `<strong>${params.name}</strong><br/>${fmt(params.value)}<br/>${params.percent}%`,
    },
    legend: {
      orient: 'vertical',
      right: 8,
      top: 'middle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { fontSize: 11, color: '#6B7280' },
      formatter: (name: string) => {
        const item = data.find(d => d.name === name);
        const pct = item ? ((item.value / total) * 100).toFixed(0) : '0';
        return `${name}  ${pct}%`;
      },
    },
    series: [
      {
        name: 'Spending',
        type: 'pie',
        radius: ['38%', '68%'],
        center: ['32%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data,
      },
    ],
  }), [data, total]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 mx-4 mt-3">
        <p className="text-sm text-gray-400 text-center">No spending data for this month yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 mx-4 mt-3 p-4">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-semibold text-gray-700">Spending Breakdown</span>
        <span className="text-xs text-gray-400">{fmt(total)} total</span>
      </div>
      <ReactECharts
        option={option}
        style={{ height: '200px', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};

export default SpendingPieChart;
