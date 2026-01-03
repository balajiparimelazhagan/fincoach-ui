import { IonContent, IonPage, IonSpinner, IonText } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { userService } from '../services/userService';
import { transactionService, Transaction } from '../services/transactionService';
import ProfileHeader from '../components/ProfileHeader';
import Footer from '../components/Footer';
import IncomeExpenseDonuts from '../components/IncomeExpenseDonuts';
import ReviewList from '../components/ReviewsList';
import TransactionList from '../components/TransactionList';
import TopPicksScroll from '../components/TopPicksScroll';
import Bills from '../components/Bills';
import { useUser } from '../context/UserContext';

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incomeExpenseData, setIncomeExpenseData] = useState<{ income: number; expense: number } | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const history = useHistory();
  const location = useLocation();
  const { state: { profile, preferences, loading: userLoading } } = useUser();

  // Mock bills data - replace with API call later
  const mockBills = [
    { id: '1', name: 'Electricity', amount: 1250.00 },
    { id: '2', name: 'Internet', amount: 899.00 },
    { id: '3', name: 'Gas', amount: 650.00 },
    { id: '4', name: 'Water', amount: 450.00 },
    { id: '5', name: 'Mobile', amount: 399.00 },
  ];

  useEffect(() => {
    const handleTokenAndAuth = async () => {
      try {
        // Extract token from query params
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');

        if (token) {
          // Save the token
          await userService.setAccessToken(token);

          // Remove token from URL for security
          history.replace('/dashboard');
        }

        // Check if user is authenticated
        const isAuthenticated = await userService.isAuthenticated();

        if (!isAuthenticated) {
          // Redirect to login if not authenticated
          history.replace('/login');
          return;
        }

        // Wait for user context to load profile and preferences
        // Profile will be available from context
        if (profile) {
          try {
            const data = await transactionService.getCurrentMonthTotals(profile.id);
            setIncomeExpenseData(data);
          } catch (err: any) {
            console.error('Failed to fetch transaction data:', err);
          }

          // Fetch transactions summary
          try {
            const [recent] = await Promise.all([
              transactionService.getRecentTransactions(profile.id, 3)
            ]);
            setRecentTransactions(recent);
          } catch (err: any) {
            console.error('Failed to fetch transactions list:', err);
          } finally {
            setTransactionsLoading(false);
          }
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
            <IonSpinner name="bubbles" />
            <IonText color="medium">Fetching your expenses</IonText>
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
      <ProfileHeader userProfile={profile} />

      <IonContent fullscreen>
        <div className="p-5 pb-24 bg-gray-100">
          {/* Income & Expense Overview */}
          {preferences?.dashboard?.show_income_expense && (
            <div className="mb-5">
              <IncomeExpenseDonuts
                income={incomeExpenseData?.income}
                expense={incomeExpenseData?.expense}
              />
            </div>
          )}

          {/* AI Suggestions */}
          {preferences?.dashboard?.show_ai_suggestions && (
            <div className="mb-5">
              <TopPicksScroll
                items={[
                  { id: '1', message: 'What if I reduce my latenight cravings?' },
                  { id: '2', message: 'How much can I save this month?' },
                ]}
                onCardClick={(item: any) => console.log('Clicked:', item)}
              />
            </div>
          )}

          {/* Bills */}
          <div className="mb-5">
            <div className="mb-2 px-1">
              <span className="text-sm font-semibold text-gray-800">Bills</span>
            </div>
            <Bills bills={mockBills} />
          </div>

          {/* Budget Summary */}
          {preferences?.dashboard?.show_budget_summary && (
            <div className="mb-5">
              <ReviewList />
            </div>
          )}

          {/* Recent Transactions */}
          {preferences?.dashboard?.show_transaction_list && (
            <div className="mb-5">
              <TransactionList
                title='Recent transactions'
                transactions={recentTransactions}
                isLoading={transactionsLoading}
              />
            </div>
          )}
        </div>
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default Dashboard;

