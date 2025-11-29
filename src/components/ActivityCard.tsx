import React from 'react';
import { IonIcon } from '@ionic/react';
import { personCircleOutline, arrowUpOutline, cardOutline, receiptOutline, walletOutline } from 'ionicons/icons';

interface ActivityCardProps {
  avatarUrl?: string;
  title: string;
  date?: string;
  amount?: number; // positive or negative
  fee?: string | number; // small text on the right below amount
  customIcon?: string; // emoji or icon identifier
  category?: string; // category for determining icon
}

const ActivityCard: React.FC<ActivityCardProps> = ({ avatarUrl, title, date, amount = 0, fee, customIcon, category }) => {
  const amountFormatted = (amt: number) => {
    const sign = amt >= 0 ? '+' : '-';
    const abs = Math.abs(amt);
    return `${sign}₹${abs.toLocaleString()}`;
  };

  // Get brand logo URL or determine icon
  const getBrandLogo = (name: string) => {
    const nameLower = name.toLowerCase();
    
    // Brand logos mapping using clearbit/logo API
    const brandLogos: { [key: string]: string } = {
      'hdfc': 'https://logo.clearbit.com/hdfcbank.com',
      'icici': 'https://logo.clearbit.com/icicibank.com',
      'sbi': 'https://logo.clearbit.com/onlinesbi.com',
      'axis': 'https://logo.clearbit.com/axisbank.com',
      'netflix': 'https://logo.clearbit.com/netflix.com',
      'prime': 'https://logo.clearbit.com/amazon.com',
      'amazon': 'https://logo.clearbit.com/amazon.com',
      'spotify': 'https://logo.clearbit.com/spotify.com',
      'paytm': 'https://logo.clearbit.com/paytm.com',
      'phonepe': 'https://logo.clearbit.com/phonepe.com',
      'gpay': 'https://logo.clearbit.com/google.com',
      'niyo': 'https://logo.clearbit.com/goniyo.com',
    };

    for (const [brand, logoUrl] of Object.entries(brandLogos)) {
      if (nameLower.includes(brand)) {
        return logoUrl;
      }
    }
    
    return null;
  };

  // Determine icon based on category or title
  const getIcon = () => {
    // Check for brand logo FIRST - highest priority
    const brandLogo = getBrandLogo(title);
    if (brandLogo) {
      return (
        <img 
          src={brandLogo} 
          alt={title} 
          className="w-6 h-6 object-contain p-0.5" 
          style={{ maxWidth: '24px', maxHeight: '24px' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath fill="%239ca3af" d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"%3E%3C/path%3E%3C/svg%3E';
          }}
        />
      );
    }

    // Then check for custom emoji icon
    if (customIcon) {
      // If customIcon is an emoji, display it
      if (/\p{Emoji}/u.test(customIcon)) {
        return <span className="text-xl">{customIcon}</span>;
      }
    }

    // Determine icon based on name/title first, then category
    const titleLower = title.toLowerCase();
    const categoryLower = category?.toLowerCase() || '';

    // Bank-specific icons
    if (titleLower.includes('bank')) {
      if (categoryLower.includes('credit') || titleLower.includes('credit') || titleLower.includes('card') || titleLower.includes('coral')) {
        return <IonIcon icon={cardOutline} className="text-xl text-blue-500" />;
      }
      return <IonIcon icon={arrowUpOutline} className="text-xl text-green-500" />;
    }

    // Investment/Savings specific
    if (titleLower.includes('chit') || titleLower.includes('fund') || titleLower.includes('fd') || 
        titleLower.includes('mutual') || titleLower.includes('investment')) {
      return <IonIcon icon={walletOutline} className="text-xl text-primary" />;
    }

    // Bills specific
    if (titleLower.includes('electricity') || titleLower.includes('internet') || titleLower.includes('water') ||
        titleLower.includes('gas') || titleLower.includes('subscription')) {
      return <IonIcon icon={receiptOutline} className="text-xl text-red-500" />;
    }

    // Personal transfers
    if (titleLower.includes('mom') || titleLower.includes('dad') || titleLower.includes('friend') ||
        titleLower.includes('family')) {
      return <IonIcon icon={personCircleOutline} className="text-xl text-gray-600" />;
    }

    // Category-based fallback
    if (categoryLower.includes('income')) {
      return <IonIcon icon={arrowUpOutline} className="text-xl text-green-500" />;
    } else if (categoryLower.includes('bill') || categoryLower.includes('expense')) {
      return <IonIcon icon={receiptOutline} className="text-xl text-red-500" />;
    } else if (categoryLower.includes('credit') || categoryLower.includes('card')) {
      return <IonIcon icon={cardOutline} className="text-xl text-blue-500" />;
    } else if (categoryLower.includes('saving')) {
      return <IonIcon icon={walletOutline} className="text-xl text-primary" />;
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

export default ActivityCard;
