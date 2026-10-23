import { HashRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './hooks/useStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StudyDecks from './pages/StudyDecks';
import StudySession from './pages/StudySession';
import WeakAreas from './pages/WeakAreas';
import Progress from './pages/Progress';
import Settings from './pages/Settings';

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/decks" element={<StudyDecks />} />
            <Route path="/study" element={<StudySession />} />
            <Route path="/review" element={<WeakAreas />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
