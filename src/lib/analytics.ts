import { AppState, ReviewEvent, CardReviewState } from '../types';
import { getCardReviewState, isCardDueToday } from './storage';

/**
 * Calculate overall recall accuracy: (Good + Easy) / all reviews.
 */
export function calculateRecallAccuracy(history: ReviewEvent[]): number {
  if (history.length === 0) return 0;
  const successful = history.filter(e => e.rating === 'good' || e.rating === 'easy').length;
  return successful / history.length;
}

/**
 * Calculate current streak: consecutive local calendar days with at least one review.
 */
export function calculateStreak(history: ReviewEvent[], now: Date = new Date()): { current: number; longest: number } {
  if (history.length === 0) return { current: 0, longest: 0 };

  const days = new Set<string>();
  history.forEach(e => {
    const d = new Date(e.timestamp);
    days.add(toLocalDateString(d));
  });

  const sortedDays = Array.from(days).sort().reverse();
  const today = toLocalDateString(now);
  const yesterday = toLocalDateString(new Date(now.getTime() - 86400000));

  // Current streak
  let current = 0;
  let checkDate = new Date(now);

  // If today has reviews, start from today. Otherwise check if yesterday was the last.
  if (sortedDays[0] === today || sortedDays[0] === yesterday) {
    if (sortedDays[0] === yesterday) {
      checkDate = new Date(now.getTime() - 86400000);
    }
    for (let i = 0; i < 365; i++) {
      const dateStr = toLocalDateString(checkDate);
      if (days.has(dateStr)) {
        current++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
  }

  // Longest streak
  const allDays = Array.from(days).sort();
  let longest = 0;
  let streakCount = 1;
  for (let i = 1; i < allDays.length; i++) {
    const prev = new Date(allDays[i - 1]);
    const curr = new Date(allDays[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (Math.abs(diff - 1) < 0.5) {
      streakCount++;
    } else {
      longest = Math.max(longest, streakCount);
      streakCount = 1;
    }
  }
  longest = Math.max(longest, streakCount);

  return { current, longest };
}

function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Calculate topic weakness score.
 * Over the most recent 20 review events in the topic:
 * Again = 1, Hard = 0.5, Good/Easy = 0, averaged.
 * Topic is weak if it has >= 5 events and score >= 0.3.
 */
export function calculateTopicWeakness(history: ReviewEvent[]): Map<string, number> {
  const topicEvents = new Map<string, ReviewEvent[]>();

  history.forEach(event => {
    const key = event.topic;
    if (!topicEvents.has(key)) topicEvents.set(key, []);
    topicEvents.get(key)!.push(event);
  });

  const weakness = new Map<string, number>();

  topicEvents.forEach((events, topic) => {
    if (events.length < 5) return;
    const recent = events.slice(-20);
    const score = recent.reduce((sum, e) => {
      if (e.rating === 'again') return sum + 1;
      if (e.rating === 'hard') return sum + 0.5;
      return sum;
    }, 0) / recent.length;

    if (score >= 0.3) {
      weakness.set(topic, score);
    }
  });

  return weakness;
}

/**
 * Count cards due today.
 */
export function countDueToday(state: AppState, now: Date = new Date()): number {
  let count = 0;
  state.cards.forEach(card => {
    const rs = getCardReviewState(state, card.id);
    if (isCardDueToday(rs, now)) count++;
  });
  return count;
}

/**
 * Get domain-level stats.
 */
export function getDomainStats(state: AppState, domainId: string) {
  const domainCards = state.cards.filter(c => c.domainId === domainId);
  const domainHistory = state.reviewHistory.filter(e => e.domainId === domainId);
  const now = new Date();

  const dueCount = domainCards.filter(card => {
    const rs = getCardReviewState(state, card.id);
    return isCardDueToday(rs, now);
  }).length;

  const accuracy = domainHistory.length >= 5
    ? calculateRecallAccuracy(domainHistory)
    : null;

  return {
    totalCards: domainCards.length,
    dueCount,
    reviewCount: domainHistory.length,
    accuracy,
  };
}

/**
 * Get weekly review activity (last 7 days).
 */
export function getWeeklyActivity(history: ReviewEvent[], now: Date = new Date()): { date: string; count: number }[] {
  const days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = toLocalDateString(d);
    const count = history.filter(e => toLocalDateString(new Date(e.timestamp)) === dateStr).length;
    days.push({ date: dateStr, count });
  }
  return days;
}

/**
 * Get unique study days count.
 */
export function getUniqueStudyDays(history: ReviewEvent[]): number {
  const days = new Set(history.map(e => toLocalDateString(new Date(e.timestamp))));
  return days.size;
}

/**
 * Get ratings distribution from history.
 */
export function getRatingsDistribution(history: ReviewEvent[]): Record<string, number> {
  return {
    again: history.filter(e => e.rating === 'again').length,
    hard: history.filter(e => e.rating === 'hard').length,
    good: history.filter(e => e.rating === 'good').length,
    easy: history.filter(e => e.rating === 'easy').length,
  };
}
