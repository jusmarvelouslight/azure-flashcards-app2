// Core type definitions for Flashcard Coach

export type Rating = 'again' | 'hard' | 'good' | 'easy';
export type CardType = 'definition' | 'compare' | 'scenario';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  note?: string;
  example?: string;
  domainId: string;
  topic: string;
  cardType: CardType;
  confusableWith?: string[];
  mnemonic?: string;
  referenceUrl: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface Domain {
  id: string;
  name: string;
  weightMin: number;
  weightMax: number;
  description: string;
  topics: Topic[];
}

export interface CertificationConfig {
  id: string;
  name: string;
  fullName: string;
  domains: Domain[];
  studyGuideUrl: string;
}

export interface CardReviewState {
  cardId: string;
  intervalDays: number;
  successStreak: number;
  lapses: number;
  reviewCount: number;
  successfulReviews: number;
  lastRating: Rating | null;
  lastReviewedAt: string | null;
  dueAt: string;
  priorityFlag: boolean;
}

export interface ReviewEvent {
  id: string;
  cardId: string;
  rating: Rating;
  timestamp: string;
  domainId: string;
  topic: string;
}

export interface UserPreferences {
  dailyReviewTarget: number;
  examDate: string | null;
  theme: 'light';
  demoMode: boolean;
}

export interface SessionSummary {
  totalReviewed: number;
  ratings: Record<Rating, number>;
  topicsReviewed: string[];
  weakTopics: string[];
  nextReviewAt: string | null;
}

export interface AppState {
  cards: Flashcard[];
  reviewStates: Record<string, CardReviewState>;
  reviewHistory: ReviewEvent[];
  preferences: UserPreferences;
  initialized: boolean;
}

export interface StoreData {
  version: number;
  state: AppState;
}
