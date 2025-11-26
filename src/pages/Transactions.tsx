import React from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import Footer from '../components/Footer';
import SummaryStats from '../components/SummaryStats';
import MonthlyOverviewChart from '../components/MonthlyOverviewChart';
import CalendarMonthView from '../components/CalendarMonthView';
import HeaderNavItem from '../components/HeaderNavItem';

const Transactions: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen className="bg-gray-50">
        <div className="p-5 pb-24">
          
          <HeaderNavItem title="2025 September" />
          <SummaryStats />

          {/* Monthly overview chart */}
          <MonthlyOverviewChart />

          {/* Monthly overview and calendar */}
          <CalendarMonthView />
          {/* Transactions content placeholder - List of transactions will go here */}
        </div>
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default Transactions;
