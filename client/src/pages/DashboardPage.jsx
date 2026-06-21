import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getSummary, getRiskFlags } from '../api/client';
import StatCard from '../components/StatCard';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [risk, setRisk] = useState([]);

  useEffect(() => {
    getSummary().then(setSummary).catch(() => {});
    getRiskFlags().then(setRisk).catch(() => {});
  }, []);

  const chartData = summary
    ? [
        { name: t('dashboard.attendance_rate'), value: summary.attendance_rate_pct },
        { name: t('dashboard.collection_rate'), value: summary.fees_collection_rate_pct },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('dashboard.total_students')} value={summary?.total_students ?? '—'} accent="ink" />
        <StatCard label={t('dashboard.total_staff')} value={summary?.total_staff ?? '—'} accent="ink" />
        <StatCard label={t('dashboard.attendance_rate')} value={summary?.attendance_rate_pct ?? '—'} suffix="%" accent="teal" />
        <StatCard label={t('dashboard.collection_rate')} value={summary?.fees_collection_rate_pct ?? '—'} suffix="%" accent="gold" />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white rounded-card border border-line p-5">
          <p className="font-display font-semibold mb-4">{t('dashboard.attendance_rate')} / {t('dashboard.collection_rate')}</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5B6072' }} />
              <YAxis tick={{ fontSize: 12, fill: '#5B6072' }} unit="%" />
              <Tooltip />
              <Bar dataKey="value" fill="#C75D3B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white rounded-card border border-line p-5">
          <p className="font-display font-semibold">{t('risk.title')}</p>
          <p className="text-xs text-slate mb-4">{t('risk.subtitle')}</p>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {risk.length === 0 && <p className="text-sm text-slate">{t('common.no_results')}</p>}
            {risk.map((r) => (
              <div key={r.student_id} className="flex items-center justify-between border-b border-line pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-slate">{r.reasons.join(' · ')}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.risk_level === 'high' ? 'bg-clay/10 text-clay' : 'bg-gold/10 text-gold'}`}>
                  {t(`risk.${r.risk_level}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
