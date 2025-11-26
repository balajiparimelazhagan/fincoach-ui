import React from 'react';
import ReactECharts from 'echarts-for-react';

interface DonutDataProps {
  income?: number; // positive
  expenses?: number; // negative
}

const DonutChart: React.FC<{ value: number; color: string; label: string; startAngle?: number; clockwise?: boolean }> = ({ value, color, label, startAngle = 210, clockwise = true }) => {
  const positiveValue = Math.min(100, Math.abs(value));
  const remainder = Math.max(0, 100 - positiveValue);

  const option = {
    series: [
      {
        type: 'pie',
        radius: ['70%', '85%'],
        startAngle: startAngle,
        clockwise: clockwise,
        avoidLabelOverlap: false,
        silent: true,
        hoverOffset: 0,
        label: {
          show: true,
          position: 'center',
          formatter: `${value >= 0 ? '+' : '-'}${positiveValue}`,
          fontSize: 16,
          fontWeight: 700,
          color: value >= 0 ? '#16a34a' : '#ef4444'
        },
        itemStyle: {
          borderWidth: 0,
          borderRadius: 12
        },
        data: [
          { value: positiveValue, itemStyle: { color } },
          { value: remainder, itemStyle: { color: '#e6e6e6' } }
        ]
      }
    ]
  };

  return (
    <div className="flex flex-col items-center">
      <div className='w-32 h-32'>
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
      <div className="text-center py-1">
        <div className="text-sm font-semibold text-gray-700">{label}</div>
      </div>
    </div>
  );
};

const IncomeExpenseDonuts: React.FC<DonutDataProps> = ({ income = 25, expenses = -20 }) => {
  return (
    <div className="bg-white rounded-xl px-5 pt-2 border border-gray-200">
      <div className="flex gap-2 justify-center items-center">
        <DonutChart value={income} color="#34d399" label="Income" startAngle={90} clockwise={true} />
        <DonutChart value={expenses} color="#f43f5e" label="Expenses" startAngle={90} clockwise={true} />
      </div>
    </div>
  );
};

export default IncomeExpenseDonuts;
