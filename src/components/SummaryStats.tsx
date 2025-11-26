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
        <div className="text-sm " style={{ color }}>{value}</div>
      </div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
};

const SummaryStats: React.FC = () => {
  const stats = [
    { label: 'Income', value: '37,400', color: '#34D399', icon: '↓' },
    { label: 'Expenses', value: '16,200', color: '#F43F5E', icon: '↑' },
    { label: 'Savings', value: '56,300', color: '#FBBF24', icon: '⤓' },
  ];
  return (
    <div className="border border-gray-100 rounded-xl py-2 px-4 mt-4">
      <div className="flex items-center justify-between">
        {stats.map((s) => (
          <StatItem key={s.label} label={s.label} value={s.value} color={s.color} icon={s.icon} />
        ))}
      </div>
    </div>
  );
};

export default SummaryStats;
