import React from 'react';
import ReviewCard from './ReviewCard';
import { giftOutline, personOutline } from 'ionicons/icons';

interface ReviewItem {
  id: string;
  title: string;
  subtitle?: string;
  amount?: number;
  icon?: any;
}

const sampleData: ReviewItem[] = [
  { id: '1', title: 'John@ybl', subtitle: '18th of every month', amount: 120, icon: giftOutline },
  { id: '2', title: 'Balaji@nal', subtitle: 'Quarterly', amount: 233, icon: personOutline },
  { id: '3', title: 'John.s', subtitle: 'Annual', amount: -265, icon: giftOutline },
];

const ReviewList: React.FC = () => {
  return (
    <div>
      <div className="mb-3 px-1">
        <span className="text-sm font-semibold text-gray-800">Add to budget ?</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {sampleData.map(item => (
          <ReviewCard key={item.id} title={item.title} subtitle={item.subtitle} amount={item.amount} icon={item.icon} />
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
