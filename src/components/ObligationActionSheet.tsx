import React from 'react';
import { IonActionSheet } from '@ionic/react';
import {
  checkmarkDoneOutline,
  timerOutline,
  playSkipForwardOutline,
} from 'ionicons/icons';
import { PatternObligation, patternService } from '../services/patternService';

interface ObligationActionSheetProps {
  obligation: PatternObligation | null;
  onDismiss: () => void;
  onRefresh?: () => void;
  /** When provided, "Mark as paid" calls this instead of fulfilling directly */
  onMarkAsPaid?: (obligation: PatternObligation) => void;
}

const ObligationActionSheet: React.FC<ObligationActionSheetProps> = ({
  obligation,
  onDismiss,
  onRefresh,
  onMarkAsPaid,
}) => {
  return (
    <IonActionSheet
      isOpen={!!obligation}
      onDidDismiss={onDismiss}
      buttons={[
        {
          text: 'Mark as paid',
          icon: checkmarkDoneOutline,
          handler: () => {
            if (!obligation) return;
            if (onMarkAsPaid) {
              onMarkAsPaid(obligation);
            } else {
              patternService.fulfillObligation(obligation.id)
                .then(() => onRefresh?.())
                .catch(err => console.error('Failed to mark as paid', err));
            }
          },
        },
        {
          text: 'Remind me later',
          icon: timerOutline,
          handler: async () => {
            if (!obligation) return;
            try {
              await patternService.snoozeObligation(obligation.id, 7);
              onRefresh?.();
            } catch (err) {
              console.error('Failed to snooze', err);
            }
          },
        },
        {
          text: 'Skip this month',
          icon: playSkipForwardOutline,
          handler: async () => {
            if (!obligation) return;
            try {
              await patternService.skipObligation(obligation.id);
              onRefresh?.();
            } catch (err) {
              console.error('Failed to skip', err);
            }
          },
        }
      ]}
    />
  );
};

export default ObligationActionSheet;
