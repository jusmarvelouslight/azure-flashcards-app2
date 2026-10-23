import { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { AppState, Rating, ReviewEvent, CardReviewState, UserPreferences } from '../types';
import { loadState, saveState, getCardReviewState, addReviewEvent, resetProgress as resetStore, getDefaultState } from '../lib/storage';
import { calculateNextState, capDueToExamDate } from '../lib/scheduling';
import { generateDemoState } from '../lib/demo';

type Action =
  | { type: 'RATE_CARD'; cardId: string; rating: Rating }
  | { type: 'SET_PREFERENCES'; preferences: Partial<UserPreferences> }
  | { type: 'TOGGLE_DEMO_MODE'; enabled: boolean }
  | { type: 'RESET_PROGRESS' }
  | { type: 'LOAD_STATE'; state: AppState };

interface StoreContextType {
  state: AppState;
  rateCard: (cardId: string, rating: Rating) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  toggleDemoMode: (enabled: boolean) => void;
  resetProgress: () => void;
  getReviewState: (cardId: string) => CardReviewState;
  isDemoMode: boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'RATE_CARD': {
      const card = state.cards.find(c => c.id === action.cardId);
      if (!card) return state;

      const currentState = getReviewState(state, action.cardId);
      const now = new Date();
      let newState = calculateNextState(currentState, action.rating, now);

      // Apply exam date cap
      if (state.preferences.examDate) {
        newState.dueAt = capDueToExamDate(newState.dueAt, state.preferences.examDate);
      }

      const event = addReviewEvent(state, action.cardId, action.rating, card.domainId, card.topic);

      return {
        ...state,
        reviewStates: { ...state.reviewStates, [action.cardId]: newState },
        reviewHistory: [...state.reviewHistory, event],
      };
    }

    case 'SET_PREFERENCES': {
      return {
        ...state,
        preferences: { ...state.preferences, ...action.preferences },
      };
    }

    case 'TOGGLE_DEMO_MODE': {
      if (action.enabled) {
        const demoState = generateDemoState();
        saveState(demoState, true);
        return { ...demoState, preferences: { ...state.preferences, demoMode: true } };
      } else {
        return { ...state, preferences: { ...state.preferences, demoMode: false } };
      }
    }

    case 'RESET_PROGRESS': {
      const fresh = getDefaultState();
      fresh.preferences = state.preferences; // Keep preferences
      saveState(fresh, false);
      return fresh;
    }

    case 'LOAD_STATE': {
      return action.state;
    }

    default:
      return state;
  }
}

function getReviewState(state: AppState, cardId: string): CardReviewState {
  return getCardReviewState(state, cardId);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () => loadState(false));

  useEffect(() => {
    if (!state.preferences.demoMode) {
      saveState(state, false);
    }
  }, [state]);

  const rateCard = useCallback((cardId: string, rating: Rating) => {
    dispatch({ type: 'RATE_CARD', cardId, rating });
  }, []);

  const setPreferences = useCallback((prefs: Partial<UserPreferences>) => {
    dispatch({ type: 'SET_PREFERENCES', preferences: prefs });
  }, []);

  const toggleDemoMode = useCallback((enabled: boolean) => {
    dispatch({ type: 'TOGGLE_DEMO_MODE', enabled });
  }, []);

  const resetProgress = useCallback(() => {
    dispatch({ type: 'RESET_PROGRESS' });
  }, []);

  const isDemoMode = state.preferences.demoMode;

  return (
    <StoreContext.Provider value={{
      state,
      rateCard,
      setPreferences,
      toggleDemoMode,
      resetProgress,
      getReviewState: (cardId: string) => getReviewState(state, cardId),
      isDemoMode,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
