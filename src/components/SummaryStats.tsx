import React from 'react';

interface StatItemProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode | string;
  color?: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, icon, color = '#34D399' }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        {/* <div className='font-bold' style={{ color }}>{icon}</div> */}
        <div className="text-lg font-semibold" style={{ color }}>{value}</div>
      </div>
      <div className="text-xs font-semibold text-gray-400 mt-1">{label}</div>
    </div>
  );
};

interface SummaryStatsProps {
  income?: number;
  expense?: number;
  savings?: number;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ 
  income = 0, 
  expense = 0, 
  savings = 0 
}) => {
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-IN');
  };

  const stats = [
    { label: 'Income', value: formatNumber(income), color: '#34D399', icon: '↓' },
    { label: 'Expenses', value: formatNumber(expense), color: '#C92449', icon: '↑' },
    { label: 'Savings', value: formatNumber(savings), color: '#8a4a64', icon: '⤓' },
  ];
  return (
    <div className="border bg-white border-gray-200 rounded-xl py-3 px-5 mt-4">
      <div className="flex items-center justify-between">
        {stats.map((s) => (
          <StatItem key={s.label} label={s.label} value={s.value} color={s.color} icon={s.icon} />
        ))}
      </div>
    </div>
  );
};

export default SummaryStats;
