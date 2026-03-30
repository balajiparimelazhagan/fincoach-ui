import { IonContent, IonPage, IonSpinner, IonText } from '@ionic/react';
import { useEffect, useState, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { userService } from '../services/userService';
import { transactionService, Transaction } from '../services/transactionService';
import { patternService, PatternObligation } from '../services/patternService';
import { statsService } from '../services/statsService';
import ProfileHeader from '../components/ProfileHeader';
import Footer from '../components/Footer';
import MonthSummaryCard from '../components/MonthSummaryCard';
import CreditCardWidget from '../components/CreditCardWidget';
import WeeklyPictureWidget from '../components/WeeklyPictureWidget';
import OverdueAlertCard from '../components/OverdueAlertCard';
import UpcomingBillsList from '../components/UpcomingBillsList';
import { useUser } from '../context/UserContext';
import { getErrorMessage } from '../utils/errors';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const Dashboard: React.FC = () => {
  const now = new Date();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incomeExpenseData, setIncomeExpenseData] = useState<{ income: number; expense: number } | null>(null);
  const [projectedData, setProjectedData] = useState<{ projected_income: number; projected_expense: number } | null>(null);
  const [obligations, setObligations] = useState<PatternObligation[]>([]);

  const history = useHistory();
  const location = useLocation();
  const { state: { profile, preferences, loading: userLoading } } = useUser();

  const fetchMonthData = useCallback(async (year: number, month: number) => {
    try {
      const data = await transactionService.getMonthTotals(year, month);
      setIncomeExpenseData(data);
    } catch (err) {
      console.error('Failed to fetch transaction totals:', err);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!profile) return;
    await Promise.all([
      fetchMonthData(now.getFullYear(), now.getMonth()),
      statsService.getProjectedSummary(now.getFullYear(), now.getMonth() + 1)
        .then(setProjectedData)
        .catch(console.error),
      patternService.getUpcomingObligations(45)
        .then(setObligations)
        .catch(console.error),
    ]);
  }, [profile, fetchMonthData]);

  useEffect(() => {
    const handleTokenAndAuth = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh_token');

        if (token) {
          await userService.setAccessToken(token);
          if (refreshToken) await userService.setRefreshToken(refreshToken);
          history.replace('/dashboard');
        }

        const isAuthenticated = await userService.isAuthenticated();
        if (!isAuthenticated) {
          history.replace('/login');
          return;
        }

        await fetchDashboardData();
        setIsLoading(false);
      } catch (err) {
        console.error('Dashboard initialization error:', err);
        setError(getErrorMessage(err));
        setIsLoading(false);
      }
    };

    handleTokenAndAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);


  if (isLoading || userLoading) {
    return (
      <IonPage>
        <IonContent fullscreen className="flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <IonSpinner name="bubbles" />
            <IonText color="medium">Fetching your finances</IonText>
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
      <ProfileHeader
        userProfile={profile}
        onSync={fetchDashboardData}
      />

      <IonContent fullscreen>
        <div className="p-5 pb-8 bg-gray-100 flex flex-col gap-3">

          {/* Overdue alerts */}
          <OverdueAlertCard obligations={obligations} onRefresh={fetchDashboardData} />

          {/* Month Summary Card */}
          {preferences?.dashboard?.show_income_expense && (
            <MonthSummaryCard
              income={incomeExpenseData?.income ?? 0}
              expense={incomeExpenseData?.expense ?? 0}
              month={MONTH_NAMES[now.getMonth()]}
              projectedIncome={projectedData?.projected_income}
              projectedExpense={projectedData?.projected_expense}
            />
          )}

          {/* Upcoming bills */}
          <UpcomingBillsList obligations={obligations} />

          {/* Credit Cards */}
          <CreditCardWidget obligations={obligations} />
        </div>
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default Dashboard;
