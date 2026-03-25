import { IonContent, IonPage, IonSpinner, IonText } from '@ionic/react';
import { useEffect, useState, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { userService } from '../services/userService';
import { transactionService, Transaction } from '../services/transactionService';
import { patternService, PatternObligation } from '../services/patternService';
import { categoryService } from '../services/categoryService';
import { Category } from '../services/categoryService';
import ProfileHeader from '../components/ProfileHeader';
import Footer from '../components/Footer';
import MonthSummaryCard from '../components/MonthSummaryCard';
import TransactionList from '../components/TransactionList';
import Bills from '../components/Bills';
import CreditCardWidget from '../components/CreditCardWidget';
import MorningCheckWidget from '../components/MorningCheckWidget';
import RentalIncomeWidget from '../components/RentalIncomeWidget';
import FamilyBillsSummaryWidget from '../components/FamilyBillsSummaryWidget';
import NetBalanceWidget from '../components/NetBalanceWidget';
import WeeklyPictureWidget from '../components/WeeklyPictureWidget';
import UncategorisedTransactionWidget from '../components/UncategorisedTransactionWidget';
import { useUser } from '../context/UserContext';
import { getErrorMessage } from '../utils/errors';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const Dashboard: React.FC = () => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-indexed

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incomeExpenseData, setIncomeExpenseData] = useState<{ income: number; expense: number } | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [obligations, setObligations] = useState<PatternObligation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dismissedTxIds, setDismissedTxIds] = useState<Set<string>>(new Set());
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [obligationsLoading, setObligationsLoading] = useState(true);

  const history = useHistory();
  const location = useLocation();
  const { state: { profile, preferences, loading: userLoading } } = useUser();

  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth();

  const handleMonthSelect = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

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
    setTransactionsLoading(true);
    setObligationsLoading(true);
    await Promise.all([
      fetchMonthData(selectedYear, selectedMonth),
      transactionService.getRecentTransactions(profile.id, 5)
        .then(setRecentTransactions)
        .catch(console.error)
        .finally(() => setTransactionsLoading(false)),
      patternService.getUpcomingObligations(45)
        .then(setObligations)
        .catch(console.error)
        .finally(() => setObligationsLoading(false)),
      categoryService.getCategories()
        .then(setCategories)
        .catch(console.error),
    ]);
  }, [profile, selectedYear, selectedMonth, fetchMonthData]);

  useEffect(() => {
    const handleTokenAndAuth = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');

        if (token) {
          await userService.setAccessToken(token);
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

  // Re-fetch totals when month changes
  useEffect(() => {
    if (!profile || isLoading) return;
    fetchMonthData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, profile, isLoading, fetchMonthData]);

  const expenseObligations = obligations.filter(o => o.pattern?.direction === 'expense');
  const monthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;

  const uncategorisedTx = recentTransactions.filter(
    t => t.type === 'expense' && !t.category && Math.abs(t.amount) >= 5000
  );
  const visibleUncategorised = uncategorisedTx.filter(
    t => !dismissedTxIds.has(t.id || t.transaction_id || '')
  );

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
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthSelect={handleMonthSelect}
        onRefresh={fetchDashboardData}
      />

      <IonContent fullscreen>
        <div className="p-5 pb-24 bg-gray-100 flex flex-col gap-5">

          {/* Morning Check Widget — only show for current month */}
          {isCurrentMonth && (incomeExpenseData?.income || 0) + obligations.length > 0 && (
            <MorningCheckWidget
              obligations={obligations}
              recentTransactions={recentTransactions}
              income={incomeExpenseData?.income ?? 0}
              expense={incomeExpenseData?.expense ?? 0}
            />
          )}

          {/* Month Summary Card */}
          {preferences?.dashboard?.show_income_expense && (
            <MonthSummaryCard
              income={incomeExpenseData?.income ?? 0}
              expense={incomeExpenseData?.expense ?? 0}
              month={monthLabel}
            />
          )}

          {/* This Week's Financial Picture — current month only */}
          {isCurrentMonth && <WeeklyPictureWidget obligations={obligations} />}

          {/* Family Accounts — Net Balance */}
          {isCurrentMonth && <NetBalanceWidget />}

          {/* Uncategorised large transactions */}
          {isCurrentMonth && visibleUncategorised.length > 0 && (
            <UncategorisedTransactionWidget
              transactions={visibleUncategorised}
              categories={categories}
              onCategorised={txId =>
                setDismissedTxIds(prev => new Set([...prev, txId]))
              }
            />
          )}

          {/* Bills Summary */}
          {isCurrentMonth && <FamilyBillsSummaryWidget obligations={obligations} />}

          {/* Bills */}
          <div>
            <div className="mb-2 px-1">
              <span className="text-sm font-semibold text-gray-800">Upcoming Bills</span>
            </div>
            <Bills
              obligations={expenseObligations}
              isLoading={obligationsLoading}
            />
          </div>

          {/* Expected Income (rental / salary) */}
          {isCurrentMonth && <RentalIncomeWidget obligations={obligations} />}

          {/* Credit Cards */}
          <CreditCardWidget obligations={obligations} />

          {/* Recent Transactions */}
          {preferences?.dashboard?.show_transaction_list && (
            <TransactionList
              title="Recent transactions"
              transactions={recentTransactions}
              isLoading={transactionsLoading}
            />
          )}
        </div>
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default Dashboard;
