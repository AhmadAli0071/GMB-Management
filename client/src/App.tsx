import React, { useState, lazy, Suspense, Component, type ReactNode } from 'react';
import { User, ROLE_LABELS } from './types';
import { AppProvider, useApp } from './AppContext';
import { SocketProvider } from './SocketContext';
import { ChatNotifyProvider } from './ChatNotifyContext';
import { LoginPage } from './components/LoginPage';

const SalesDashboard = lazy(() => import('./components/dashboards/SalesDashboard').then(m => ({ default: m.SalesDashboard })));
const SEOManagerDashboard = lazy(() => import('./components/dashboards/SEOManagerDashboard').then(m => ({ default: m.SEOManagerDashboard })));
const SEOLeadDashboard = lazy(() => import('./components/dashboards/SEOLeadDashboard').then(m => ({ default: m.SEOLeadDashboard })));
const OffPageDashboard = lazy(() => import('./components/dashboards/OffPageDashboard').then(m => ({ default: m.OffPageDashboard })));
const DesignerDashboard = lazy(() => import('./components/dashboards/DesignerDashboard').then(m => ({ default: m.DesignerDashboard })));
const BossDashboard = lazy(() => import('./components/dashboards/BossDashboard').then(m => ({ default: m.BossDashboard })));

function DashboardLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Loading...</span>
      </div>
    </div>
  );
}

interface EBProps { children: ReactNode }
interface EBState { hasError: boolean; error: Error | null }
class ErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 mb-4">{this.state.error?.message}</p>
            <button onClick={() => this.setState({ hasError: false, error: null })} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">Try Again</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    try { return JSON.parse(stored); } catch { return null; }
  });

  const handleLogin = (loggedInUser: User) => {
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <ErrorBoundary>
    <SocketProvider>
      <AppProvider currentUser={user} onLogout={() => setUser(null)}>
        <ChatNotifyProvider>
          <AppContent />
        </ChatNotifyProvider>
      </AppProvider>
    </SocketProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { currentUser, onLogout } = useApp();

  const roleLabel = ROLE_LABELS[currentUser.role];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.PNG" alt="CrossDigi" className="w-9 h-9 rounded-xl shadow-lg shadow-blue-200 object-contain" />
          <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">CrossDigi</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden sm:block text-sm text-slate-500">Welcome, <span className="text-blue-600 font-semibold">{currentUser.name}</span></span>
          <span className="hidden sm:inline-block px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-semibold border border-blue-200">{roleLabel}</span>
          <span className="sm:hidden px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-semibold border border-blue-200">{currentUser.name}</span>
          <button
            onClick={onLogout}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
      <div className="p-4 sm:p-8">
        <Suspense fallback={<DashboardLoader />}>
          {currentUser.role === 'SALES_MANAGER' && <SalesDashboard />}
          {currentUser.role === 'SEO_MANAGER' && <SEOManagerDashboard />}
          {currentUser.role === 'SEO_LEAD' && <SEOLeadDashboard />}
          {currentUser.role === 'OFF_PAGE_SPECIALIST' && <OffPageDashboard />}
          {currentUser.role === 'BOSS' && <BossDashboard />}
          {currentUser.role === 'DESIGNER' && <DesignerDashboard />}
        </Suspense>
      </div>
    </div>
  );
}