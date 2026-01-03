import React from 'react';
import { IonIcon } from '@ionic/react';
import { personCircleOutline, arrowUpOutline, cardOutline, receiptOutline, walletOutline } from 'ionicons/icons';
import { getCategoryIcon } from '../utils/categoryIconMap';

interface TransactionCardProps {
  avatarUrl?: string;
  title: string;
  date?: string;
  amount?: number; // positive or negative
  fee?: string | number; // small text on the right below amount
  customIcon?: string; // emoji or icon identifier
  category?: string; // category for determining icon
}

const TransactionCard: React.FC<TransactionCardProps> = ({ avatarUrl, title, date, amount = 0, fee, customIcon, category }) => {
  const amountFormatted = (amt: number) => {
    const sign = amt >= 0 ? '+' : '-';
    const abs = Math.abs(amt);
    return `${sign}₹${abs.toLocaleString()}`;
  };

  // Determine icon based on category or title
  const getIcon = () => {
    // Check for custom emoji icon
    if (customIcon) {
      // If customIcon is an emoji, display it
      if (/\p{Emoji}/u.test(customIcon)) {
        return <span className="text-xl">{customIcon}</span>;
      }
    }

    // Category-based icon mapping (highest priority)
    if (category) {
      const iconSrc = getCategoryIcon(category);
      if (iconSrc) {
        return <IonIcon icon={iconSrc} className="text-xl text-gray-700" />;
      }
    }

    // Fallback to title-based detection
    const titleLower = title.toLowerCase();

    // Bank-specific icons
    if (titleLower.includes('bank')) {
      if (titleLower.includes('credit') || titleLower.includes('card') || titleLower.includes('coral')) {
        return <IonIcon icon={cardOutline} className="text-xl text-blue-500" />;
      }
      return <IonIcon icon={arrowUpOutline} className="text-xl text-green-500" />;
    }

    // Investment/Savings specific
    if (titleLower.includes('chit') || titleLower.includes('fund') || titleLower.includes('fd') || 
        titleLower.includes('mutual') || titleLower.includes('investment')) {
      return <IonIcon icon={walletOutline} className="text-xl text-primary" />;
    }

    // Personal transfers
    if (titleLower.includes('mom') || titleLower.includes('dad') || titleLower.includes('friend') ||
        titleLower.includes('family')) {
      return <IonIcon icon={personCircleOutline} className="text-xl text-gray-600" />;
    }

    // Default fallback icon
    return <IonIcon icon={walletOutline} className="text-xl text-gray-400" />;
  };

  return (
    <>
    <div className="flex items-center gap-4 p-3 my-0.5 py-2 rounded-xl bg-white">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center">
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/default-profile-pic.png'; }} />
        ) : (
          getIcon()
        )}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="font-medium text-sm text-gray-800 truncate">{title.length > 15 ? title.slice(0, 15) + '...' : title}</div>
        {date && (
          <div>
            {category ? (
              <button 
                className="text-xs text-primary underline underline-offset-[5px] text-left w-fit hover:text-primary-dark active:opacity-70 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {date}
              </button>
            ) : (
              <div className="text-xs text-gray-400">{date} - {fee !== undefined && fee} Hrs</div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col items-end">
        <div className={`text font-semibold ${amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>{amountFormatted(amount)}</div>
      </div>
    </div>
    <div className="border-b border-gray-200 w-[90%] mx-auto"></div>
    </>
  );
};

export default TransactionCard;
