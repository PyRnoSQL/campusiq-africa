import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, GraduationCap, Users, BookOpen, CalendarCheck, ClipboardList,
  Wallet, FileCheck2, BadgeCheck, Megaphone, ActivitySquare, Settings, LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LANGUAGES } from '../i18n';
import SyncIndicator from './SyncIndicator';

const NAV_ITEMS = [
  { to: '/', key: 'dashboard', icon: LayoutDashboard, end: true },
  { to: '/students', key: 'students', icon: GraduationCap },
  { to: '/staff', key: 'staff', icon: Users },
  { to: '/classes', key: 'classes', icon: BookOpen },
  { to: '/attendance', key: 'attendance', icon: CalendarCheck },
  { to: '/grades', key: 'grades', icon: ClipboardList },
  { to: '/finance', key: 'finance', icon: Wallet },
  { to: '/admissions', key: 'admissions', icon: FileCheck2 },
  { to: '/documents', key: 'documents', icon: BadgeCheck },
  { to: '/announcements', key: 'announcements', icon: Megaphone },
  { to: '/analytics', key: 'analytics', icon: ActivitySquare },
];

export default function AppShell() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-sand">
      <aside className="hidden md:flex w-64 flex-col border-e border-line bg-ink text-sand px-4 py-6">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-clay to-gold flex items-center justify-center font-display font-bold text-ink text-sm">CQ</div>
          <span className="font-display font-semibold tracking-tight text-lg">{t('app_name')}</span>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ to, key, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-sand/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} strokeWidth={1.75} />
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-sand/70 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} strokeWidth={1.75} />
          {t('nav.logout')}
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-4 border-b border-line bg-sand/90 backdrop-blur px-4 md:px-8 py-4 sticky top-0 z-10">
          <div className="min-w-0">
            <p className="font-display font-semibold text-lg truncate">{t('dashboard.welcome', { name: user?.full_name?.split(' ')[0] || '' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <SyncIndicator />
            <select
              value={i18n.language?.slice(0, 2)}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="rounded-full border border-line bg-white/70 px-3 py-1.5 text-xs font-medium text-slate"
              aria-label={t('common.language')}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        </header>
        <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
