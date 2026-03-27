import React from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkCircle, alertCircle, timeOutline } from 'ionicons/icons';
import { patternService, PatternObligation } from '../services/patternService';
import { formatFullCurrency } from '../utils/transactionFormatters';

interface UpcomingOwesProps {
  obligations: PatternObligation[]; // already filtered to displayed month
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const UpcomingOwes: React.FC<UpcomingOwesProps> = ({ obligations }) => {
  return (
    <div className="px-5 pt-5">
      <div className="text-sm font-semibold text-gray-700 mb-3">
        {obligations.length === 0 ? 'You have predicted owes for this month' : 'Your Upcoming Owes'}
      </div>

      {obligations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-gray-400 text-sm">No recurring obligations detected.</p>
          <p className="text-gray-300 text-xs mt-1">
            Import transactions and run pattern analysis to detect your bills.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {[...obligations]
            .sort((a, b) => new Date(a.expected_date).getTime() - new Date(b.expected_date).getTime())
            .map(obligation => {
              const daysUntilDue  = patternService.getDaysUntilDue(obligation);
              const dueText       = patternService.getDueText(daysUntilDue, obligation.status);
              const urgencyBg     = patternService.getUrgencyBg(daysUntilDue, obligation.status);
              const urgencyColor  = patternService.getUrgencyColor(daysUntilDue, obligation.status);
              const amount        = patternService.getExpectedAmount(obligation);
              const dueDate       = new Date(obligation.expected_date);

              const statusIcon =
                obligation.status === 'FULFILLED' ? checkmarkCircle
                : obligation.status === 'MISSED' || daysUntilDue < 0 ? alertCircle
                : timeOutline;
              const statusIconColor =
                obligation.status === 'FULFILLED' ? 'text-green-500'
                : daysUntilDue < 0 ? 'text-red-500'
                : daysUntilDue <= 3 ? 'text-amber-500' : 'text-gray-400';

              const transactorName    = obligation.transactor?.label || obligation.transactor?.name || 'Unknown';
              const transactorPicture = obligation.transactor?.picture;
              const avatarLetter      = transactorName.charAt(0).toUpperCase();

              return (
                <div
                  key={obligation.id}
                  className={`flex items-center justify-between rounded-xl border p-3 py-1.5 ${urgencyBg}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Transactor avatar with status badge */}
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

                  {amount > 0 && (
                    <div className="text-sm font-bold text-gray-800">{formatFullCurrency(amount)}</div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default UpcomingOwes;
