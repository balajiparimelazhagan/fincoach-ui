import { IonIcon, IonFooter } from '@ionic/react';
import {
  pieChartOutline,
  calendarNumberOutline,
  cashOutline,
  repeatOutline,
} from 'ionicons/icons';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard', icon: null, isLogo: true, label: 'Home' },
  { to: '/transactions', icon: cashOutline, isLogo: false, label: 'Spends', rotate: true },
  { to: '/cashflow', icon: calendarNumberOutline, isLogo: false, label: 'Cashflow', rotate: false },
  { to: '/patterns', icon: repeatOutline, isLogo: false, label: 'Patterns', rotate: false },
  { to: '/insights', icon: pieChartOutline, isLogo: false, label: 'Insights', rotate: false },
];

const Footer: React.FC = () => {
  const location = useLocation();

  return (
    <IonFooter className="footer-container flex w-full justify-center bg-gray-50 rounded-t-3xl shadow-top shadow-gray-200 pb-safe">
      <div className="flex w-full items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 flex-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-50'}`}
            >
              {item.isLogo ? (
                <img src="/favicon.png" alt="Home" className="w-6 h-6 object-contain" />
              ) : (
                <IonIcon
                  icon={item.icon!}
                  className={`text-2xl ${item.rotate ? 'rotate-180' : ''} ${isActive ? 'text-primary' : 'text-gray-600'}`}
                />
              )}
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </IonFooter>
  );
};

export default Footer;
