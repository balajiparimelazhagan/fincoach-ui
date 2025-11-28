import React from 'react';
import ReactECharts from 'echarts-for-react';

interface DonutDataProps {
  income?: number; // Income amount
  expense?: number; // Expense amount
}

const DonutChart: React.FC<{ 
  amount: number; 
  percentage: number; 
  color: string; 
  label: string; 
  startAngle?: number; 
  clockwise?: boolean;
  isIncome?: boolean;
}> = ({ amount, percentage, color, label, startAngle = 90, clockwise = true, isIncome = true }) => {
  const displayPercentage = Math.min(100, Math.max(0, Math.round(percentage)));
  const remainder = Math.max(0, 100 - displayPercentage);

  // Format amount with currency symbol (you can make this dynamic based on user's currency)
  const formattedAmount = (() => {
    if (amount >= 10_000 && amount < 99_999) {
      return `${(amount / 1_000).toFixed(2)}K`;
    }
    if (amount >= 1_00_000 && amount < 1_00_00_000) {
      return `${(amount / 1_00_000).toFixed(2)}L`;
    }
    if (amount >= 1_00_00_000) {
      return `${(amount / 1_00_00_000).toFixed(2)}Cr`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  })();

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
          formatter: `${isIncome ? '+' : '-'}${formattedAmount}`,
          fontSize: 16,
          fontWeight: 700,
          color: isIncome ? '#16a34a' : '#ef4444'
        },
        itemStyle: {
          borderWidth: 0,
          borderRadius: 12
        },
        data: [
          { value: displayPercentage, itemStyle: { color } },
          { value: remainder, itemStyle: { color: '#e6e6e6' } }
        ]
      }
    ]
  };

  return (
    <div className="flex flex-col items-center py-2">
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      <div className='w-32 h-32'>
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
      <div className="text-center py-1">
        <div className="text-xs text-primary"> <span className='font-bold'>₹{formattedAmount}</span> yet to {isIncome ? 'earn' : 'expend'}</div>
      </div>
    </div>
  );
};

const IncomeExpenseDonuts: React.FC<DonutDataProps> = ({ income = 0, expense = 0 }) => {
  const total = income + expense;
  const incomePercentage = total > 0 ? (income / total) * 100 : 0;
  const expensePercentage = total > 0 ? (expense / total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl px-5 pt-2 border border-gray-200">
      <div className="flex gap-2 justify-center items-center">
        <DonutChart 
          amount={income} 
          percentage={incomePercentage} 
          color="#34d399" 
          label="Income" 
          startAngle={90} 
          clockwise={true}
          isIncome={true}
        />
        <DonutChart 
          amount={expense} 
          percentage={expensePercentage} 
          color="#f43f5e" 
          label="Expenses" 
          startAngle={90} 
          clockwise={true}
          isIncome={false}
        />
      </div>
    </div>
  );
};

export default IncomeExpenseDonuts;
