import { CardReviewState, Rating } from '../types';

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

/**
 * Lightweight educational spaced-repetition scheduling heuristic.
 * This is NOT a clinically validated model—it's a simple, deterministic algorithm
 * designed to help learners review cards at increasing intervals.
 */
export function calculateNextState(
  currentState: CardReviewState,
  rating: Rating,
  now: Date,
  maxIntervalDays: number = 90
): CardReviewState {
  const prev = currentState.intervalDays;
  const newState = { ...currentState };
  newState.reviewCount += 1;
  newState.lastRating = rating;
  newState.lastReviewedAt = now.toISOString();

  switch (rating) {
    case 'again':
      newState.lapses += 1;
      newState.successStreak = 0;
      newState.intervalDays = 0;
      newState.priorityFlag = true;
      // Due in 10 minutes
      newState.dueAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
      break;

    case 'hard':
      // intervalDays = clamp(round(prev × 0.5), 1, 7)
      newState.intervalDays = clamp(Math.round(prev * 0.5), 1, 7);
      // successStreak unchanged
      newState.dueAt = addDays(now, newState.intervalDays).toISOString();
      break;

    case 'good':
      newState.successStreak += 1;
      newState.intervalDays = getGoodInterval(newState.successStreak, prev);
      newState.priorityFlag = false;
      newState.successfulReviews += 1;
      newState.dueAt = addDays(now, newState.intervalDays).toISOString();
      break;

    case 'easy':
      newState.successStreak += 1;
      newState.intervalDays = getEasyInterval(newState.successStreak, prev);
      newState.priorityFlag = false;
      newState.successfulReviews += 1;
      newState.dueAt = addDays(now, newState.intervalDays).toISOString();
      break;
  }

  // Cap interval at maxIntervalDays
  newState.intervalDays = clamp(newState.intervalDays, 0, maxIntervalDays);

  return newState;
}

function getGoodInterval(successStreak: number, prev: number): number {
  const ladder = [1, 3, 7, 14];
  if (successStreak <= ladder.length) {
    return ladder[successStreak - 1];
  }
  return Math.round(prev * 1.8);
}

function getEasyInterval(successStreak: number, prev: number): number {
  const ladder = [4, 10, 21];
  if (successStreak <= ladder.length) {
    return ladder[successStreak - 1];
  }
  return Math.round(prev * 2.5);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Apply exam date cap to due date.
 */
export function capDueToExamDate(dueAt: string, examDate: string | null): string {
  if (!examDate) return dueAt;
  const exam = new Date(examDate);
  const dayBeforeExam = new Date(exam);
  dayBeforeExam.setDate(dayBeforeExam.getDate() - 1);
  dayBeforeExam.setHours(23, 59, 59, 999);

  const due = new Date(dueAt);
  if (due > dayBeforeExam) {
    return dayBeforeExam.toISOString();
  }
  return dueAt;
}

/**
 * Check if a card is a leech (lapses >= 3).
 */
export function isLeech(state: CardReviewState): boolean {
  return state.lapses >= 3;
}

/**
 * Get cards that should be prioritized for difficult review.
 */
export function getDifficultCardIds(
  reviewStates: Record<string, CardReviewState>
): string[] {
  return Object.entries(reviewStates)
    .filter(([_, state]) => {
      return state.lapses >= 2 ||
        state.lastRating === 'again' ||
        state.lastRating === 'hard' ||
        state.priorityFlag;
    })
    .map(([cardId]) => cardId);
}
