import { IonIcon } from '@ionic/react';
import { 
  homeOutline, 
  barChartOutline, 
  add, 
  calendarOutline, 
  alertCircleOutline 
} from 'ionicons/icons';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <div className="fixed bottom-0 pb-1 left-0 right-0 z-50 bg-gray-50 rounded-t-3xl shadow-top shadow-gray-200 pb-safe">
      <div className="flex items-center justify-around px-2 py-3">
        {/* Home */}
        <Link to="/dashboard" className="flex flex-col items-center gap-1 flex-1">
          <img 
            src="/favicon.png" 
            alt="Home" 
            className="w-6 h-6 object-contain"
          />
        </Link>

        {/* Budget */}
        <Link to="/transactions" className="flex flex-col items-center gap-1 flex-1">
          <IonIcon 
            icon={barChartOutline} 
            className="text-gray-700 text-2xl"
          />
        </Link>


        {/* Calendar */}
        <button className="flex flex-col items-center gap-1 flex-1">
          <IonIcon 
            icon={calendarOutline} 
            className="text-gray-700 text-2xl"
          />
        </button>

        {/* Reports */}
        <button className="flex flex-col items-center gap-1 flex-1">
          <IonIcon 
            icon={alertCircleOutline} 
            className="text-gray-700 text-2xl"
          />
        </button>
      </div>
    </div>
  );
};

export default Footer;

