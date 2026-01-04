import { IonIcon, IonFooter } from '@ionic/react';
import { 
  pieChartOutline, 
  calendarNumberOutline, 
  cashOutline,
} from 'ionicons/icons';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <IonFooter className="footer-container flex w-full justify-center bg-gray-50 rounded-t-3xl shadow-top shadow-gray-200 pb-safe">
      <div className="flex w-full items-center justify-around px-2 py-3">
        {/* Home */}
        <Link to="/dashboard" className="flex flex-col items-center gap-1 flex-1">
          <img 
            src="/favicon.png" 
            alt="Home" 
            className="w-6 h-6 object-contain"
          />
        </Link>

        {/* Transactions */}
        <Link to="/transactions" className="flex flex-col items-center gap-1 flex-1 rotate-180">
          <IonIcon 
            icon={cashOutline} 
            className="text-gray-700 text-2xl"
          />
        </Link>


        {/* Budget */}
        <Link to="/budget" className="flex flex-col items-center gap-1 flex-1">
          <IonIcon 
            icon={calendarNumberOutline} 
            className="text-gray-700 text-2xl"
          />
        </Link>

        {/* Insights */}
        <Link to="/insights" className="flex flex-col items-center gap-1 flex-1">
          <IonIcon 
            icon={pieChartOutline} 
            className="text-gray-700 text-2xl"
          />
        </Link>
      </div>
    </IonFooter>
  );
};

export default Footer;

