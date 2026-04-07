import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonSpinner,
  IonBadge,
} from '@ionic/react';
import {
  trendingUpOutline,
  trendingDownOutline,
  repeatOutline,
  alertCircleOutline,
  flashOutline,
} from 'ionicons/icons';
import Footer from '../components/Footer';
import { patternService, RecurringPattern } from '../services/patternService';
import { usePatterns } from '../hooks/queries/usePatternQueries';

type SectionKey = 'INCOME' | 'EXPENSE' | 'OTHER';

const SECTIONS: { key: SectionKey; label: string; directions: string[] }[] = [
  { key: 'INCOME', label: 'Income', directions: ['income'] },
  { key: 'EXPENSE', label: 'Bills & Expenses', directions: ['expense'] },
  { key: 'OTHER', label: 'Other', directions: ['refund'] },
];

const Patterns: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'BROKEN'>('ACTIVE');
  const { data: patterns = [], isLoading: loading } = usePatterns();

  const formatInterval = (days: number): string => {
    if (days >= 28 && days <= 31) return 'Monthly';
    if (days >= 85 && days <= 95) return 'Quarterly';
    if (days >= 350 && days <= 380) return 'Annual';
    if (days === 7) return 'Weekly';
    return `Every ${days}d`;
  };

  const getStatusBadgeColor = (status: string): 'success' | 'warning' | 'danger' | 'medium' => {
    if (status === 'ACTIVE') return 'success';
    if (status === 'PAUSED') return 'warning';
    if (status === 'BROKEN') return 'danger';
    return 'medium';
  };

  const getNextObligationText = (pattern: RecurringPattern): string | null => {
    if (!pattern.obligations || pattern.obligations.length === 0) return null;
    const next = pattern.obligations.find(o => o.status === 'EXPECTED');
    if (!next) return null;
    const days = patternService.getDaysUntilDue(next);
    return patternService.getDueText(days, next.status);
  };

  const getNextObligationUrgency = (pattern: RecurringPattern): string => {
    if (!pattern.obligations) return 'text-gray-400';
    const next = pattern.obligations.find(o => o.status === 'EXPECTED');
    if (!next) return 'text-gray-400';
    const days = patternService.getDaysUntilDue(next);
    return patternService.getUrgencyColor(days, next.status);
  };

  const filteredPatterns = patterns.filter(p =>
    activeFilter === 'ALL' ? true : p.status === activeFilter
  );

  const activeCount = patterns.filter(p => p.status === 'ACTIVE').length;

  return (
    <IonPage>
      <IonHeader className="ion-no-border border-b border-gray-200">
        <IonToolbar>
          <div className="flex items-center gap-2 px-4 py-3">
            <IonIcon icon={repeatOutline} className="text-primary text-xl" />
            <span className="text-lg font-bold text-gray-800">Recurring Patterns</span>
            {activeCount > 0 && (
              <IonBadge color="primary" className="ml-auto">{activeCount} active</IonBadge>
            )}
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="pb-24">
          {/* Filter chips */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide bg-white border-b border-gray-100">
            {(['ALL', 'ACTIVE', 'PAUSED', 'BROKEN'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === filter
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
              >
                {filter.charAt(0) + filter.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <IonSpinner name="bubbles" />
            </div>
          ) : filteredPatterns.length === 0 ? (
            <div className="px-5 pt-10 text-center">
              <IonIcon icon={flashOutline} className="text-5xl text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No patterns detected yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Import your transactions and run pattern analysis to discover recurring bills and income.
              </p>
            </div>
          ) : (
            <div className="px-4 pt-4 flex flex-col gap-6">
              {SECTIONS.map(section => {
                const sectionPatterns = filteredPatterns.filter(p =>
                  section.directions.includes(p.direction)
                );
                if (sectionPatterns.length === 0) return null;

                const isIncome = section.key === 'INCOME';

                return (
                  <div key={section.key}>
                    {/* Section header */}
                    <div className="flex items-center gap-2 mb-3">
                      <IonIcon
                        icon={isIncome ? trendingUpOutline : trendingDownOutline}
                        className={`text-base ${isIncome ? 'text-green-600' : 'text-red-500'}`}
                      />
                      <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                        {section.label}
                      </span>
                      <div className="flex-1 h-px bg-gray-200 ml-1" />
                    </div>

                    {/* Pattern cards */}
                    <div className="flex flex-col gap-3">
                      {sectionPatterns.map(pattern => {
                        const nextText = getNextObligationText(pattern);
                        const nextColor = getNextObligationUrgency(pattern);
                        const streak = pattern.streak?.current_streak ?? 0;
                        const total = pattern.streak?.total_occurrences ?? 0;

                        return (
                          <div
                            key={pattern.id}
                            className="bg-white rounded-xl border border-gray-200 p-4"
                          >
                            {/* Header row */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-800 truncate">
                                  {pattern.transactor?.label || pattern.transactor?.name || 'Unknown'}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {formatInterval(pattern.interval_days)}
                                  {pattern.amount_behavior === 'fixed' ? '' : ' · variable amount'}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                <IonBadge color={getStatusBadgeColor(pattern.status)} className="text-xs">
                                  {pattern.status}
                                </IonBadge>
                              </div>
                            </div>

                            {/* Streak bar */}
                            {total > 0 && (
                              <div className="mb-2">
                                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                  <span>{streak} streak · {total} occurrences</span>
                                  <span>{Math.round(pattern.confidence * 100)}% confidence</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${isIncome ? 'bg-green-400' : 'bg-primary'}`}
                                    style={{ width: `${Math.min(100, Math.round(pattern.confidence * 100))}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Next obligation */}
                            {nextText && (
                              <div className={`text-xs font-medium flex items-center gap-1 ${nextColor}`}>
                                <IonIcon icon={alertCircleOutline} className="text-xs" />
                                {nextText}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default Patterns;
