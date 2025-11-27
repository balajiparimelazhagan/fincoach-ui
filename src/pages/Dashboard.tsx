import { IonContent, IonPage, IonSpinner, IonText } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { authService, UserProfile } from '../services/authService';
import { transactionService, Transaction } from '../services/transactionService';
import ProfileHeader from '../components/ProfileHeader';
import Footer from '../components/Footer';
import IncomeExpenseDonuts from '../components/IncomeExpenseDonuts';
import ReviewList from '../components/ReviewsList';
import ActivityList from '../components/ActivityList';

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [incomeExpenseData, setIncomeExpenseData] = useState<{ income: number; expense: number } | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [upcomingTransactions, setUpcomingTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const handleTokenAndAuth = async () => {
      try {
        // Extract token from query params
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');

        if (token) {
          // Save the token
          await authService.setAccessToken(token);
          
          // Remove token from URL for security
          history.replace('/dashboard');
        }

        // Check if user is authenticated
        const isAuthenticated = await authService.isAuthenticated();
        
        if (!isAuthenticated) {
          // Redirect to login if not authenticated
          history.replace('/login');
          return;
        }

        // Fetch user profile
        try {
          const profile = await authService.getUserProfile();
          setUserProfile(profile);

          try {
            const data = await transactionService.getCurrentMonthTotals(profile.id);
            setIncomeExpenseData(data);
          } catch (err: any) {
            console.error('Failed to fetch transaction data:', err);
          }

          // Fetch recent and upcoming transactions
          try {
            const [recent, upcoming] = await Promise.all([
              transactionService.getRecentTransactions(profile.id, 10),
              transactionService.getUpcomingTransactions(profile.id, 10),
            ]);
            setRecentTransactions(recent);
            setUpcomingTransactions(upcoming);
          } catch (err: any) {
            console.error('Failed to fetch transactions list:', err);
          } finally {
            setTransactionsLoading(false);
          }
        } catch (err: any) {
          console.error('Failed to fetch user profile:', err);
          // If profile fetch fails, user might still be authenticated
          // Just show a generic welcome message
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error('Dashboard initialization error:', err);
        setError(err?.message || 'Failed to initialize dashboard');
        setIsLoading(false);
      }
    };

    handleTokenAndAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  if (isLoading) {
    return (
      <IonPage>
        <IonContent fullscreen className="flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <IonSpinner name="crescent" />
            <IonText color="medium">Loading dashboard...</IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonContent fullscreen className="flex items-center justify-center p-5">
          <div className="text-center">
            <IonText color="danger">
              <h2>Error</h2>
              <p>{error}</p>
            </IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <ProfileHeader userProfile={userProfile} />

      <IonContent fullscreen className="bg-gray-50">
        <div className="p-5 pb-24">
          {/* Profile charts */}
          <div className="mb-4">
            <IncomeExpenseDonuts 
              income={incomeExpenseData?.income} 
              expense={incomeExpenseData?.expense} 
            />
          </div>

          <div className="mb-5">
            <ReviewList />
          </div>

          <div className="mb-5">
            <ActivityList 
              title='Recent transactions' 
              transactions={recentTransactions}
              isLoading={transactionsLoading}
            />
          </div>
          
          <div className="mb-5">
            <ActivityList 
              title='Upcoming transactions' 
              transactions={upcomingTransactions}
              isLoading={transactionsLoading}
            />
          </div>

          {/* Rest of the dashboard content will go here */}
        </div>
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default Dashboard;

