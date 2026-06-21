import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search, LayoutDashboard, GraduationCap, Users, BookOpen, CalendarCheck, ClipboardList,
  Wallet, FileCheck2, BadgeCheck, Megaphone, ActivitySquare, Moon, Sun, LogOut,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

function buildCommands({ t, navigate, dark, toggleDark, logout }) {
  const nav = (to) => navigate(to);
  return [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, action: () => nav('/') },
    { id: 'students', label: t('nav.students'), icon: GraduationCap, action: () => nav('/students') },
    { id: 'staff', label: t('nav.staff'), icon: Users, action: () => nav('/staff') },
    { id: 'classes', label: t('nav.classes'), icon: BookOpen, action: () => nav('/classes') },
    { id: 'attendance', label: t('nav.attendance'), icon: CalendarCheck, action: () => nav('/attendance') },
    { id: 'grades', label: t('nav.grades'), icon: ClipboardList, action: () => nav('/grades') },
    { id: 'finance', label: t('nav.finance'), icon: Wallet, action: () => nav('/finance') },
    { id: 'admissions', label: t('nav.admissions'), icon: FileCheck2, action: () => nav('/admissions') },
    { id: 'documents', label: t('nav.documents'), icon: BadgeCheck, action: () => nav('/documents') },
    { id: 'announcements', label: t('nav.announcements'), icon: Megaphone, action: () => nav('/announcements') },
    { id: 'analytics', label: t('nav.analytics'), icon: ActivitySquare, action: () => nav('/analytics') },
    { id: 'theme', label: dark ? 'Switch to light mode' : 'Switch to dark mode', icon: dark ? Sun : Moon, action: toggleDark },
    { id: 'logout', label: t('nav.logout'), icon: LogOut, action: () => { logout(); navigate('/login'); } },
  ];
}

export default function CommandPalette() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dark, toggleDark } = useTheme();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);

  const commands = useMemo(() => buildCommands({ t, navigate, dark, toggleDark, logout }), [t, dark]);
  const filtered = useMemo(
    () => commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())),
    [commands, query]
  );

  useEffect(() => {
    function handleKeydown(e) {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlighted(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => { setHighlighted(0); }, [query]);

  function handleKeyNav(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[highlighted];
      if (cmd) { cmd.action(); setOpen(false); }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-ink/60 flex items-start justify-center pt-[15vh] px-4" onClick={() => setOpen(false)}>
      <div
        className="bg-white dark:bg-ink-surface rounded-card shadow-2xl w-full max-w-lg overflow-hidden border border-line dark:border-ink-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-line dark:border-ink-border">
          <Search size={16} className="text-slate shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyNav}
            placeholder="Jump to a page or action…"
            className="flex-1 bg-transparent text-sm outline-none text-ink dark:text-sand placeholder:text-slate"
          />
          <kbd className="hidden sm:inline text-[10px] font-mono text-slate border border-line dark:border-ink-border rounded px-1.5 py-0.5">Esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 && <p className="px-4 py-6 text-sm text-slate text-center">No matches</p>}
          {filtered.map((cmd, i) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => { cmd.action(); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start transition-colors ${
                  i === highlighted ? 'bg-clay/10 text-clay' : 'text-ink dark:text-sand hover:bg-sand dark:hover:bg-ink-border'
                }`}
              >
                <Icon size={16} />
                {cmd.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
