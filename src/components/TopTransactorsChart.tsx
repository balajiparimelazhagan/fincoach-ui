import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Transaction } from '../services/transactionService';

interface TopTransactorsChartProps {
  transactions: Transaction[];
}

interface TransactorData {
  name: string;
  amount: number;
  count: number;
}

/**
 * Horizontal bar chart showing top 5 transactors by expense amount
 */
const TopTransactorsChart: React.FC<TopTransactorsChartProps> = ({ transactions }) => {
  const topTransactors = useMemo(() => {
    // Filter only expense transactions
    const expenses = transactions.filter(t => t.type === 'expense');
    
    // Group by transactor and calculate totals
    const transactorMap = new Map<string, TransactorData>();
    
    expenses.forEach(transaction => {
      const name = transaction.transactor?.label || transaction.transactor?.name || 'Unknown';
      const amount = Math.abs(transaction.amount);
      
      if (transactorMap.has(name)) {
        const existing = transactorMap.get(name)!;
        existing.amount += amount;
        existing.count += 1;
      } else {
        transactorMap.set(name, { name, amount, count: 1 });
      }
    });

    return Array.from(transactorMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .reverse();
  }, [transactions]);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const data = params[0];
        const transactor = topTransactors[data.dataIndex];
        return `
          <strong>${transactor.name}</strong><br/>
          Amount: ₹${transactor.amount.toLocaleString('en-IN')}<br/>
          Transactions: ${transactor.count}
        `;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `₹${(value / 1000).toFixed(0)}k`,
      },
    },
    yAxis: {
      type: 'category',
      data: topTransactors.map(t => t.name),
      axisLabel: {
        show: false,
      },
    },
    series: [
      {
        name: 'Amount',
        type: 'bar',
        data: topTransactors.map(t => t.amount),
        itemStyle: {
          color: '#E6E7EB',
          borderRadius: [0, 6, 6, 0],
        },
        label: {
          show: true,
          position: 'insideLeft',
          formatter: (params: any) => {
            const transactor = topTransactors[params.dataIndex];
            return `${transactor.name} - ${transactor.count} txn`;
          },
          color: '#2465A0',
          fontSize: 12,
          fontWeight: 600,
        },
        barMaxWidth: 25,
      },
    ],
  };

  if (topTransactors.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <p className="text-sm text-gray-400 text-center">No expense transactions found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <ReactECharts
        option={option}
        style={{ height: '250px', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};

export default TopTransactorsChart;
