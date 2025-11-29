import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import Footer from '../components/Footer';
import SummaryStats from '../components/SummaryStats';
import MonthlyOverviewChart from '../components/MonthlyOverviewChart';
import CalendarMonthView from '../components/CalendarMonthView';
import HeaderNavItem from '../components/HeaderNavItem';
import ActivityList from '../components/ActivityList';

const Transactions: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="p-5 pb-24 bg-subtle-light">

          <HeaderNavItem title="2025 September" />
          <SummaryStats />

          {/* Monthly overview chart */}
          <div className="relative">
            <span className="absolute top-2 left-3 pl-1 text-primary font-semibold"> This month</span>
              <MonthlyOverviewChart />

            {/* Monthly overview and calendar */}
            {/* <CalendarMonthView /> */}
            {/* Transactions content placeholder - List of transactions will go here */}
          </div>
            <div className="mb-5">
            <ActivityList
              title='25 November'
              isShowingFilter={false}
              transactions={[
              { id: '1', date: '2024-11-25', description: 'Grocery Store', amount: -85.50, category: 'Food' },
              { id: '2', date: '2024-11-25', description: 'Gas Station', amount: -45.00, category: 'Transportation' },
              { id: '3', date: '2024-11-25', description: 'Outing', amount: 3200.00, category: 'Income' },
              ]}
              isLoading={false}
            />
            </div>
          <div className="mb-5">
            <ActivityList
              title='23 November'
              isShowingFilter={false}
              transactions={[
              { id: '1', date: '2024-11-23', description: 'Netflix', amount: -640.50, category: 'Entertainment' },
              { id: '2', date: '2024-11-23', description: 'Rent', amount: -15000.00, category: 'Transportation' },
              ]}
              isLoading={false}
            />
          </div>
        </div>
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default Transactions;
