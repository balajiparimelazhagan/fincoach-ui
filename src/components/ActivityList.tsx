import React from 'react';
import ActivityCard from './ActivityCard';
import { giftOutline, personOutline } from 'ionicons/icons';

interface ActivityItem {
  id: string;
  title: string;
  date?: string;
  amount?: number;
  fee?: string | number;
  avatar?: string;
}

const sampleData: ActivityItem[] = [
  { id: '1', title: 'Mariana s. @gmail.com', date: '17 Nov', amount: 220.98, fee: 5.43, avatar: '/default-profile-pic.png' },
  { id: '2', title: 'Mariana s. @gmail.com', date: '17 Nov', amount: 200, fee: 3.23, avatar: '/default-profile-pic.png' },
  { id: '3', title: 'Mariana s. @gmail.com', date: '17 Nov', amount: -865, fee: 5.43, avatar: '/default-profile-pic.png' },
];

interface ActivityListProps {
  title: string;
}

const ActivityList: React.FC <ActivityListProps>= ({title}) => {
  return (
    <div className="mt-5">
      <div className="mb-3 px-1">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>

      <div className="flex flex-col border border-gray-100 rounded-xl overflow-hidden">
        {sampleData.map(item => (
          <ActivityCard key={item.id} title={item.title} date={item.date} amount={item.amount} fee={item.fee} avatarUrl={item.avatar} />
        ))}
      </div>
    </div>
  );
};

export default ActivityList;
