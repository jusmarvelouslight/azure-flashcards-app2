import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, BookOpen, Filter, Play, RotateCcw } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { AZ900_CONFIG } from '../data/certification';
import { getDomainStats } from '../lib/analytics';
import { getCardReviewState, isCardDueToday } from '../lib/storage';
import { getDifficultCardIds } from '../lib/scheduling';
import { Flashcard } from '../types';

export default function StudyDecks() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDomain = searchParams.get('domain') || '';

  const [domainFilter, setDomainFilter] = useState(initialDomain);
  const [topicFilter, setTopicFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showAllCards, setShowAllCards] = useState(false);
  const now = new Date();

  const difficultIds = useMemo(() => getDifficultCardIds(state.reviewStates), [state.reviewStates]);

  const filteredCards = useMemo(() => {
    let cards = state.cards;
    if (domainFilter) cards = cards.filter(c => c.domainId === domainFilter);
    if (topicFilter) cards = cards.filter(c => c.topic === topicFilter);
    if (search) {
      const q = search.toLowerCase();
      cards = cards.filter(c =>
        c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q)
      );
    }
    return cards;
  }, [state.cards, domainFilter, topicFilter, search]);

  const dueCards = useMemo(() => {
    return state.cards.filter(card => {
      const rs = getCardReviewState(state, card.id);
      return isCardDueToday(rs, now);
    });
  }, [state, now]);

  const difficultCards = useMemo(() => {
    return state.cards.filter(c => difficultIds.includes(c.id));
  }, [state.cards, difficultIds]);

  const topics = useMemo(() => {
    if (!domainFilter) return [];
    const domain = AZ900_CONFIG.domains.find(d => d.id === domainFilter);
    return domain?.topics || [];
  }, [domainFilter]);

  const startSession = (cards: Flashcard[], mode: string) => {
    if (cards.length === 0) return;
    const ids = cards.map(c => c.id).join(',');
    navigate(`/study?cards=${ids}&mode=${mode}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Study Decks</h1>
        <p className="text-sm text-slate-500 mt-1">Choose a domain to study or browse all cards.</p>
      </div>

      {/* Domain cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AZ900_CONFIG.domains.map(domain => {
          const stats = getDomainStats(state, domain.id);
          return (
            <div
              key={domain.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-slate-800">{domain.name}</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {domain.weightMin}–{domain.weightMax}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">{domain.description}</p>
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="font-bold text-slate-800">{stats.totalCards}</p>
                  <p className="text-slate-500">Total cards</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-2 text-center">
                  <p className="font-bold text-indigo-700">{stats.dueCount}</p>
                  <p className="text-slate-500">Due today</p>
                </div>
              </div>
              {stats.accuracy !== null && (
                <p className="text-xs text-slate-500 mb-3">
                  Recall: <span className="font-medium text-slate-700">{Math.round(stats.accuracy * 100)}%</span> ({stats.reviewCount} reviews)
                </p>
              )}
              <button
                onClick={() => startSession(
                  state.cards.filter(c => c.domainId === domain.id),
                  'domain'
                )}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Play size={14} /> Study this domain
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => startSession(dueCards, 'due')}
          disabled={dueCards.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <RotateCcw size={14} /> Study due cards ({dueCards.length})
        </button>
        <button
          onClick={() => startSession(difficultCards, 'difficult')}
          disabled={difficultCards.length === 0}
          className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <BookOpen size={14} /> Review difficult ({difficultCards.length})
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-slate-500" />
          <h2 className="font-semibold text-slate-700 text-sm">Browse Cards</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions and answers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={domainFilter}
            onChange={e => { setDomainFilter(e.target.value); setTopicFilter(''); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All domains</option>
            {AZ900_CONFIG.domains.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {topics.length > 0 && (
            <select
              value={topicFilter}
              onChange={e => setTopicFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All topics</option>
              {topics.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">{filteredCards.length} cards found</p>
      </div>

      {/* Card list */}
      {showAllCards || filteredCards.length <= 10 ? (
        <div className="space-y-2">
          {filteredCards.map(card => (
            <div key={card.id} className="bg-white border border-slate-200 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-800">{card.front}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded capitalize">{card.cardType}</span>
                <span className="text-[10px] text-slate-400 capitalize">{card.topic.replace(/-/g, ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <button
            onClick={() => setShowAllCards(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Show all {filteredCards.length} cards
          </button>
        </div>
      )}
    </div>
  );
}
