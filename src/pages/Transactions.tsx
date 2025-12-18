import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import Footer from '../components/Footer';
import SummaryStats from '../components/SummaryStats';
import MonthlyOverviewChart from '../components/MonthlyOverviewChart';
import CalendarMonthView from '../components/CalendarMonthView';
import HeaderNavItem from '../components/HeaderNavItem';
import ActivityList from '../components/ActivityList';
import CardCarousel, { Card } from '../components/CardCarousel';

const Transactions: React.FC = () => {
  const cards: Card[] = [
    {
      id: '1',
      type: 'debit',
      balance: 4529.53,
      title: 'IndusInd Zinger Multi Wallet Card',
      bankName: 'IndusInd Bank',
      lastFourDigits: '8926',
      referenceNumber: '000046207703',
      cardBrand: 'visa',
      income: 37400,
      expense: 16200,
      savings: 21200,
    },
    {
      id: '2',
      type: 'debit',
      balance: 12500.00,
      title: 'HDFC Salary Account',
      bankName: 'HDFC Bank',
      lastFourDigits: '4532',
      referenceNumber: '000012345678',
      cardBrand: 'visa',
      income: 50000,
      expense: 28500,
      savings: 21500,
    },
    {
      id: '3',
      type: 'credit',
      balance: 25000.00,
      title: 'ICICI Credit Card',
      bankName: 'ICICI Bank',
      lastFourDigits: '7890',
      referenceNumber: '000098765432',
      cardBrand: 'visa',
      income: 0,
      expense: 15600,
      savings: 9400,
    },
  ];

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="p-5 pb-24 space-y-4 bg-subtle-light">

          <HeaderNavItem title="2025 September" />
          
          {/* Card Carousel */}
          <CardCarousel cards={cards} />
          
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
