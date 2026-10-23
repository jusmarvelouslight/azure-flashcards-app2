import { useMemo } from 'react';
import { BarChart3, TrendingUp, Flame, Calendar } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { calculateRecallAccuracy, calculateStreak, getWeeklyActivity, getUniqueStudyDays, getRatingsDistribution, getDomainStats } from '../lib/analytics';
import { AZ900_CONFIG } from '../data/certification';

export default function Progress() {
  const { state } = useStore();
  const now = new Date();

  const hasReviews = state.reviewHistory.length > 0;
  const totalReviewed = state.reviewHistory.length;
  const recallAccuracy = calculateRecallAccuracy(state.reviewHistory);
  const streak = calculateStreak(state.reviewHistory, now);
  const weeklyActivity = useMemo(() => getWeeklyActivity(state.reviewHistory, now), [state.reviewHistory]);
  const uniqueDays = getUniqueStudyDays(state.reviewHistory);
  const ratings = getRatingsDistribution(state.reviewHistory);
  const hasChartData = uniqueDays >= 3;

  const maxWeekly = Math.max(...weeklyActivity.map(d => d.count), 1);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Progress</h1>
        <p className="text-sm text-slate-500 mt-1">Track your learning journey.</p>
      </div>

      {!hasReviews && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <BarChart3 size={40} className="text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-slate-700 mb-2">No progress yet</h2>
          <p className="text-sm text-slate-500">Start studying to see your progress here.</p>
        </div>
      )}

      {hasReviews && (
        <>
          {/* Overview metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-slate-800">{totalReviewed}</p>
              <p className="text-xs text-slate-500">Total reviews</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-indigo-700">{Math.round(recallAccuracy * 100)}%</p>
              <p className="text-xs text-slate-500">Recall accuracy</p>
              <p className="text-[10px] text-slate-400">Self-reported indicator</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-1">
                <Flame size={16} className="text-orange-500" />
                <p className="text-2xl font-bold text-slate-800">{streak.current}</p>
              </div>
              <p className="text-xs text-slate-500">Current streak (days)</p>
              {streak.longest > 1 && <p className="text-[10px] text-slate-400">Best: {streak.longest} days</p>}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-slate-800">{uniqueDays}</p>
              <p className="text-xs text-slate-500">Study days</p>
            </div>
          </div>

          {/* Weekly activity chart */}
          {hasChartData && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-slate-500" />
                <h2 className="font-semibold text-slate-800 text-sm">Last 7 Days</h2>
              </div>
              <div className="flex items-end gap-2 h-32">
                {weeklyActivity.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col justify-end h-24">
                      <div
                        className="w-full bg-indigo-500 rounded-t-sm transition-all"
                        style={{ height: `${(day.count / maxWeekly) * 100}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(day.date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)}
                    </span>
                    <span className="text-[10px] font-medium text-slate-700">{day.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ratings distribution */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-800 text-sm mb-3">Rating Distribution</h2>
            <div className="grid grid-cols-4 gap-3">
              {(['again', 'hard', 'good', 'easy'] as const).map(r => {
                const count = ratings[r];
                const pct = totalReviewed > 0 ? (count / totalReviewed) * 100 : 0;
                const colors: Record<string, string> = {
                  again: 'bg-rose-500',
                  hard: 'bg-amber-500',
                  good: 'bg-emerald-500',
                  easy: 'bg-blue-500',
                };
                return (
                  <div key={r} className="text-center">
                    <div className="h-2 bg-slate-100 rounded-full mb-2 overflow-hidden">
                      <div className={`h-full ${colors[r]} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-lg font-bold text-slate-800">{count}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{r}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Domain performance */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-slate-500" />
              <h2 className="font-semibold text-slate-800 text-sm">Domain Performance</h2>
            </div>
            <div className="space-y-3">
              {AZ900_CONFIG.domains.map(domain => {
                const stats = getDomainStats(state, domain.id);
                return (
                  <div key={domain.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{domain.name}</p>
                      <p className="text-xs text-slate-500">{stats.reviewCount} reviews</p>
                    </div>
                    <div className="w-32">
                      {stats.accuracy !== null ? (
                        <div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${stats.accuracy * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{Math.round(stats.accuracy * 100)}% recall</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">Not enough data</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-slate-400 text-center">
            Recall accuracy is a self-reported indicator based on your ratings. It is not an exam pass probability.
          </p>
        </>
      )}
    </div>
  );
}
