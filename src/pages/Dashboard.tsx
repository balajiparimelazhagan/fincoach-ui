import { IonContent, IonPage, IonSpinner, IonText } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { userService } from '../services/userService';
import ProfileHeader from '../components/ProfileHeader';
import Footer from '../components/Footer';
import MonthSummaryCard from '../components/MonthSummaryCard';
import CreditCardWidget from '../components/CreditCardWidget';
import OverdueAlertCard from '../components/OverdueAlertCard';
import UpcomingBillsList from '../components/UpcomingBillsList';
import { useUser } from '../context/UserContext';
import { useMonthTotals } from '../hooks/queries/useTransactionQueries';
import { useProjectedSummary } from '../hooks/queries/useStatsQueries';
import { useUpcomingObligations } from '../hooks/queries/usePatternQueries';
import { useQueryClient } from '@tanstack/react-query';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const Dashboard: React.FC = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  const history = useHistory();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { state: { profile, preferences, loading: userLoading } } = useUser();

  // Auth token handling (OAuth callback via deep link puts token in URL params)
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    const handleAuth = async () => {
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
      setAuthChecked(true);
    };
    handleAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Data queries — only run after auth confirmed
  const { data: incomeExpenseData, isLoading: totalsLoading } = useMonthTotals(year, month);
  const { data: projectedData } = useProjectedSummary(year, month + 1);
  const { data: obligations = [], isLoading: obligationsLoading } = useUpcomingObligations(45);

  const handleSync = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions', 'totals', year, month] });
    queryClient.invalidateQueries({ queryKey: ['stats', 'projected', year, month + 1] });
    queryClient.invalidateQueries({ queryKey: ['obligations', 'upcoming', 45] });
  };

  const isLoading = !authChecked || userLoading || totalsLoading || obligationsLoading;

  if (isLoading) {
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

  return (
    <IonPage>
      <ProfileHeader userProfile={profile} onSync={handleSync} />

      <IonContent fullscreen>
        <div className="p-5 pb-8 bg-gray-100 flex flex-col gap-3">

          <OverdueAlertCard obligations={obligations} onRefresh={handleSync} />

          {preferences?.dashboard?.show_income_expense && (
            <MonthSummaryCard
              income={incomeExpenseData?.income ?? 0}
              expense={incomeExpenseData?.expense ?? 0}
              month={MONTH_NAMES[month]}
              projectedIncome={projectedData?.projected_income}
              projectedExpense={projectedData?.projected_expense}
            />
          )}

          <UpcomingBillsList obligations={obligations} />
          <CreditCardWidget obligations={obligations} />
        </div>
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default Dashboard;
