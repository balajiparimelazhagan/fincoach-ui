import { IonIcon } from '@ionic/react';
import { addOutline, checkmarkDoneOutline } from 'ionicons/icons';
import React from 'react';

interface ReviewCardProps {
  title: string;
  subtitle?: string;
  amount?: number;
  icon?: any; // Ionicons icon
}

const ReviewCard: React.FC<ReviewCardProps> = ({ title, subtitle, amount = 0, icon }) => {
  const amountFormatted = (amt: number) => {
    const sign = amt >= 0 ? '+' : '-';
    const abs = Math.abs(amt);
    return `${sign}${abs}`;
  };

  return (
    <div className="w-full min-w-56 bg-white rounded-t-xl p-2 border border-gray-200 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
            {icon ? <IonIcon icon={icon} className="text-xl text-gray-700" /> : <IonIcon icon={addOutline} className="text-gray-700" />}
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="font-semibold text-xs text-gray-800 truncate">{title}</div>
            {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
          </div>
        </div>

        <div className={`text-sm font-semibold ${amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>{amountFormatted(amount)}</div>
      </div>
    </div>
  );
};

export default ReviewCard;
