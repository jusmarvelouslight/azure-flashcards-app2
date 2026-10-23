import { useNavigate } from 'react-router-dom';
import { BookOpen, Brain, Target, Flame, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { AZ900_CONFIG } from '../data/certification';
import { calculateRecallAccuracy, calculateStreak, countDueToday, getDomainStats, calculateTopicWeakness } from '../lib/analytics';
import { getCardReviewState, isCardDueToday } from '../lib/storage';

export default function Dashboard() {
  const { state } = useStore();
  const navigate = useNavigate();
  const now = new Date();

  const hasReviews = state.reviewHistory.length > 0;
  const totalReviewed = state.reviewHistory.length;
  const recallAccuracy = calculateRecallAccuracy(state.reviewHistory);
  const streak = calculateStreak(state.reviewHistory, now);
  const dueToday = countDueToday(state, now);
  const topicWeakness = calculateTopicWeakness(state.reviewHistory);

  // Get next review preview
  const upcomingCards = state.cards
    .map(card => ({ card, state: getCardReviewState(state, card.id) }))
    .filter(({ state: rs }) => isCardDueToday(rs, now))
    .slice(0, 3);

  // Recent activity
  const recentActivity = [...state.reviewHistory].reverse().slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 lg:p-8 text-white shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome back 👋</h1>
        <p className="text-indigo-100 text-sm lg:text-base mb-4">
          {hasReviews
            ? `You've reviewed ${totalReviewed} cards so far. Keep building that cloud knowledge!`
            : 'Start your AZ-900 journey with active recall. Review cards to build lasting knowledge.'}
        </p>
        <button
          onClick={() => navigate('/decks')}
          className="bg-white text-indigo-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm text-sm"
        >
          Start today's review
        </button>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <MetricCard
          icon={<Clock size={18} className="text-indigo-600" />}
          label="Cards due today"
          value={dueToday.toString()}
          color="indigo"
        />
        <MetricCard
          icon={<BookOpen size={18} className="text-emerald-600" />}
          label="Total reviewed"
          value={totalReviewed.toString()}
          color="emerald"
        />
        <MetricCard
          icon={<Target size={18} className="text-amber-600" />}
          label="Recall accuracy"
          value={hasReviews ? `${Math.round(recallAccuracy * 100)}%` : '—'}
          subtitle={hasReviews ? 'Self-reported indicator' : undefined}
          color="amber"
        />
        <MetricCard
          icon={<Flame size={18} className="text-orange-600" />}
          label="Study streak"
          value={`${streak.current} day${streak.current !== 1 ? 's' : ''}`}
          subtitle={streak.longest > 1 ? `Best: ${streak.longest} days` : undefined}
          color="orange"
        />
      </div>

      {/* Domain progress */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">AZ-900 Domains</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
          {AZ900_CONFIG.domains.map(domain => {
            const stats = getDomainStats(state, domain.id);
            return (
              <button
                key={domain.id}
                onClick={() => navigate(`/decks?domain=${domain.id}`)}
                className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-800 text-sm">{domain.name}</h3>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 mb-3">{domain.weightMin}–{domain.weightMax}% of exam</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{stats.totalCards} cards</span>
                  <span className="text-indigo-600 font-medium">{stats.dueCount} due</span>
                </div>
                {stats.accuracy !== null && (
                  <div className="mt-2">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <TrendingUp size={12} />
                      <span>{Math.round(stats.accuracy * 100)}% recall</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weak topics */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={18} className="text-rose-500" />
            <h2 className="font-semibold text-slate-800 text-sm">Topics Needing Attention</h2>
          </div>
          {topicWeakness.size > 0 ? (
            <div className="space-y-2">
              {Array.from(topicWeakness.entries())
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([topic, score]) => (
                  <div key={topic} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-slate-700 capitalize">{topic.replace(/-/g, ' ')}</span>
                    <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      {Math.round(score * 100)}% difficulty
                    </span>
                  </div>
                ))}
              <button
                onClick={() => navigate('/review')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-2"
              >
                View all weak areas →
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              {hasReviews ? 'Keep studying to identify your weak areas.' : 'Start reviewing cards to discover which topics need attention.'}
            </p>
          )}
        </div>

        {/* Next review preview */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-3">Up Next</h2>
          {upcomingCards.length > 0 ? (
            <div className="space-y-2">
              {upcomingCards.map(({ card }) => (
                <div key={card.id} className="flex items-start gap-2 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <p className="text-sm text-slate-700 line-clamp-2">{card.front}</p>
                </div>
              ))}
              <button
                onClick={() => navigate('/decks')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-2"
              >
                Start studying →
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              {hasReviews ? 'No cards due right now. Great job!' : 'Start your first study session to begin tracking.'}
            </p>
          )}
        </div>
      </div>

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {recentActivity.map(event => {
              const card = state.cards.find(c => c.id === event.cardId);
              return (
                <div key={event.id} className="flex items-center gap-3 py-1.5">
                  <RatingBadge rating={event.rating} />
                  <span className="text-sm text-slate-700 flex-1 truncate">
                    {card?.front || 'Unknown card'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatTimeAgo(event.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Onboarding for new users */}
      {!hasReviews && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
          <h2 className="font-semibold text-indigo-800 mb-2">How to get started</h2>
          <ol className="text-sm text-indigo-700 space-y-2 list-decimal list-inside">
            <li>Open <strong>Study Decks</strong> to browse the AZ-900 curriculum.</li>
            <li>Choose a domain and start a study session.</li>
            <li>Read each card, try to recall the answer, then flip to check.</li>
            <li>Rate your recall: Again, Hard, Good, or Easy.</li>
            <li>Track your progress on the Dashboard and Progress pages.</li>
          </ol>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, subtitle, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  color: string;
}) {
  const bgColors: Record<string, string> = {
    indigo: 'bg-indigo-50',
    emerald: 'bg-emerald-50',
    amber: 'bg-amber-50',
    orange: 'bg-orange-50',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className={`${bgColors[color]} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function RatingBadge({ rating }: { rating: string }) {
  const colors: Record<string, string> = {
    again: 'bg-rose-100 text-rose-700',
    hard: 'bg-amber-100 text-amber-700',
    good: 'bg-emerald-100 text-emerald-700',
    easy: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${colors[rating] || 'bg-slate-100'}`}>
      {rating.toUpperCase()}
    </span>
  );
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diff = now.getTime() - then.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
