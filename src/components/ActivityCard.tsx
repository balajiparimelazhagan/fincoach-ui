import React from 'react';
import { IonIcon } from '@ionic/react';
import { personCircleOutline } from 'ionicons/icons';

interface ActivityCardProps {
  avatarUrl?: string;
  title: string;
  date?: string;
  amount?: number; // positive or negative
  fee?: string | number; // small text on the right below amount
}

const ActivityCard: React.FC<ActivityCardProps> = ({ avatarUrl, title, date, amount = 0, fee }) => {
  const amountFormatted = (amt: number) => {
    const sign = amt >= 0 ? '+' : '-';
    const abs = Math.abs(amt);
    return `${sign}${abs.toLocaleString()}`;
  };

  return (
    <div className="flex items-center gap-4 p-3 py-2 rounded-xl bg-white border-b border-gray-100">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/default-profile-pic.png'; }} />
        ) : (
          <IonIcon icon={personCircleOutline} className="text-2xl text-gray-400" />
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="font-medium text-xs text-gray-800 truncate">{title}</div>
        {date && <div className="text-xs text-gray-400">{date}</div>}
      </div>

      <div className="flex flex-col items-end">
        <div className={`text-xs ${amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>{amountFormatted(amount)}</div>
        {fee !== undefined && <div className="text-xs text-gray-400">{fee}</div>}
      </div>
    </div>
  );
};

export default ActivityCard;
