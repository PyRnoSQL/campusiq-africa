import React from 'react';

export default function StatCard({ label, value, accent = 'teal', suffix = '' }) {
  const accents = {
    teal: 'text-teal',
    clay: 'text-clay',
    gold: 'text-gold',
    ink: 'text-ink',
  };
  return (
    <div className="bg-white rounded-card border border-line px-5 py-4">
      <p className="text-xs font-medium text-slate mb-2">{label}</p>
      <p className={`font-display text-3xl font-semibold ${accents[accent]}`}>
        {value}
        <span className="text-base font-medium ms-0.5">{suffix}</span>
      </p>
    </div>
  );
}
