import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, AlertTriangle, BookOpen, CheckCircle } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { calculateTopicWeakness } from '../lib/analytics';
import { getCardReviewState, isCardDueToday } from '../lib/storage';
import { isLeech, getDifficultCardIds } from '../lib/scheduling';

export default function WeakAreas() {
  const { state } = useStore();
  const navigate = useNavigate();
  const now = new Date();

  const topicWeakness = useMemo(() => calculateTopicWeakness(state.reviewHistory), [state.reviewHistory]);
  const difficultIds = useMemo(() => getDifficultCardIds(state.reviewStates), [state.reviewStates]);

  const leechCards = useMemo(() => {
    return state.cards.filter(card => {
      const rs = getCardReviewState(state, card.id);
      return isLeech(rs);
    });
  }, [state]);

  const dueCards = useMemo(() => {
    return state.cards.filter(card => {
      const rs = getCardReviewState(state, card.id);
      return isCardDueToday(rs, now);
    });
  }, [state, now]);

  const difficultCards = useMemo(() => {
    return state.cards.filter(c => difficultIds.includes(c.id));
  }, [state.cards, difficultIds]);

  const hasWeakAreas = topicWeakness.size > 0 || leechCards.length > 0;
  const hasReviews = state.reviewHistory.length > 0;

  const startReview = (cards: typeof state.cards) => {
    if (cards.length === 0) return;
    const ids = cards.map(c => c.id).join(',');
    navigate(`/study?cards=${ids}&mode=weak`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Weak Areas</h1>
        <p className="text-sm text-slate-500 mt-1">Topics and cards that need extra attention.</p>
      </div>

      {!hasReviews && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <Brain size={40} className="text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-slate-700 mb-2">No data yet</h2>
          <p className="text-sm text-slate-500 mb-4">Start studying to identify your weak areas.</p>
          <button
            onClick={() => navigate('/decks')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Start studying
          </button>
        </div>
      )}

      {hasReviews && !hasWeakAreas && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
          <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2" />
          <h2 className="text-lg font-semibold text-emerald-800 mb-1">Looking good!</h2>
          <p className="text-sm text-emerald-700">Keep studying to identify your weak areas.</p>
        </div>
      )}

      {/* Weak topics */}
      {topicWeakness.size > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-500" />
            Topics Needing Attention
          </h2>
          <div className="space-y-2">
            {Array.from(topicWeakness.entries())
              .sort(([, a], [, b]) => b - a)
              .map(([topic, score]) => {
                const topicCards = state.cards.filter(c => c.topic === topic);
                return (
                  <div key={topic} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-800 capitalize">{topic.replace(/-/g, ' ')}</p>
                      <p className="text-xs text-slate-500">{topicCards.length} cards in topic</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-rose-600">
                        {Math.round(score * 100)}% difficulty
                      </span>
                      <button
                        onClick={() => startReview(topicCards)}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium"
                      >
                        Revise
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Leech cards */}
      {leechCards.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            Repeatedly Missed Cards ({leechCards.length})
          </h2>
          <p className="text-xs text-slate-500 mb-3">These cards have been missed 3+ times. Take extra time with them.</p>
          <div className="space-y-2">
            {leechCards.slice(0, 10).map(card => {
              const rs = getCardReviewState(state, card.id);
              return (
                <div key={card.id} className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-sm font-medium text-slate-800">{card.front}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-amber-700">{rs.lapses} lapses</span>
                    {card.mnemonic && <span className="text-[10px] text-amber-600">💡 {card.mnemonic}</span>}
                    {card.confusableWith && card.confusableWith.length > 0 && (
                      <span className="text-[10px] text-slate-500">Has confusable pairs</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => startReview(leechCards)}
            className="mt-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5"
          >
            <BookOpen size={14} /> Review these cards
          </button>
        </div>
      )}

      {/* Due cards */}
      {dueCards.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-500" />
            Cards Due Today ({dueCards.length})
          </h2>
          <button
            onClick={() => startReview(dueCards)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5"
          >
            <BookOpen size={14} /> Study due cards
          </button>
        </div>
      )}

      {/* Difficult cards */}
      {difficultCards.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Brain size={18} className="text-purple-500" />
            Difficult Cards ({difficultCards.length})
          </h2>
          <p className="text-xs text-slate-500 mb-3">Cards with multiple lapses, recent Hard/Again ratings, or priority flags.</p>
          <button
            onClick={() => startReview(difficultCards)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5"
          >
            <BookOpen size={14} /> Review difficult cards
          </button>
        </div>
      )}
    </div>
  );
}
