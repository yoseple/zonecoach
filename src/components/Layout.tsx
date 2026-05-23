import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  Home, 
  Plus, 
  History, 
  Trophy, 
  Calendar, 
  Settings, 
  BarChart2, 
  Smartphone,
  Menu,
  User
} from 'lucide-react';
import { clsx } from 'clsx';
import { useRunStore } from '../store/useRunStore';

const navItems = [
  { path: '/', label: 'Overview', icon: Home },
  { path: '/live-run', label: 'Live Tracker', icon: Smartphone },
  { path: '/add-run', label: 'Add Manual Run', icon: Plus },
  { path: '/history', label: 'Activities', icon: History },
  { path: '/records', label: 'PRs & Best Hooks', icon: Trophy },
  { path: '/training', label: 'Training Plans', icon: Calendar },
  { path: '/stats', label: 'Analysis', icon: BarChart2 },
  { path: '/settings', label: 'Zones & Profile', icon: Settings },
];

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const { userProfile } = useRunStore();

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar / Navigation */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-out md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-8 pb-4">
            <Link to="/" className="flex items-center space-x-3 group" onClick={() => setIsSidebarOpen(false)}>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                <Smartphone className="text-white" size={24} />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Zone<span className="text-blue-600">Coach</span>
              </span>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <div className="px-4 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Main Menu</span>
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={clsx(
                    "flex items-center space-x-3.5 px-4 py-3 rounded-2xl transition-all duration-200 group",
                    isActive 
                      ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-50" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon size={20} className={clsx(
                    "transition-colors",
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  <span className="font-bold text-[15px]">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* User Profile Section */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <Link to="/settings" className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-600 group-hover:border-blue-200 transition-colors">
                <User size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-900 truncate leading-tight">{userProfile.name}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">View Profile</p>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header (Floating Style) */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:block">
               {/* Breadcrumbs or page title could go here */}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link 
              to="/add-run"
              className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <Plus size={18} />
              <span>Manual Log</span>
            </Link>
            <Link 
              to="/future"
              className="hidden sm:flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <Smartphone size={16} />
              <span>Coaching</span>
            </Link>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="max-w-[1200px] mx-auto p-6 md:p-10">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Floating Action Button for Mobile (Central Play Button) */}
      <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <Link 
          to="/live-run"
          className="w-16 h-16 bg-blue-600 rounded-full text-white shadow-[0_10px_30px_rgba(59,130,246,0.5)] flex items-center justify-center active:scale-90 transition-all border-4 border-white"
        >
          <Play size={32} fill="currentColor" className="ml-1" />
        </Link>
      </div>
    </div>
  );
};
