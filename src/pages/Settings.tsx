import { useState } from 'react';
import { Settings as SettingsIcon, AlertTriangle, ExternalLink, Info, RefreshCw } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { AZ900_CONFIG } from '../data/certification';

export default function Settings() {
  const { state, setPreferences, toggleDemoMode, resetProgress } = useStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExamDateChange = (value: string) => {
    setPreferences({ examDate: value || null });
    handleSave();
  };

  const handleDailyTargetChange = (value: number) => {
    setPreferences({ dailyReviewTarget: Math.max(1, Math.min(100, value)) });
    handleSave();
  };

  const handleDemoToggle = (enabled: boolean) => {
    toggleDemoMode(enabled);
  };

  const handleReset = () => {
    resetProgress();
    setShowResetConfirm(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <SettingsIcon size={24} /> Settings
        </h1>
      </div>

      {/* Study preferences */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-slate-800">Study Preferences</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Daily review target
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={state.preferences.dailyReviewTarget}
            onChange={e => handleDailyTargetChange(parseInt(e.target.value) || 20)}
            className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-slate-500 mt-1">Cards per day you aim to review.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Exam date (optional)
          </label>
          <input
            type="date"
            value={state.preferences.examDate || ''}
            onChange={e => handleExamDateChange(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            If set, card due dates will be capped to the day before your exam.
          </p>
        </div>
      </div>

      {/* About spaced repetition */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Info size={16} className="text-indigo-500" />
          <h2 className="font-semibold text-slate-800">How Spaced Repetition Works</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Spaced repetition is a learning technique where you review information at increasing intervals.
          When you rate a card as "Easy," it appears again after a longer gap. When you rate it "Again,"
          it comes back sooner. This helps move knowledge from short-term to long-term memory efficiently.
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Note: This app uses a lightweight educational scheduling heuristic, not a clinically validated model.
        </p>
      </div>

      {/* Resources */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="font-semibold text-slate-800 mb-3">Resources</h2>
        <a
          href={AZ900_CONFIG.studyGuideUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <ExternalLink size={14} />
          Official AZ-900 Study Guide (Microsoft Learn)
        </a>
      </div>

      {/* Demo mode */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="font-semibold text-slate-800 mb-2">Demo Mode</h2>
        <p className="text-sm text-slate-600 mb-3">
          Load simulated progress data to preview the dashboard and analytics with populated metrics.
          Your real progress is never affected.
        </p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={state.preferences.demoMode}
            onChange={e => handleDemoToggle(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-700">Load sample progress (demo)</span>
        </label>
      </div>

      {/* Data & storage */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="font-semibold text-slate-800 mb-2">Data & Storage</h2>
        <p className="text-sm text-slate-600 mb-3">
          All your progress is saved locally in your browser. It is not synchronized across devices
          and will be lost if you clear your browser data.
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{state.reviewHistory.length} review events stored</span>
          <span>•</span>
          <span>{Object.keys(state.reviewStates).length} cards tracked</span>
        </div>
      </div>

      {/* Reset */}
      <div className="bg-white border border-rose-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw size={16} className="text-rose-500" />
          <h2 className="font-semibold text-rose-800">Reset Progress</h2>
        </div>
        <p className="text-sm text-slate-600 mb-3">
          This will permanently delete all your review history and card states. This cannot be undone.
        </p>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Reset all progress
          </button>
        ) : (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
            <p className="text-sm text-rose-800 mb-2">Are you sure? This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                Yes, reset everything
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-slate-600">
              Flashcard Coach is an independent learning project. It is unofficial and is not affiliated with or endorsed by Microsoft.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Card content is educational and should be reviewed against the current AZ-900 study guide.
              This app does not contain actual exam questions.
            </p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="fixed bottom-4 right-4 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg">
          Settings saved
        </div>
      )}
    </div>
  );
}
