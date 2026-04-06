import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkCircle, alertCircle, timeOutline, chevronDownOutline, chevronUpOutline, ellipsisVertical } from 'ionicons/icons';
import { patternService, PatternObligation } from '../services/patternService';
import { formatFullCurrency } from '../utils/transactionFormatters';
import ObligationActionSheet from './ObligationActionSheet';
import MarkAsPaidDrawer from './MarkAsPaidDrawer';

interface UpcomingOwesProps {
  obligations: PatternObligation[];
  onRefresh?: () => void;
  onObligationFulfilled?: (obligationId: string) => void;
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const VISIBLE_COUNT = 5;

const UpcomingOwes: React.FC<UpcomingOwesProps> = ({ obligations, onRefresh, onObligationFulfilled }) => {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<PatternObligation | null>(null);
  const [payObligation, setPayObligation] = useState<PatternObligation | null>(null);

  const fulfilled = obligations.filter(o => o.status === 'FULFILLED' || o.status === 'SKIPPED').length;
  const total = obligations.length;

  const sorted = [...obligations]
    .filter(o => o.status !== 'FULFILLED' && o.status !== 'SKIPPED' && o.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.expected_date).getTime() - new Date(b.expected_date).getTime());
  const pending = sorted.length;
  const visible = expanded ? sorted : sorted.slice(0, VISIBLE_COUNT);
  const hasMore = pending > VISIBLE_COUNT;

  if (pending === 0 && fulfilled === 0) return null;

  return (
    <>
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text font-semibold text-gray-700">Your Commitments</span>
          <span className="text-xs font-semibold text-gray-400">
            {fulfilled}/{total} fulfilled
          </span>
        </div>

        <div className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex flex-col gap-2 p-3">
            {visible.map(obligation => {
              const daysUntilDue = patternService.getDaysUntilDue(obligation);
              const dueText = patternService.getDueText(daysUntilDue, obligation.status);
              const urgencyBg = patternService.getUrgencyBg(daysUntilDue, obligation.status);
              const urgencyColor = patternService.getUrgencyColor(daysUntilDue, obligation.status);
              const amount = patternService.getExpectedAmount(obligation);
              const dueDate = new Date(obligation.expected_date);

              const statusIcon =
                obligation.status === 'FULFILLED' ? checkmarkCircle
                  : obligation.status === 'MISSED' || daysUntilDue < 0 ? alertCircle
                    : timeOutline;
              const statusIconColor =
                obligation.status === 'FULFILLED' ? 'text-green-500'
                  : daysUntilDue < 0 ? 'text-red-500'
                    : daysUntilDue <= 3 ? 'text-amber-500' : 'text-gray-400';

              const transactorName = obligation.transactor?.label || obligation.transactor?.name || 'Unknown';
              const transactorPicture = obligation.transactor?.picture;
              const avatarLetter = transactorName.charAt(0).toUpperCase();

              return (
                <div
                  key={obligation.id}
                  className={`flex items-center justify-between rounded-xl border p-3 py-1.5 ${urgencyBg}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 flex-shrink-0">
                      {transactorPicture ? (
                        <img
                          src={transactorPicture}
                          alt={transactorName}
                          className="w-9 h-9 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                          {avatarLetter}
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <IonIcon icon={statusIcon} className={`text-xs ${statusIconColor}`} />
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-800 truncate max-w-[160px]">
                        {transactorName}
                      </div>
                      <div className={`text-xs font-medium ${urgencyColor}`}>
                        {dueDate.getDate()} {SHORT_MONTHS[dueDate.getMonth()]} · {dueText}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {amount > 0 && (
                      <div className="text-sm font-bold text-gray-800">{formatFullCurrency(amount)}</div>
                    )}
                    <button
                      className="text-gray-400 p-1"
                      onClick={() => setSelected(obligation)}
                    >
                      <IonIcon icon={ellipsisVertical} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <button
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary border-t border-gray-100 active:bg-gray-50"
              onClick={() => setExpanded(e => !e)}
            >
              <IonIcon icon={expanded ? chevronUpOutline : chevronDownOutline} className="text-sm" />
              {expanded ? 'Show less' : `Show all ${total} commitments`}
            </button>
          )}
        </div>
      </div>

      <ObligationActionSheet
        obligation={selected}
        onDismiss={() => setSelected(null)}
        onRefresh={onRefresh}
        onMarkAsPaid={o => { setSelected(null); setPayObligation(o); }}
      />

      <MarkAsPaidDrawer
        obligation={payObligation}
        onDismiss={() => setPayObligation(null)}
        onSuccess={(obligationId) => {
          setPayObligation(null);
          onObligationFulfilled?.(obligationId);
        }}
      />
    </>
  );
};

export default UpcomingOwes;
