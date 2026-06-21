import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, GraduationCap, Users, BookOpen, CalendarCheck, ClipboardList,
  Wallet, FileCheck2, BadgeCheck, Megaphone, ActivitySquare, Settings, LogOut, Moon, Sun, Command,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInstitution } from '../context/InstitutionContext';
import { LANGUAGES } from '../i18n';
import SyncIndicator from './SyncIndicator';
import CommandPalette from './CommandPalette';
import { useTheme } from '../context/ThemeContext';

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
  { to: '/settings', key: 'settings', icon: Settings },
];

export default function AppShell() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { institutions, active, activeId, switchInstitution, typeConfig } = useInstitution();
  const { dark, toggleDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-sand dark:bg-ink transition-colors">
      <aside className="hidden md:flex w-64 flex-col border-e border-line dark:border-ink-border bg-ink text-sand px-4 py-6">
        <div className="flex items-center gap-2 px-2 mb-4">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-clay to-gold flex items-center justify-center font-display font-bold text-ink text-sm">CQ</div>
          <span className="font-display font-semibold tracking-tight text-lg">{t('app_name')}</span>
        </div>

        {active && (
          <div className="px-2 mb-5">
            {user?.role === 'SuperAdmin' ? (
              <select
                value={activeId || ''}
                onChange={(e) => switchInstitution(e.target.value)}
                className="w-full rounded-card bg-white/10 border border-white/10 text-xs text-sand px-2.5 py-2"
              >
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id} className="text-ink">{inst.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-xs font-medium text-sand/80 truncate">{active.name}</p>
            )}
            <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-clay/20 text-gold">
              {typeConfig.shortLabel}
            </span>
          </div>
        )}

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
          {typeConfig.extraNav.map(({ to, key, labelFallback }) => (
            <NavLink
              key={to}
              to={`/${to}`}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-sand/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <BookOpen size={18} strokeWidth={1.75} />
              {t(`nav.${key}`, labelFallback)}
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
        <header className="flex items-center justify-between gap-4 border-b border-line dark:border-ink-border bg-sand/90 dark:bg-ink/90 backdrop-blur px-4 md:px-8 py-4 sticky top-0 z-10">
          <div className="min-w-0">
            <p className="font-display font-semibold text-lg truncate">{t('dashboard.welcome', { name: user?.full_name?.split(' ')[0] || '' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
              className="hidden sm:flex items-center gap-2 rounded-full border border-line dark:border-ink-border bg-white/70 dark:bg-ink-surface px-3 py-1.5 text-xs font-medium text-slate hover:bg-white dark:hover:bg-ink-border transition-colors"
            >
              <Command size={13} /> <span>Search</span>
              <kbd className="text-[10px] font-mono opacity-60">⌘K</kbd>
            </button>
            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="flex items-center justify-center h-8 w-8 rounded-full border border-line dark:border-ink-border bg-white/70 dark:bg-ink-surface text-slate hover:bg-white dark:hover:bg-ink-border transition-colors"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <SyncIndicator />
            <select
              value={i18n.language?.slice(0, 2)}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="rounded-full border border-line dark:border-ink-border bg-white/70 dark:bg-ink-surface px-3 py-1.5 text-xs font-medium text-slate"
              aria-label={t('common.language')}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        </header>
        <main key={location.pathname} className="flex-1 px-4 md:px-8 py-6 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
