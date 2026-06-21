import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@campusiq.africa');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(t('login.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -end-24 h-96 w-96 rounded-full border border-gold/40" />
        <div className="absolute -top-10 -end-10 h-72 w-72 rounded-full border border-clay/40" />
        <div className="absolute top-8 end-8 h-48 w-48 rounded-full border border-teal/40" />
      </div>

      <div className="relative w-full max-w-sm bg-sand rounded-card shadow-2xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-clay to-gold flex items-center justify-center font-display font-bold text-ink text-sm">CQ</div>
          <span className="font-display font-semibold tracking-tight text-lg">{t('app_name')}</span>
        </div>
        <h1 className="font-display text-2xl font-semibold mb-1">{t('login.title')}</h1>
        <p className="text-sm text-slate mb-6">{t('login.subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate mb-1.5">{t('login.email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-card border border-line bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate mb-1.5">{t('login.password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-card border border-line bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
            />
          </div>
          {error && <p className="text-sm text-clay">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-card bg-ink text-sand font-medium text-sm py-2.5 hover:bg-ink/90 transition-colors disabled:opacity-60"
          >
            {loading ? t('common.loading') : t('login.submit')}
          </button>
        </form>
        <p className="text-xs text-slate mt-5">{t('login.demo_hint')}</p>
      </div>
    </div>
  );
}
