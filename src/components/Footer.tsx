import { IonIcon } from '@ionic/react';
import { 
  homeOutline, 
  barChartOutline, 
  add, 
  calendarOutline, 
  alertCircleOutline 
} from 'ionicons/icons';

const Footer: React.FC = () => {
  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 bg-gray-50 rounded-t-3xl shadow-top shadow-gray-200 pb-safe">
      <div className="flex items-center justify-around px-2 py-3">
        {/* Home */}
        <button className="flex flex-col items-center gap-1 flex-1">
          <IonIcon 
            icon={homeOutline} 
            className="text-gray-700 text-2xl"
          />
          <span className="text-xs text-gray-700">Home</span>
        </button>

        {/* Budget */}
        <button className="flex flex-col items-center gap-1 flex-1">
          <IonIcon 
            icon={barChartOutline} 
            className="text-gray-700 text-2xl"
          />
          <span className="text-xs text-gray-700">Budget</span>
        </button>

        {/* Central Add Button */}
        <button className="w-14 h-14 !rounded-full bg-orange-200 flex items-center justify-center shadow-md -mt-12 active:bg-orange-300 transition-colors">
          <IonIcon 
            icon={add} 
            className="text-black text-3xl"
          />
        </button>

        {/* Calendar */}
        <button className="flex flex-col items-center gap-1 flex-1">
          <IonIcon 
            icon={calendarOutline} 
            className="text-gray-700 text-2xl"
          />
          <span className="text-xs text-gray-700">Calendar</span>
        </button>

        {/* Reports */}
        <button className="flex flex-col items-center gap-1 flex-1">
          <IonIcon 
            icon={alertCircleOutline} 
            className="text-gray-700 text-2xl"
          />
          <span className="text-xs text-gray-700">Reports</span>
        </button>
      </div>
    </div>
  );
};

export default Footer;

