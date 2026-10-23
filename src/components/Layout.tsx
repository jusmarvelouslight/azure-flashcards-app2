import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Brain, BarChart3, Settings, Menu, X, GraduationCap } from 'lucide-react';
import { useStore } from '../hooks/useStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/decks', icon: BookOpen, label: 'Study Decks' },
  { to: '/review', icon: Brain, label: 'Weak Areas' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDemoMode } = useStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {isDemoMode && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-800 text-sm text-center py-2 px-4 font-medium">
          ⚠️ Demo data: simulated, not real progress.
        </div>
      )}

      {/* Mobile header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-2">
          <GraduationCap size={20} className="text-indigo-600" />
          <span className="font-semibold text-slate-800">Flashcard Coach</span>
        </div>
        <div className="w-10" />
      </header>

      <div className="flex flex-1">
        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-full lg:h-auto z-50 lg:z-auto
          w-64 bg-white border-r border-slate-200 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:top-0 lg:min-h-screen
        `}>
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-sm">Flashcard Coach</h1>
                <p className="text-xs text-slate-500">AZ-900 Edition</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }
                `}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => { setSidebarOpen(false); navigate('/decks'); }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm"
            >
              Start today's review
            </button>
          </div>

          <div className="p-4 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 leading-tight">
              Flashcard Coach is an independent learning project. It is unofficial and is not affiliated with or endorsed by Microsoft.
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
