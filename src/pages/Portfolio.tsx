import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonPopover,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import {
  settingsOutline,
  shieldCheckmarkOutline,
  trendingUpOutline,
  medkitOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  timeOutline,
  calendarOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import Footer from '../components/Footer';
import ProfileIcon from '../components/ProfileIcon';
import { DashboardPreferencesPanel } from '../components/PreferenceToggle';
import { useUser } from '../context/UserContext';
import { patternService, RecurringPattern, PatternObligation } from '../services/patternService';
import { usePatterns } from '../hooks/queries/usePatternQueries';
import { useUpcomingObligations } from '../hooks/queries/usePatternQueries';

// ── classification helpers ──────────────────────────────────────────────────

const INSURANCE_KW = [
  'lic', 'insurance', 'premium', 'life', 'health plan', 'star health',
  'care health', 'max bupa', 'hdfc life', 'icici pru', 'policy',
];
const SAVINGS_KW = [
  'sip', 'ppf', 'nps', 'rd ', 'recurring deposit', 'mutual fund',
  'elss', 'investment', 'groww', 'zerodha', 'coin', 'kuvera',
];
const HEALTH_KW = [
  'apollo', 'medplus', '1mg', 'netmeds', 'practo', 'pharmacy', 'pharma',
  'medical', 'clinic', 'doctor', 'lab', 'diagnostic', 'hospital',
];

type Category = 'insurance' | 'savings' | 'health' | null;

function classify(pattern: RecurringPattern): Category {
  if (pattern.direction !== 'expense') return null;
  const name = (pattern.transactor?.label || pattern.transactor?.name || '').toLowerCase();
  if (INSURANCE_KW.some(k => name.includes(k))) return 'insurance';
  if (pattern.interval_days >= 150) return 'insurance'; // annual/semi-annual default
  if (SAVINGS_KW.some(k => name.includes(k))) return 'savings';
  if (HEALTH_KW.some(k => name.includes(k))) return 'health';
  return null;
}

// ── sub-components ───────────────────────────────────────────────────────────

interface PatternRowProps {
  pattern: RecurringPattern;
  nextOb: PatternObligation | undefined;
}

const PatternRow: React.FC<PatternRowProps> = ({ pattern, nextOb }) => {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);

  const name = pattern.transactor?.label || pattern.transactor?.name || 'Unknown';
  const amount = nextOb ? patternService.getExpectedAmount(nextOb) : 0;
  const daysUntil = nextOb ? patternService.getDaysUntilDue(nextOb) : null;
  const streak = pattern.streak?.on_time_count ?? pattern.streak?.total_occurrences ?? 0;

  const intervalLabel = (days: number) => {
    if (days >= 330) return 'Annual';
    if (days >= 150) return 'Semi-annual';
    if (days >= 80) return 'Quarterly';
    return 'Monthly';
  };

  let dueText = 'No upcoming obligation';
  let dueColor = 'text-gray-400';
  let dueIcon = timeOutline;

  if (daysUntil !== null) {
    if (daysUntil < 0) {
      dueText = `Overdue by ${Math.abs(daysUntil)} days`;
      dueColor = 'text-red-600';
      dueIcon = alertCircleOutline;
    } else if (daysUntil === 0) {
      dueText = 'Due today';
      dueColor = 'text-amber-600';
      dueIcon = alertCircleOutline;
    } else if (daysUntil <= 14) {
      dueText = `Due in ${daysUntil} days`;
      dueColor = 'text-amber-600';
      dueIcon = alertCircleOutline;
    } else {
      dueText = `Due in ${daysUntil} days`;
      dueColor = 'text-gray-500';
      dueIcon = checkmarkCircleOutline;
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800 truncate">{name}</span>
            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
              {intervalLabel(pattern.interval_days)}
            </span>
            {pattern.status !== 'ACTIVE' && (
              <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full capitalize">
                {pattern.status.toLowerCase()}
              </span>
            )}
          </div>
          <div className={`text-xs flex items-center gap-1 mt-0.5 ${dueColor}`}>
            <IonIcon icon={dueIcon} className="text-xs shrink-0" />
            {dueText}
            {streak > 0 && (
              <span className="ml-1 text-gray-400">· {streak}× paid</span>
            )}
          </div>
        </div>
        {amount > 0 && (
          <div className="text-right shrink-0">
            <div className="text-sm font-bold text-gray-800">{fmt(amount)}</div>
            <div className="text-xs text-gray-400">per cycle</div>
          </div>
        )}
      </div>
      {pattern.confidence > 0 && (
        <div className="mt-2 w-full bg-gray-100 rounded-full h-1">
          <div
            className="bg-primary h-1 rounded-full"
            style={{ width: `${Math.round(pattern.confidence * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

// ── page ─────────────────────────────────────────────────────────────────────

const Portfolio: React.FC = () => {
  const history = useHistory();
  const { state: { profile, preferences }, updateDashboardPreference } = useUser();
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<any>(undefined);

  const { data: patterns = [], isLoading: patternsLoading } = usePatterns();
  const { data: obligations = [], isLoading: obligationsLoading } = useUpcomingObligations(90);

  const loading = patternsLoading || obligationsLoading;

  const handleSettingsClick = (e: any) => {
    setPopoverEvent(e.nativeEvent);
    setShowPopover(true);
  };

  const handlePreferenceChange = async (key: any, value: boolean) => {
    try {
      await updateDashboardPreference(key, value);
    } catch {}
  };

  const getNextOb = (patternId: string): PatternObligation | undefined =>
    obligations
      .filter(o => o.recurring_pattern_id === patternId && o.status === 'EXPECTED')
      .sort((a, b) => new Date(a.expected_date).getTime() - new Date(b.expected_date).getTime())[0];

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);

  const insurancePats = patterns.filter(p => classify(p) === 'insurance');
  const savingsPats = patterns.filter(p => classify(p) === 'savings');
  const healthPats = patterns.filter(p => classify(p) === 'health');

  const annualInsurance = insurancePats.reduce((sum, p) => {
    const ob = getNextOb(p.id);
    const amt = ob ? patternService.getExpectedAmount(ob) : 0;
    const freq = 365 / Math.max(p.interval_days, 1);
    return sum + amt * freq;
  }, 0);

  const SectionHeader: React.FC<{ icon: string; label: string; color: string }> = ({ icon, label, color }) => (
    <div className="flex items-center gap-2 px-1">
      <IonIcon icon={icon} className={`text-sm ${color}`} />
      <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{label}</span>
    </div>
  );

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="px-4 py-3 bg-white">
          <IonButtons slot="start">
            <button onClick={() => history.goBack()} className="flex items-center gap-1 px-2 py-2">
              <IonIcon icon={arrowBackOutline} className="text-2xl text-gray-700" />
            </button>
          </IonButtons>
          <IonTitle className="text-center font-bold text-gray-900">Portfolio</IonTitle>
          <IonButtons slot="end">
            <button onClick={handleSettingsClick} className="flex items-center px-3 py-2">
              <IonIcon icon={settingsOutline} className="text-2xl text-gray-700" />
            </button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonPopover
        isOpen={showPopover}
        event={popoverEvent}
        onDidDismiss={() => setShowPopover(false)}
        className="preferences-popover"
      >
        <div className="max-w-sm p-2">
          {preferences?.dashboard && (
            <DashboardPreferencesPanel
              preferences={preferences.dashboard as any}
              onPreferenceChange={handlePreferenceChange}
            />
          )}
        </div>
      </IonPopover>

      <IonContent fullscreen className="bg-gray-100">
        <div className="p-5 pb-24 flex flex-col gap-5">

          <div className="bg-primary rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-3">
              <ProfileIcon />
              <div>
                <div className="text-white font-bold text-base">
                  {profile?.name || profile?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-white/70 text-xs mt-0.5">Family financial overview</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <IonSpinner name="dots" className="text-gray-400" />
            </div>
          ) : (
            <>
              {insurancePats.length > 0 && (
                <div className="flex flex-col gap-3">
                  <SectionHeader icon={shieldCheckmarkOutline} label="Insurance" color="text-blue-500" />
                  {insurancePats.map(p => (
                    <PatternRow key={p.id} pattern={p} nextOb={getNextOb(p.id)} />
                  ))}
                  {annualInsurance > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IonIcon icon={calendarOutline} className="text-blue-400 text-sm" />
                        <span className="text-xs text-blue-700 font-medium">Annual premium total</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-blue-800">{fmt(annualInsurance)}</div>
                        <div className="text-xs text-blue-500">≈ {fmt(annualInsurance / 12)}/mo</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {savingsPats.length > 0 && (
                <div className="flex flex-col gap-3">
                  <SectionHeader icon={trendingUpOutline} label="Savings & Investments" color="text-green-500" />
                  {savingsPats.map(p => (
                    <PatternRow key={p.id} pattern={p} nextOb={getNextOb(p.id)} />
                  ))}
                </div>
              )}

              {healthPats.length > 0 && (
                <div className="flex flex-col gap-3">
                  <SectionHeader icon={medkitOutline} label="Healthcare" color="text-red-400" />
                  {healthPats.map(p => (
                    <PatternRow key={p.id} pattern={p} nextOb={getNextOb(p.id)} />
                  ))}
                </div>
              )}

              {insurancePats.length === 0 && savingsPats.length === 0 && healthPats.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <IonIcon icon={shieldCheckmarkOutline} className="text-5xl text-gray-200 mb-3" />
                  <p className="text-sm">No insurance, savings, or healthcare patterns detected yet.</p>
                  <p className="text-xs mt-1 text-gray-300">
                    Import more transactions to automatically detect recurring premiums and investments.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default Portfolio;
