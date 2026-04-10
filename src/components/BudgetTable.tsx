import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  addOutline,
  trendingUpOutline,
  trendingDownOutline,
  saveOutline,
  flashOutline,
  checkmarkCircle,
} from 'ionicons/icons';
import { PatternObligation, patternService } from '../services/patternService';
import { CategoryBudget } from '../services/statsService';
import { CustomBudgetItem, BudgetSection } from '../services/budgetService';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const obligationDate = (dateStr: string) => {
  const d = new Date(dateStr).getDate();
  return `${ordinal(d)}`;
};

const truncate = (s: string, maxLen = 14) =>
  s.length > maxLen ? s.slice(0, maxLen) + '…' : s;

interface BudgetTableProps {
  year: number;
  month: number;                  // 0-indexed
  obligations: PatternObligation[];
  categoryBudgets: CategoryBudget[];
  customItems: CustomBudgetItem[];
  monthsCoverage: number;
  onMonthsCoverageChange: (v: number) => void;
  onAddItem: (section: BudgetSection) => void;
  onDeleteItem: (id: string) => void;
  /** When provided, non-fulfilled obligation rows are tappable */
  onObligationClick?: (obligation: PatternObligation) => void;
  /** When provided, custom item rows are tappable (for mark-as-paid) */
  onCustomItemClick?: (item: CustomBudgetItem) => void;
}

// ── Section config ──────────────────────────────────────────────────────────

interface SectionConfig {
  key: BudgetSection;
  label: string;
  icon: string;
  iconColor: string;
  headerBg: string;
}

const SECTIONS: SectionConfig[] = [
  { key: 'income',   label: 'Income',              icon: trendingUpOutline,   iconColor: 'text-green-600', headerBg: 'bg-gray-50' },
  { key: 'bills',    label: 'Bills & EMIs',         icon: trendingDownOutline, iconColor: 'text-red-500',   headerBg: 'bg-gray-50' },
  { key: 'savings',  label: 'Savings & Investments',icon: saveOutline,         iconColor: 'text-blue-600',  headerBg: 'bg-gray-50' },
  { key: 'flexible', label: 'Flexible Spending',    icon: flashOutline,        iconColor: 'text-amber-500', headerBg: 'bg-gray-50' },
];

// ── Row types ────────────────────────────────────────────────────────────────

type ObligationRow = { kind: 'obligation'; obligation: PatternObligation; done: boolean; amount: number; dateLabel: string; name: string };
type FlexibleRow   = { kind: 'flexible';   budget: CategoryBudget; done: boolean; amount: number; actual: number };
type CustomRow     = { kind: 'custom';     item: CustomBudgetItem; dateLabel: string; done: boolean };
type BudgetRow     = ObligationRow | FlexibleRow | CustomRow;

// ── Component ────────────────────────────────────────────────────────────────

const BudgetTable: React.FC<BudgetTableProps> = ({
  year,
  month,
  obligations,
  categoryBudgets,
  customItems,
  onAddItem,
  onObligationClick,
  onCustomItemClick,
}) => {
  const now = new Date();
  const isPastMonth = year < now.getFullYear() ||
    (year === now.getFullYear() && month < now.getMonth());

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  // ── Row builders ────────────────────────────────────────────────────────

  const incomeObligations  = obligations.filter(o => o.pattern?.direction === 'income');
  const billObligations    = obligations.filter(o => o.pattern?.direction === 'expense');
  const customBySection    = (s: BudgetSection) => customItems.filter(i => i.section === s);

  const obligationRows = (obs: PatternObligation[]): ObligationRow[] =>
    obs.map(o => ({
      kind: 'obligation',
      obligation: o,
      done: o.status === 'FULFILLED',
      amount: patternService.getExpectedAmount(o),
      dateLabel: obligationDate(o.expected_date),
      name: o.transactor?.label ?? o.transactor?.name ?? 'Unknown',
    }));

  const flexibleRows = (): FlexibleRow[] =>
    categoryBudgets
      .filter(c => !c.has_pattern)
      .map(c => ({
        kind: 'flexible',
        budget: c,
        done: c.current_actual > 0 && c.current_actual >= c.avg_last_3_months,
        amount: c.avg_last_3_months,
        actual: c.current_actual,
      }));

  const customRows = (s: BudgetSection): CustomRow[] =>
    customBySection(s).map(i => ({
      kind: 'custom',
      item: i,
      dateLabel: i.day_of_month ? `${ordinal(i.day_of_month)}` : '—',
      done: i.is_paid === true || (i.paid_months ?? []).includes(monthKey),
    }));

  const rowsForSection = (key: BudgetSection): BudgetRow[] => {
    switch (key) {
      case 'income':   return [...obligationRows(incomeObligations),  ...customRows('income')];
      case 'bills':    return [...obligationRows(billObligations),     ...customRows('bills')];
      case 'savings':  return customRows('savings');
      case 'flexible': return [...flexibleRows(), ...customRows('flexible')];
    }
  };

  // ── Totals ────────────────────────────────────────────────────────────────

  const totalBills    = billObligations.reduce((s, o) => s + patternService.getExpectedAmount(o), 0)
    + customBySection('bills').reduce((s, i) => s + i.amount, 0);
  const totalSavings  = customBySection('savings').reduce((s, i) => s + i.amount, 0);
  const totalFlexible = categoryBudgets.filter(c => !c.has_pattern).reduce((s, c) => s + c.avg_last_3_months, 0)
    + customBySection('flexible').reduce((s, i) => s + i.amount, 0);
  const totalIncome   = incomeObligations.reduce((s, o) => s + patternService.getExpectedAmount(o), 0)
    + customBySection('income').reduce((s, i) => s + i.amount, 0);
  const totalExpense  = totalBills + totalSavings + totalFlexible;

  // ── Row renderers ─────────────────────────────────────────────────────────

  const renderObligationRow = (row: ObligationRow) => {
    const clickable = !row.done && !isPastMonth && !!onObligationClick;
    return (
      <tr
        key={row.obligation.id}
        onClick={clickable ? () => onObligationClick!(row.obligation) : undefined}
        className={`border-t border-gray-200 transition-opacity
          ${row.done ? 'opacity-40' : ''}
          ${clickable ? 'cursor-pointer active:bg-gray-50' : ''}`}
      >
        <td className="px-3! py-2.5!">
          <div className="flex items-center gap-2">
            {row.done && <IonIcon icon={checkmarkCircle} className="text-base text-green-500" />}
            <span className="text-sm font-medium text-gray-800">{truncate(row.name)}</span>
          </div>
        </td>
        <td className="px-3! py-2.5! text-sm font-semibold text-gray-800 text-right whitespace-nowrap">
          {row.amount > 0 ? fmt(row.amount) : '?'}
        </td>
        <td className="px-3! py-2.5! text-xs text-gray-600 text-right whitespace-nowrap">
          {row.dateLabel}
        </td>
      </tr>
    );
  };

  const renderFlexibleRow = (row: FlexibleRow) => {
    const hasHistory = row.amount > 0;
    const pct = hasHistory ? Math.min((row.actual / row.amount) * 100, 100) : 0;

    return (
      <tr key={row.budget.category_id ?? row.budget.category_name} className="border-t border-gray-200">
        <td className="px-3! py-2.5!">
          <div className="flex items-center gap-2">
            {row.done && !isPastMonth && (
              <IonIcon icon={checkmarkCircle} className="text-base shrink-0 text-green-500" />
            )}
            <div>
              <span className="text-sm font-medium text-gray-800">{truncate(row.budget.category_name)}</span>
              {!isPastMonth && hasHistory && (
                <div className="w-24 h-1 mt-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${row.done ? 'bg-green-400' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-3! py-2.5! text-right whitespace-nowrap">
          {isPastMonth ? (
            <span className="text-sm font-semibold text-gray-800">
              {row.actual > 0 ? fmt(row.actual) : '—'}
            </span>
          ) : (
            <>
              <span className="text-sm font-semibold text-gray-800">{hasHistory ? fmt(row.amount) : '—'}</span>
              {hasHistory && row.actual > 0 && (
                <div className="text-xs text-gray-400">{fmt(row.actual)} spent</div>
              )}
            </>
          )}
        </td>
        <td className="px-3! py-2.5! text-xs text-center text-gray-400">—</td>
      </tr>
    );
  };

  const renderCustomRow = (row: CustomRow) => {
    const clickable = !row.done && !isPastMonth && !!onCustomItemClick;
    return (
      <tr
        key={row.item.id}
        onClick={clickable ? () => onCustomItemClick!(row.item) : undefined}
        className={`border-t border-gray-200 transition-opacity
          ${row.done ? 'opacity-40' : ''}
          ${clickable ? 'cursor-pointer active:bg-gray-50' : ''}`}
      >
        <td className="px-3! py-2.5!">
          <div className="flex items-center gap-2">
            {row.done && <IonIcon icon={checkmarkCircle} className="text-base text-green-500" />}
            <span className="text-sm font-medium text-gray-800">{truncate(row.item.label)}</span>
          </div>
        </td>
        <td className="px-3! py-2.5! text-sm font-semibold text-gray-800 text-right whitespace-nowrap">
          {fmt(row.item.amount)}
        </td>
        <td className="px-3! py-2.5! text-xs text-gray-400 text-right whitespace-nowrap">
          {row.dateLabel}
        </td>
      </tr>
    );
  };

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="px-4 pb-8 flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="px-3! py-2.5! text-left text-xs font-semibold text-white uppercase tracking-wide">Category</th>
              <th className="px-3! py-2.5! text-right text-xs font-semibold text-white uppercase tracking-wide whitespace-nowrap">Monthly (₹)</th>
              <th className="px-3! py-2.5! text-center text-xs font-semibold text-white uppercase tracking-wide">Date</th>
            </tr>
          </thead>

          <tbody>
            {SECTIONS.map(sec => {
              const rows = rowsForSection(sec.key);
              return (
                <React.Fragment key={sec.key}>
                  <tr className={sec.headerBg}>
                    <td colSpan={3} className="bg-transparent">
                      <div className="flex px-3! py-1.5! items-center justify-between border border-b-0 rounded-t-xl border-gray-200">
                        <div className="flex items-center gap-1.5">
                          <IonIcon icon={sec.icon} className={`text-sm ${sec.iconColor}`} />
                          <span className="text-xs font-bold uppercase tracking-wide text-gray-600">{sec.label}</span>
                        </div>
                        <button
                          onClick={() => onAddItem(sec.key)}
                          className="flex items-center gap-0.5 text-xs font-semibold text-primary active:opacity-70 py-0.5 px-1.5 rounded"
                        >
                          <IonIcon icon={addOutline} className="text-sm" />
                          Add
                        </button>
                      </div>
                    </td>
                  </tr>

                  {rows.length === 0 ? (
                    <tr className="border-t border-gray-200">
                      <td colSpan={3} className="px-3! py-2! text-xs text-gray-300 italic">
                        No items — tap Add to create one
                      </td>
                    </tr>
                  ) : (
                    rows.map(row => {
                      if (row.kind === 'obligation') return renderObligationRow(row);
                      if (row.kind === 'flexible')   return renderFlexibleRow(row);
                      return renderCustomRow(row);
                    })
                  )}
                </React.Fragment>
              );
            })}

            <tr className="bg-primary">
              <td className="px-3! py-2! text-sm font-bold text-white">Total Monthly Expense</td>
              <td className="px-3! py-2! text-sm font-bold text-white text-right whitespace-nowrap">{fmt(totalExpense)}</td>
              <td />
            </tr>

            {totalIncome > 0 && (
              <tr className="bg-gray-100 border-t border-gray-200">
                <td className="text-xs font-semibold text-green-700 px-3! py-2!">Expected Income</td>
                <td className="text-sm font-bold text-green-700 text-right whitespace-nowrap px-3! py-2!">{fmt(totalIncome)}</td>
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BudgetTable;
