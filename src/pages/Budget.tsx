import React, { useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonSpinner, IonIcon, IonButtons, IonBackButton,
} from '@ionic/react';
import { listOutline } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import BudgetTable from '../components/BudgetTable';
import AddBudgetItemDrawer from '../components/AddBudgetItemDrawer';
import MarkAsPaidDrawer from '../components/MarkAsPaidDrawer';
import { PatternObligation } from '../services/patternService';
import { budgetService, BudgetSection, CustomBudgetItem } from '../services/budgetService';
import { useUpcomingObligations } from '../hooks/queries/usePatternQueries';
import { useCategoryBudgets } from '../hooks/queries/useStatsQueries';
import { useCustomBudgetItems } from '../hooks/queries/useBudgetQueries';
import { queryKeys } from '../lib/queryKeys';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const COVERAGE_KEY = 'budget_months_coverage';

const Budget: React.FC = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(location.search);
  const now = new Date();

  const initYear  = parseInt(params.get('year')  ?? String(now.getFullYear()));
  const initMonth = parseInt(params.get('month') ?? String(now.getMonth() + 1)) - 1;

  const [selectedYear]  = useState(initYear);
  const [selectedMonth] = useState(initMonth);

  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [drawerSection, setDrawerSection] = useState<BudgetSection>('bills');
  const [payObligation, setPayObligation] = useState<PatternObligation | null>(null);
  const [payCustomItem, setPayCustomItem] = useState<CustomBudgetItem | null>(null);

  const [monthsCoverage] = useState<number>(() => {
    const saved = localStorage.getItem(COVERAGE_KEY);
    return saved ? parseInt(saved) : 6;
  });

  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth();

  // ── Data queries ─────────────────────────────────────────────────────────────
  const { data: allObligations = [], isLoading: obligationsLoading } = useUpcomingObligations(365);
  const { data: categoryBudgets = [], isLoading: budgetsLoading } = useCategoryBudgets(selectedYear, selectedMonth + 1);
  const { data: customItems = [], isLoading: customLoading } = useCustomBudgetItems(selectedYear, selectedMonth + 1);

  const monthObligations: PatternObligation[] = allObligations.filter(o => {
    const d = new Date(o.expected_date);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  const loading = obligationsLoading || budgetsLoading || customLoading;

  const handleAddItem = (section: BudgetSection) => {
    setDrawerSection(section);
    setDrawerOpen(true);
  };

  const handleObligationFulfilled = (obligationId: string) => {
    queryClient.setQueriesData<PatternObligation[]>(
      { queryKey: ['obligations'] },
      (old) => old?.map(o => o.id === obligationId ? { ...o, status: 'FULFILLED' as const } : o)
    );
  };

  const customItemFulfill = payCustomItem
    ? async (transactionId?: string) => {
        await budgetService.markCustomItemPaid(payCustomItem.id, selectedYear, selectedMonth + 1, transactionId);
        queryClient.setQueryData(
          queryKeys.customBudgetItems(selectedYear, selectedMonth + 1),
          (old: typeof customItems) => old?.map(i =>
            i.id === payCustomItem.id
              ? { ...i, is_paid: true, paid_months: [...(i.paid_months ?? []), `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`] }
              : i
          ) ?? []
        );
        queryClient.invalidateQueries({ queryKey: ['budget', 'customItems'] });
      }
    : undefined;

  const customItemAsObligation: PatternObligation | null = payCustomItem
    ? {
        id: payCustomItem.id,
        recurring_pattern_id: '',
        expected_date: new Date(selectedYear, selectedMonth, payCustomItem.day_of_month ?? 1).toISOString(),
        tolerance_days: 0,
        expected_min_amount: payCustomItem.amount,
        expected_max_amount: payCustomItem.amount,
        status: 'EXPECTED',
        transactor: payCustomItem.transactor_id
          ? { id: payCustomItem.transactor_id, name: payCustomItem.transactor_name ?? payCustomItem.label, label: payCustomItem.transactor_name ?? payCustomItem.label }
          : { id: '', name: payCustomItem.label, label: payCustomItem.label },
        account: null,
        pattern: { id: '', direction: payCustomItem.section === 'income' ? 'income' : 'expense', pattern_type: 'custom', interval_days: 30, amount_behavior: 'fixed', status: 'ACTIVE', confidence: 1 },
      }
    : null;

  return (
    <IonPage>
      <IonHeader className="ion-no-border border-b border-gray-200">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/cashflow" text="" />
          </IonButtons>
          <div className="flex items-center gap-2 px-2 py-3">
            <IonIcon icon={listOutline} className="text-primary text-xl" />
            <span className="text-lg font-bold text-gray-800">
              {MONTH_NAMES[selectedMonth]} {selectedYear} — Budget
            </span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="bg-gray-50!">
        <div className="pb-10 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <IonSpinner name="bubbles" />
            </div>
          ) : (
            <BudgetTable
              year={selectedYear}
              month={selectedMonth}
              obligations={monthObligations}
              categoryBudgets={categoryBudgets}
              customItems={customItems}
              monthsCoverage={monthsCoverage}
              onMonthsCoverageChange={() => {}}
              onAddItem={handleAddItem}
              onDeleteItem={(id) => queryClient.setQueryData(
                queryKeys.customBudgetItems(selectedYear, selectedMonth + 1),
                (old: typeof customItems) => old?.filter(i => i.id !== id) ?? []
              )}
              onObligationClick={isCurrentMonth ? setPayObligation : undefined}
              onCustomItemClick={isCurrentMonth ? setPayCustomItem : undefined}
            />
          )}
        </div>

        <MarkAsPaidDrawer
          obligation={payObligation ?? customItemAsObligation}
          onDismiss={() => { setPayObligation(null); setPayCustomItem(null); }}
          onSuccess={(id) => {
            if (payObligation) handleObligationFulfilled(id);
            setPayObligation(null);
            setPayCustomItem(null);
          }}
          onFulfill={customItemFulfill}
        />

        <AddBudgetItemDrawer
          isOpen={drawerOpen}
          defaultSection={drawerSection}
          onDismiss={() => setDrawerOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['budget', 'customItems'] });
            setDrawerOpen(false);
          }}
        />
      </IonContent>
    </IonPage>
  );
};

export default Budget;
