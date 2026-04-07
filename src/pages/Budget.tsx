import React, { useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonSpinner, IonIcon, IonButtons, IonBackButton,
} from '@ionic/react';
import { listOutline } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import BudgetTable from '../components/BudgetTable';
import AddBudgetItemDrawer from '../components/AddBudgetItemDrawer';
import { PatternObligation } from '../services/patternService';
import { BudgetSection } from '../services/budgetService';
import { useUpcomingObligations } from '../hooks/queries/usePatternQueries';
import { useCategoryBudgets } from '../hooks/queries/useStatsQueries';
import { useCustomBudgetItems } from '../hooks/queries/useBudgetQueries';

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

  const initYear = parseInt(params.get('year') ?? String(now.getFullYear()));
  const initMonth = parseInt(params.get('month') ?? String(now.getMonth() + 1)) - 1;

  const [selectedYear] = useState(initYear);
  const [selectedMonth] = useState(initMonth);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSection, setDrawerSection] = useState<BudgetSection>('bills');

  const [monthsCoverage, setMonthsCoverage] = useState<number>(() => {
    const saved = localStorage.getItem(COVERAGE_KEY);
    return saved ? parseInt(saved) : 6;
  });

  // ── Data queries ─────────────────────────────────────────────────────────────
  const { data: allObligations = [], isLoading: obligationsLoading } = useUpcomingObligations(365);
  const { data: categoryBudgets = [], isLoading: budgetsLoading } = useCategoryBudgets(selectedYear, selectedMonth + 1);
  const { data: customItems = [], isLoading: customLoading } = useCustomBudgetItems();

  const monthObligations: PatternObligation[] = allObligations.filter(o => {
    const d = new Date(o.expected_date);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  const loading = obligationsLoading || budgetsLoading || customLoading;

  const handleMonthsCoverageChange = (v: number) => {
    setMonthsCoverage(v);
    localStorage.setItem(COVERAGE_KEY, String(v));
  };

  const handleAddItem = (section: BudgetSection) => {
    setDrawerSection(section);
    setDrawerOpen(true);
  };

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
              onMonthsCoverageChange={handleMonthsCoverageChange}
              onAddItem={handleAddItem}
              onDeleteItem={(id) => queryClient.setQueryData(
                ['budget', 'customItems'],
                (old: typeof customItems) => old?.filter(i => i.id !== id) ?? []
              )}
            />
          )}
        </div>

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
