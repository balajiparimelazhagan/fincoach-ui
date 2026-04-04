import React, { useEffect, useState, useCallback } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonSpinner, IonIcon, IonButtons, IonBackButton,
} from '@ionic/react';
import { listOutline } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import BudgetTable from '../components/BudgetTable';
import AddBudgetItemDrawer from '../components/AddBudgetItemDrawer';
import { patternService, PatternObligation } from '../services/patternService';
import { statsService, CategoryBudget } from '../services/statsService';
import { budgetService, CustomBudgetItem, BudgetSection } from '../services/budgetService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const COVERAGE_KEY = 'budget_months_coverage';

const Budget: React.FC = () => {
  const location = useLocation();
  const params   = new URLSearchParams(location.search);
  const now      = new Date();

  // Year/month come from query string; fall back to current month
  const initYear  = parseInt(params.get('year')  ?? String(now.getFullYear()));
  const initMonth = parseInt(params.get('month') ?? String(now.getMonth() + 1)) - 1; // convert to 0-indexed

  const [selectedYear]  = useState(initYear);
  const [selectedMonth] = useState(initMonth);

  const [obligations,     setObligations]     = useState<PatternObligation[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [customItems,     setCustomItems]     = useState<CustomBudgetItem[]>([]);
  const [loading,         setLoading]         = useState(true);

  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [drawerSection, setDrawerSection] = useState<BudgetSection>('bills');

  const [monthsCoverage, setMonthsCoverage] = useState<number>(() => {
    const saved = localStorage.getItem(COVERAGE_KEY);
    return saved ? parseInt(saved) : 6;
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [obs, budgets, custom] = await Promise.all([
        patternService.getUpcomingObligations(365),
        statsService.getCategoryBudgets(selectedYear, selectedMonth + 1),
        budgetService.getCustomItems(),
      ]);

      const monthObs = obs.filter(o => {
        const d = new Date(o.expected_date);
        return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
      });

      setObligations(monthObs);
      setCategoryBudgets(budgets);
      setCustomItems(custom);
    } catch (err) {
      console.error('Failed to load budget data', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleMonthsCoverageChange = (v: number) => {
    setMonthsCoverage(v);
    localStorage.setItem(COVERAGE_KEY, String(v));
  };

  const handleAddItem = (section: BudgetSection) => {
    setDrawerSection(section);
    setDrawerOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    await budgetService.deleteCustomItem(id);
    setCustomItems(prev => prev.filter(i => i.id !== id));
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
              obligations={obligations}
              categoryBudgets={categoryBudgets}
              customItems={customItems}
              monthsCoverage={monthsCoverage}
              onMonthsCoverageChange={handleMonthsCoverageChange}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
            />
          )}
        </div>

        <AddBudgetItemDrawer
          isOpen={drawerOpen}
          defaultSection={drawerSection}
          onDismiss={() => setDrawerOpen(false)}
          onSuccess={loadData}
        />
      </IonContent>
    </IonPage>
  );
};

export default Budget;
