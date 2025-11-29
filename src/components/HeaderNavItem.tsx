import { IonIcon } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import React from 'react';

interface HeaderNavItemProps {
  title: string;
}

const HeaderNavItem: React.FC<HeaderNavItemProps> = ({ title }) => {
  return (
    <div className="bg-subtle-light flex items-center justify-center gap-12">
        <button className="text-gray-400 p-1">
            <IonIcon icon={chevronBackOutline} className="text-xl" />
        </button>
        <div className="text-lg text-primary underline underline-offset-5 cursor-pointer md:text-2xl font-semibold">{title}</div>
        <button className="text-gray-400 p-1">
            <IonIcon icon={chevronForwardOutline} className="text-xl" />
        </button>
    </div>
  );
};

export default HeaderNavItem;
