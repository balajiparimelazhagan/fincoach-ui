import React from 'react';
import InfoCardList from './InfoCardList';
import { InfoCardItem } from './InfoCard';

export interface IBill {
  id: string;
  name: string;
  amount: number;
}

interface BillsProps {
  bills: IBill[];
  onBillClick?: (bill: IBill) => void;
}

const Bills: React.FC<BillsProps> = ({ bills, onBillClick }) => {
  // Convert IBill to InfoCardItem format
  const items: InfoCardItem[] = bills.map(bill => ({
    id: bill.id,
    name: bill.name,
    amount: bill.amount,
  }));

  return <InfoCardList items={items} iconColor="text-gray-700" onItemClick={onBillClick} />;
};

export default Bills;
