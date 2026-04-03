import api from './api';
import { Account } from './transactionService';

export interface PatternTransactor {
  id: string;
  name: string;
  label?: string;
  picture?: string;
}

export interface PatternStreak {
  current_streak: number;
  longest_streak: number;
  total_occurrences: number;
  on_time_count: number;
}

export interface RecurringPattern {
  id: string;
  transactor: PatternTransactor;
  direction: 'income' | 'expense' | 'refund';
  pattern_type: string;
  interval_days: number;
  amount_behavior: string;
  status: 'ACTIVE' | 'PAUSED' | 'BROKEN';
  confidence: number;
  detected_at: string;
  last_evaluated_at: string;
  streak?: PatternStreak;
  obligations?: PatternObligation[];
}

export interface PatternObligation {
  id: string;
  recurring_pattern_id: string;
  expected_date: string;
  tolerance_days: number;
  expected_min_amount?: number;
  expected_max_amount?: number;
  status: 'EXPECTED' | 'FULFILLED' | 'MISSED' | 'CANCELLED' | 'SKIPPED';
  fulfilled_by_transaction_id?: string;
  fulfilled_at?: string;
  days_early?: number;
  account?: Account | null;
  pattern?: {
    id: string;
    direction: string;
    pattern_type: string;
    interval_days: number;
    amount_behavior: string;
    status: string;
    confidence: number;
  };
  transactor?: PatternTransactor;
}

class PatternService {
  /**
   * Get all recurring patterns for the authenticated user
   */
  async getPatterns(status?: string, includeObligations = true): Promise<RecurringPattern[]> {
    const response = await api.get<RecurringPattern[]>('/patterns', {
      params: {
        status,
        include_obligations: includeObligations,
      },
    });
    return response.data;
  }

  /**
   * Get upcoming obligations sorted by expected date (soonest first).
   * Falls back to deriving obligations from GET /patterns if the dedicated endpoint fails.
   * @param daysAhead - Number of days to look ahead (default 30)
   */
  async getUpcomingObligations(daysAhead = 30): Promise<PatternObligation[]> {
    try {
      const response = await api.get<PatternObligation[]>('/patterns/obligations/upcoming', {
        params: { days_ahead: daysAhead },
      });
      return response.data;
    } catch {
      // Dedicated endpoint unavailable — derive from patterns with embedded obligations
      return this._deriveObligationsFromPatterns(daysAhead);
    }
  }

  /**
   * Derive upcoming obligations from patterns (fallback when dedicated endpoint is unavailable)
   */
  private async _deriveObligationsFromPatterns(daysAhead: number): Promise<PatternObligation[]> {
    const patterns = await this.getPatterns(undefined, true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const obligations: PatternObligation[] = [];

    patterns.forEach(pattern => {
      if (!pattern.obligations) return;
      pattern.obligations.forEach(o => {
        const dueDate = new Date(o.expected_date);
        if (dueDate <= cutoff) {
          obligations.push({
            ...o,
            pattern: {
              id: pattern.id,
              direction: pattern.direction,
              pattern_type: pattern.pattern_type,
              interval_days: pattern.interval_days,
              amount_behavior: pattern.amount_behavior,
              status: pattern.status,
              confidence: pattern.confidence,
            },
            transactor: o.transactor ?? pattern.transactor,
          });
        }
      });
    });

    return obligations.sort(
      (a, b) => new Date(a.expected_date).getTime() - new Date(b.expected_date).getTime()
    );
  }

  /**
   * Manually mark an obligation as fulfilled.
   * Pass transactionId to link it to a specific transaction.
   */
  async fulfillObligation(obligationId: string, transactionId?: string): Promise<void> {
    await api.patch(`/patterns/obligations/${obligationId}/fulfill`, transactionId ? { transaction_id: transactionId } : undefined);
  }

  /**
   * Snooze an obligation by pushing its expected date forward
   */
  async snoozeObligation(obligationId: string, days = 7): Promise<void> {
    await api.patch(`/patterns/obligations/${obligationId}/snooze`, { days });
  }

  /**
   * Skip this occurrence of an obligation (not counted as paid or missed)
   */
  async skipObligation(obligationId: string): Promise<void> {
    await api.patch(`/patterns/obligations/${obligationId}/skip`);
  }

  /**
   * Delete a recurring pattern (and its obligations)
   */
  async deletePattern(patternId: string): Promise<void> {
    await api.delete(`/patterns/${patternId}`);
  }

  /**
   * Trigger pattern analysis for the authenticated user
   */
  async analyzePatterns(transactorId?: string, direction?: string): Promise<{ patterns_discovered: number }> {
    const response = await api.post('/patterns/analyze', {
      transactor_id: transactorId,
      direction,
    });
    return response.data;
  }

  /**
   * Returns days until an obligation is due (negative = overdue)
   */
  getDaysUntilDue(obligation: PatternObligation): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(obligation.expected_date);
    dueDate.setHours(0, 0, 0, 0);
    return Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Returns urgency color class based on days until due
   */
  getUrgencyColor(daysUntilDue: number, status: string): string {
    if (status === 'FULFILLED') return 'text-green-600';
    if (status === 'MISSED') return 'text-red-600';
    if (daysUntilDue < 0) return 'text-red-600';
    if (daysUntilDue <= 3) return 'text-amber-500';
    if (daysUntilDue <= 7) return 'text-yellow-500';
    return 'text-gray-500';
  }

  /**
   * Returns bg color class for obligation urgency
   */
  getUrgencyBg(daysUntilDue: number, status: string): string {
    if (status === 'FULFILLED') return 'bg-green-50 border-green-200';
    if (status === 'MISSED') return 'bg-red-50 border-red-200';
    if (daysUntilDue < 0) return 'bg-red-50 border-red-200';
    if (daysUntilDue <= 3) return 'bg-amber-50 border-amber-200';
    if (daysUntilDue <= 7) return 'bg-yellow-50 border-yellow-200';
    return 'bg-white border-gray-200';
  }

  /**
   * Returns human-readable due text
   */
  getDueText(daysUntilDue: number, status: string): string {
    if (status === 'FULFILLED') return 'Paid ✓';
    if (status === 'MISSED') return 'Missed';
    if (daysUntilDue < 0) return `Overdue by ${Math.abs(daysUntilDue)}d`;
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    return `Due in ${daysUntilDue} days`;
  }

  /**
   * Returns the display amount for an obligation (midpoint of range or exact)
   */
  getExpectedAmount(obligation: PatternObligation): number {
    if (obligation.expected_min_amount && obligation.expected_max_amount) {
      return Math.round((obligation.expected_min_amount + obligation.expected_max_amount) / 2);
    }
    return obligation.expected_min_amount || obligation.expected_max_amount || 0;
  }
}

export const patternService = new PatternService();
export default patternService;
