import { AppState, ReviewEvent, CardReviewState, Rating } from '../types';
import { SEED_CARDS } from '../data/cards';
import { calculateNextState } from './scheduling';

/**
 * Generate simulated review history for demo mode.
 */
export function generateDemoState(): AppState {
  const cards = SEED_CARDS;
  const reviewStates: Record<string, CardReviewState> = {};
  const reviewHistory: ReviewEvent[] = [];
  const now = new Date();

  // Simulate 14 days of activity
  const ratings: Rating[] = ['again', 'hard', 'good', 'easy'];
  const ratingWeights = [0.15, 0.2, 0.45, 0.2]; // probability distribution

  cards.forEach((card, cardIndex) => {
    let state: CardReviewState = {
      cardId: card.id,
      intervalDays: 0,
      successStreak: 0,
      lapses: 0,
      reviewCount: 0,
      successfulReviews: 0,
      lastRating: null,
      lastReviewedAt: null,
      dueAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
      priorityFlag: false,
    };

    // Each card gets 2-6 reviews over the past 14 days
    const numReviews = 2 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numReviews; i++) {
      const daysAgo = Math.floor(Math.random() * 14);
      const reviewTime = new Date(now.getTime() - daysAgo * 86400000 - Math.random() * 86400000);

      // Weighted random rating
      const rand = Math.random();
      let cumulative = 0;
      let rating: Rating = 'good';
      for (let r = 0; r < ratings.length; r++) {
        cumulative += ratingWeights[r];
        if (rand < cumulative) {
          rating = ratings[r];
          break;
        }
      }

      state = calculateNextState(state, rating, reviewTime);

      const event: ReviewEvent = {
        id: `demo-${cardIndex}-${i}`,
        cardId: card.id,
        rating,
        timestamp: reviewTime.toISOString(),
        domainId: card.domainId,
        topic: card.topic,
      };
      reviewHistory.push(event);
    }

    reviewStates[card.id] = state;
  });

  // Sort history by timestamp
  reviewHistory.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return {
    cards,
    reviewStates,
    reviewHistory,
    preferences: {
      dailyReviewTarget: 20,
      examDate: null,
      theme: 'light',
      demoMode: true,
    },
    initialized: true,
  };
}
