import { IonIcon } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import React from 'react';

interface HeaderNavItemProps {
  title: string;
  onPrev?: () => void;
  onNext?: () => void;
}

const HeaderNavItem: React.FC<HeaderNavItemProps> = ({ title, onPrev, onNext }) => {
  return (
    <div className="flex items-center justify-center gap-12">
        <button onClick={onPrev} className="text-gray-400 p-1 hover:text-gray-600">
            <IonIcon icon={chevronBackOutline} className="text-xl" />
        </button>
        <div className="text-lg text-primary cursor-pointer md:text-2xl font-semibold">{title}</div>
        <button onClick={onNext} className="text-gray-400 p-1 hover:text-gray-600">
            <IonIcon icon={chevronForwardOutline} className="text-xl" />
        </button>
    </div>
  );
};

export default HeaderNavItem;
