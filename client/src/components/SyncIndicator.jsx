import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { triggerSync } from '../api/client';

export default function SyncIndicator() {
  const { t } = useTranslation();
  const { online, pending, syncing } = useSyncStatus();

  const color = !online ? 'bg-gold' : pending > 0 ? 'bg-clay' : 'bg-teal';
  const label = !online
    ? t('common.offline')
    : pending > 0
    ? t('common.syncing', { count: pending })
    : t('common.synced');

  return (
    <button
      onClick={() => triggerSync()}
      className="group flex items-center gap-2.5 rounded-full border border-line bg-white/70 px-3 py-1.5 text-xs font-medium text-slate hover:bg-white transition-colors"
      title={label}
    >
      <span className="relative flex h-2.5 w-2.5">
        {(syncing || (online && pending > 0)) && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-60`} />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
      </span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
