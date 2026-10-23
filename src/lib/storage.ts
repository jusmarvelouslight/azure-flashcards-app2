import { AppState, StoreData, UserPreferences, CardReviewState, ReviewEvent, Rating } from '../types';
import { SEED_CARDS } from '../data/cards';

const STORAGE_KEY = 'flashcard-coach-v1';
const DEMO_STORAGE_KEY = 'flashcard-coach-demo-v1';

export function getDefaultPreferences(): UserPreferences {
  return {
    dailyReviewTarget: 20,
    examDate: null,
    theme: 'light',
    demoMode: false,
  };
}

export function getDefaultState(): AppState {
  return {
    cards: SEED_CARDS,
    reviewStates: {},
    reviewHistory: [],
    preferences: getDefaultPreferences(),
    initialized: true,
  };
}

function getStorageKey(demo: boolean): string {
  return demo ? DEMO_STORAGE_KEY : STORAGE_KEY;
}

export function loadState(demo: boolean = false): AppState {
  try {
    const raw = localStorage.getItem(getStorageKey(demo));
    if (!raw) {
      if (!demo) return getDefaultState();
      return { ...getDefaultState(), cards: [], reviewStates: {}, reviewHistory: [] };
    }
    const data: StoreData = JSON.parse(raw);
    if (data.version !== 1) {
      // Migration: for now just return default
      return getDefaultState();
    }
    return data.state;
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: AppState, demo: boolean = false): boolean {
  try {
    const data: StoreData = { version: 1, state };
    localStorage.setItem(getStorageKey(demo), JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function getCardReviewState(state: AppState, cardId: string): CardReviewState {
  if (state.reviewStates[cardId]) return state.reviewStates[cardId];
  return {
    cardId,
    intervalDays: 0,
    successStreak: 0,
    lapses: 0,
    reviewCount: 0,
    successfulReviews: 0,
    lastRating: null,
    lastReviewedAt: null,
    dueAt: new Date().toISOString(),
    priorityFlag: false,
  };
}

export function isCardDue(reviewState: CardReviewState, now: Date): boolean {
  return new Date(reviewState.dueAt) <= now;
}

export function isCardDueToday(reviewState: CardReviewState, now: Date): boolean {
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  return new Date(reviewState.dueAt) <= endOfDay;
}

export function addReviewEvent(
  state: AppState,
  cardId: string,
  rating: Rating,
  domainId: string,
  topic: string
): ReviewEvent {
  const event: ReviewEvent = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    cardId,
    rating,
    timestamp: new Date().toISOString(),
    domainId,
    topic,
  };
  return event;
}

export function resetProgress(): AppState {
  const state = getDefaultState();
  saveState(state, false);
  return state;
}

export function isStorageAvailable(): boolean {
  try {
    localStorage.setItem('__test__', '1');
    localStorage.removeItem('__test__');
    return true;
  } catch {
    return false;
  }
}
