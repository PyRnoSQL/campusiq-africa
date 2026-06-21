import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { getSummary, getRiskFlags } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useInstitution } from '../context/InstitutionContext';
import StatCard from '../components/StatCard';

const PIE_COLORS = ['#C75D3B', '#D8A93B', '#1F6F6B', '#5B6072'];

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { active, institutions, typeConfig, switchInstitution } = useInstitution();
  const [summary, setSummary] = useState(null);
  const [risk, setRisk] = useState([]);

  useEffect(() => {
    if (!active) return;
    getSummary().then(setSummary).catch(() => {});
    getRiskFlags().then(setRisk).catch(() => {});
  }, [active?.id]);

  const chartData = summary
    ? [
        { name: t('dashboard.attendance_rate'), value: summary.attendance_rate_pct },
        { name: t('dashboard.collection_rate'), value: summary.fees_collection_rate_pct },
      ]
    : [];

  const compositionData = summary
    ? [
        { name: t('dashboard.total_students'), value: summary.enrolled_students },
        { name: t('dashboard.total_staff'), value: summary.total_staff },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-clay">{typeConfig.label}</p>
          <h1 className="font-display text-2xl font-semibold">{active?.name || '—'}</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('dashboard.total_students')} value={summary?.total_students ?? '—'} accent="ink" />
        <StatCard label={t('dashboard.total_staff')} value={summary?.total_staff ?? '—'} accent="ink" />
        {typeConfig.dashboardWidgets.includes('attendance_rate') && (
          <StatCard label={t('dashboard.attendance_rate')} value={summary?.attendance_rate_pct ?? '—'} suffix="%" accent="teal" />
        )}
        {typeConfig.dashboardWidgets.includes('collection_rate') && (
          <StatCard label={t('dashboard.collection_rate')} value={summary?.fees_collection_rate_pct ?? '—'} suffix="%" accent="gold" />
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white dark:bg-ink-surface rounded-card border border-line dark:border-ink-border p-5">
          <p className="font-display font-semibold mb-4">{t('dashboard.attendance_rate')} / {t('dashboard.collection_rate')}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5B6072' }} />
              <YAxis tick={{ fontSize: 12, fill: '#5B6072' }} unit="%" />
              <Tooltip />
              <Bar dataKey="value" fill="#C75D3B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-ink-surface rounded-card border border-line dark:border-ink-border p-5">
          <p className="font-display font-semibold mb-2">{typeConfig.classTerm} composition</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={compositionData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {compositionData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-ink-surface rounded-card border border-line dark:border-ink-border p-5">
        <p className="font-display font-semibold">{t('risk.title')}</p>
        <p className="text-xs text-slate mb-4">{t('risk.subtitle')}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {risk.length === 0 && <p className="text-sm text-slate">{t('common.no_results')}</p>}
          {risk.map((r) => (
            <div key={r.student_id} className="border border-line dark:border-ink-border rounded-card p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">{r.name}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.risk_level === 'high' ? 'bg-clay/10 text-clay' : 'bg-gold/10 text-gold'}`}>
                  {t(`risk.${r.risk_level}`)}
                </span>
              </div>
              <p className="text-xs text-slate">{r.reasons.join(' · ')}</p>
            </div>
          ))}
        </div>
      </div>

      {user?.role === 'SuperAdmin' && institutions.length > 1 && (
        <div className="bg-white dark:bg-ink-surface rounded-card border border-line dark:border-ink-border p-5">
          <p className="font-display font-semibold mb-1">Cross-institution overview</p>
          <p className="text-xs text-slate mb-4">All institutions on this deployment — click a row to drill in.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate border-b border-line dark:border-ink-border">
                <tr>
                  <th className="text-start py-2">Institution</th>
                  <th className="text-start py-2">Type</th>
                  <th className="text-start py-2">Country</th>
                  <th className="text-start py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((inst) => (
                  <tr
                    key={inst.id}
                    onClick={() => switchInstitution(inst.id)}
                    className={`border-b border-line dark:border-ink-border last:border-0 cursor-pointer hover:bg-sand dark:hover:bg-ink-surface ${inst.id === active?.id ? 'bg-sand' : ''}`}
                  >
                    <td className="py-2.5 font-medium">{inst.name}</td>
                    <td className="py-2.5 text-slate">{inst.type}</td>
                    <td className="py-2.5 text-slate">{inst.country}</td>
                    <td className="py-2.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal/10 text-teal">{inst.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
