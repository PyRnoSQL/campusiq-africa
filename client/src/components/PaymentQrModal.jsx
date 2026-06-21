import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X } from 'lucide-react';

export default function PaymentQrModal({ fee, student, institution, onClose }) {
  const canvasRef = useRef(null);
  const outstanding = (Number(fee.amount_due) || 0) - (Number(fee.amount_paid) || 0);

  useEffect(() => {
    if (!canvasRef.current) return;
    const payload = JSON.stringify({
      type: 'mobile_money_request',
      institution: institution?.name,
      student: `${student?.first_name || ''} ${student?.last_name || ''}`,
      matricule: student?.matricule,
      fee_type: fee.fee_type,
      amount: outstanding,
      currency: fee.currency,
      reference: fee.id,
    });
    QRCode.toCanvas(canvasRef.current, payload, { width: 200, margin: 1, color: { dark: '#14182B', light: '#FFFFFF' } });
  }, [fee.id]);

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-ink-surface rounded-card shadow-2xl max-w-xs w-full p-5 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end">
          <button onClick={onClose} className="text-slate hover:text-ink"><X size={16} /></button>
        </div>
        <p className="font-display font-semibold mb-1">Mobile Money payment</p>
        <p className="text-xs text-slate mb-4">Guardian scans this with their Mobile Money app to pay the outstanding balance</p>
        <div className="flex justify-center mb-4">
          <canvas ref={canvasRef} className="rounded-card border border-line dark:border-ink-border" />
        </div>
        <p className="text-2xl font-display font-semibold text-clay">{outstanding.toLocaleString()} {fee.currency}</p>
        <p className="text-xs text-slate mt-1">{fee.fee_type} · {student?.first_name} {student?.last_name}</p>
        <p className="text-[10px] text-slate mt-4">Demo QR — connect a real Mobile Money/Orange Money merchant API to make this a live payment link.</p>
      </div>
    </div>
  );
}
