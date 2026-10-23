import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, AlertTriangle, BookOpen, ExternalLink } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { Rating, Flashcard, SessionSummary } from '../types';
import { getCardReviewState } from '../lib/storage';
import { isLeech } from '../lib/scheduling';

export default function StudySession() {
  const { state, rateCard, getReviewState } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const cardIds = useMemo(() => {
    const ids = searchParams.get('cards');
    return ids ? ids.split(',') : [];
  }, [searchParams]);

  const cards = useMemo(() => {
    return cardIds.map(id => state.cards.find(c => c.id === id)).filter(Boolean) as Flashcard[];
  }, [cardIds, state.cards]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratedCards, setRatedCards] = useState<Set<string>>(new Set());
  const [sessionRatings, setSessionRatings] = useState<Record<Rating, number>>({ again: 0, hard: 0, good: 0, easy: 0 });
  const [queue, setQueue] = useState<number[]>(() => cards.map((_, i) => i));
  const [queuePos, setQueuePos] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [ratingLocked, setRatingLocked] = useState(false);
  const [topicsReviewed, setTopicsReviewed] = useState<Set<string>>(new Set());

  const currentCard = cards[queue[queuePos]] || null;
  const totalCards = cards.length;
  const progress = queuePos + 1;

  const handleRate = useCallback((rating: Rating) => {
    if (!currentCard || ratingLocked) return;
    setRatingLocked(true);

    rateCard(currentCard.id, rating);
    setRatedCards(prev => new Set(prev).add(currentCard.id));
    setSessionRatings(prev => ({ ...prev, [rating]: prev[rating] + 1 }));
    setTopicsReviewed(prev => new Set(prev).add(currentCard.topic));

    // If "again", re-queue after at least 3 cards
    if (rating === 'again') {
      const insertAt = Math.min(queuePos + 4, queue.length);
      const newQueue = [...queue];
      newQueue.splice(insertAt, 0, queue[queuePos]);
      setQueue(newQueue);
    }

    // Auto-advance after short delay
    setTimeout(() => {
      if (queuePos < queue.length - 1) {
        setQueuePos(prev => prev + 1);
        setIsFlipped(false);
        setRatingLocked(false);
      } else {
        setIsComplete(true);
      }
    }, 600);
  }, [currentCard, ratingLocked, queuePos, queue, rateCard]);

  const goNext = useCallback(() => {
    if (queuePos < queue.length - 1) {
      setQueuePos(prev => prev + 1);
      setIsFlipped(false);
      setRatingLocked(false);
    }
  }, [queuePos, queue.length]);

  const goPrev = useCallback(() => {
    if (queuePos > 0) {
      setQueuePos(prev => prev - 1);
      setIsFlipped(false);
      setRatingLocked(false);
    }
  }, [queuePos]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isComplete) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isFlipped) setIsFlipped(true);
      }
      if (isFlipped && !ratingLocked) {
        if (e.key === '1') handleRate('again');
        if (e.key === '2') handleRate('hard');
        if (e.key === '3') handleRate('good');
        if (e.key === '4') handleRate('easy');
      }
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') setShowExitConfirm(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFlipped, ratingLocked, queuePos, isComplete, handleRate, goNext, goPrev]);

  // Session summary
  const totalReviewed = Object.values(sessionRatings).reduce((a, b) => a + b, 0);
  const recallScore = totalReviewed > 0
    ? (sessionRatings.good + sessionRatings.easy) / totalReviewed
    : 0;

  if (cards.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <BookOpen size={48} className="text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">No cards to study</h2>
        <p className="text-sm text-slate-500 mb-4">Select a deck from Study Decks to begin.</p>
        <button
          onClick={() => navigate('/decks')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          Browse decks
        </button>
      </div>
    );
  }

  if (isComplete) {
    const weakTopics = Array.from(topicsReviewed).filter(topic => {
      const topicEvents = state.reviewHistory.filter(e => e.topic === topic).slice(-10);
      const againCount = topicEvents.filter(e => e.rating === 'again').length;
      return againCount >= 2;
    });

    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="text-center mb-6">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-800">Session Complete!</h2>
            <p className="text-sm text-slate-500 mt-1">Great work on this review session.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-slate-800">{totalReviewed}</p>
              <p className="text-xs text-slate-500">Cards reviewed</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-indigo-700">{Math.round(recallScore * 100)}%</p>
              <p className="text-xs text-slate-500">Session recall</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">Rating distribution:</p>
            <div className="flex gap-2">
              {(['again', 'hard', 'good', 'easy'] as Rating[]).map(r => (
                <div key={r} className={`flex-1 text-center py-1.5 rounded text-xs font-medium ${
                  r === 'again' ? 'bg-rose-50 text-rose-700' :
                  r === 'hard' ? 'bg-amber-50 text-amber-700' :
                  r === 'good' ? 'bg-emerald-50 text-emerald-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  <p className="font-bold">{sessionRatings[r]}</p>
                  <p className="capitalize">{r}</p>
                </div>
              ))}
            </div>
          </div>

          {weakTopics.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 rounded-lg">
              <p className="text-xs font-medium text-amber-800 mb-1">Topics to revisit:</p>
              <p className="text-xs text-amber-700">{weakTopics.map(t => t.replace(/-/g, ' ')).join(', ')}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/review')}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              Review difficult cards
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cardState = currentCard ? getReviewState(currentCard.id) : null;
  const isPreviouslyRated = currentCard ? ratedCards.has(currentCard.id) : false;
  const showLeechPanel = cardState && isLeech(cardState);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
          aria-label="Exit session"
        >
          <X size={20} />
        </button>
        <div className="text-sm text-slate-600 font-medium">
          {progress} / {queue.length}
        </div>
        <div className="w-9" />
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-200 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
          style={{ width: `${(progress / queue.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      {currentCard && (
        <div className="perspective-1000 mb-6">
          <div
            className={`relative w-full min-h-[320px] transition-transform duration-500 transform-style-3d cursor-pointer ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            onClick={() => !isFlipped && setIsFlipped(true)}
            role="button"
            tabIndex={0}
            aria-label={isFlipped ? 'Card showing answer' : 'Click to reveal answer'}
          >
            {/* Front */}
            <div className={`absolute inset-0 backface-hidden bg-white border-2 ${
              isFlipped ? 'border-slate-200' : 'border-indigo-200'
            } rounded-2xl p-6 flex flex-col justify-center items-center shadow-sm`}>
              <span className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold mb-3">Question</span>
              <p className="text-lg text-slate-800 text-center font-medium leading-relaxed">
                {currentCard.front}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded capitalize">{currentCard.cardType}</span>
                <span className="text-[10px] text-slate-400 capitalize">{currentCard.topic.replace(/-/g, ' ')}</span>
              </div>
              {!isFlipped && (
                <p className="text-xs text-slate-400 mt-4">Tap or press Space to reveal</p>
              )}
            </div>

            {/* Back */}
            <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-white border-2 border-emerald-200 rounded-2xl p-6 flex flex-col shadow-sm overflow-y-auto`}>
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold mb-2">Answer</span>
              <p className="text-base text-slate-800 font-medium leading-relaxed mb-3">
                {currentCard.back}
              </p>
              {currentCard.note && (
                <div className="bg-slate-50 rounded-lg p-3 mb-2">
                  <p className="text-xs text-slate-600"><strong>Note:</strong> {currentCard.note}</p>
                </div>
              )}
              {currentCard.example && (
                <div className="bg-indigo-50 rounded-lg p-3 mb-2">
                  <p className="text-xs text-indigo-700"><strong>Example:</strong> {currentCard.example}</p>
                </div>
              )}
              {currentCard.mnemonic && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 mt-auto">
                  💡 {currentCard.mnemonic}
                </p>
              )}
              <a
                href={currentCard.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-indigo-500 hover:text-indigo-700 mt-2 flex items-center gap-1"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink size={10} /> Microsoft Learn reference
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Leech panel */}
      {showLeechPanel && isFlipped && currentCard && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">Rethink this card</span>
          </div>
          <p className="text-xs text-amber-700">
            This card has been missed {cardState!.lapses} times. Take extra time to understand it.
          </p>
          {currentCard.mnemonic && (
            <p className="text-xs text-amber-700 mt-1">💡 Mnemonic: {currentCard.mnemonic}</p>
          )}
          {currentCard.confusableWith && currentCard.confusableWith.length > 0 && (
            <p className="text-xs text-amber-700 mt-1">
              Related cards to review: {currentCard.confusableWith.length} confusable pair(s)
            </p>
          )}
        </div>
      )}

      {/* Rating buttons */}
      {isFlipped && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {isPreviouslyRated ? (
            <div className="col-span-4 text-center py-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500">Already rated in this session</p>
            </div>
          ) : (
            <>
              <button
                onClick={() => handleRate('again')}
                disabled={ratingLocked}
                className="bg-rose-50 hover:bg-rose-100 disabled:opacity-50 border border-rose-200 text-rose-700 text-sm font-medium py-3 rounded-xl transition-colors"
                aria-label="Rate: Again - I could not recall it"
              >
                <span className="block text-xs opacity-70">1</span>
                Again
              </button>
              <button
                onClick={() => handleRate('hard')}
                disabled={ratingLocked}
                className="bg-amber-50 hover:bg-amber-100 disabled:opacity-50 border border-amber-200 text-amber-700 text-sm font-medium py-3 rounded-xl transition-colors"
                aria-label="Rate: Hard - I recalled with difficulty"
              >
                <span className="block text-xs opacity-70">2</span>
                Hard
              </button>
              <button
                onClick={() => handleRate('good')}
                disabled={ratingLocked}
                className="bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 border border-emerald-200 text-emerald-700 text-sm font-medium py-3 rounded-xl transition-colors"
                aria-label="Rate: Good - I recalled correctly"
              >
                <span className="block text-xs opacity-70">3</span>
                Good
              </button>
              <button
                onClick={() => handleRate('easy')}
                disabled={ratingLocked}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-700 text-sm font-medium py-3 rounded-xl transition-colors"
                aria-label="Rate: Easy - I knew it confidently"
              >
                <span className="block text-xs opacity-70">4</span>
                Easy
              </button>
            </>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={queuePos === 0}
          className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 disabled:text-slate-300 disabled:cursor-not-allowed px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <button
          onClick={goNext}
          disabled={queuePos >= queue.length - 1}
          className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 disabled:text-slate-300 disabled:cursor-not-allowed px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Exit confirmation modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Exit session?</h3>
            <p className="text-sm text-slate-500 mb-4">
              Your progress so far ({totalReviewed} cards rated) has been saved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2.5 rounded-lg"
              >
                Continue studying
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2.5 rounded-lg"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
