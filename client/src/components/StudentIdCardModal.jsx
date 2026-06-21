import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Printer } from 'lucide-react';
import { useInstitution } from '../context/InstitutionContext';

export default function StudentIdCardModal({ student, onClose }) {
  const { active, typeConfig } = useInstitution();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !student) return;
    const payload = JSON.stringify({
      id: student.id,
      matricule: student.matricule,
      institution: active?.id,
      v: 1,
    });
    QRCode.toCanvas(canvasRef.current, payload, { width: 110, margin: 1, color: { dark: '#14182B', light: '#F6F1E7' } });
  }, [student, active?.id]);

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4 print:bg-white print:p-0" onClick={onClose}>
      <div className="bg-white rounded-card shadow-2xl max-w-sm w-full overflow-hidden print:shadow-none" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-line dark:border-ink-border print:hidden">
          <p className="font-display font-semibold">Digital ID Card</p>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-medium text-slate hover:text-ink">
              <Printer size={14} /> Print
            </button>
            <button onClick={onClose} className="text-slate hover:text-ink"><X size={16} /></button>
          </div>
        </div>

        <div id="id-card-printable" className="p-5">
          <div className="rounded-card bg-gradient-to-br from-ink to-ink/90 text-sand p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-semibold text-sm">{active?.name || 'CampusIQ Africa'}</span>
              <span className="text-[9px] font-semibold uppercase tracking-wide bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                {typeConfig.shortLabel}
              </span>
            </div>
            <div className="flex gap-3">
              <div className="h-20 w-16 rounded bg-white/10 overflow-hidden flex items-center justify-center shrink-0">
                {student.photo_url ? (
                  <img src={student.photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-display">{student.first_name?.[0]}{student.last_name?.[0]}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{student.first_name} {student.last_name}</p>
                <p className="text-xs text-sand/70 font-mono">{student.matricule}</p>
                <p className="text-xs text-sand/70 mt-1">{student.class_program_id || '—'}</p>
              </div>
              <canvas ref={canvasRef} className="bg-sand rounded shrink-0" />
            </div>
          </div>
          <p className="text-[10px] text-slate text-center mt-3">Scan the QR code to verify this student's enrollment status.</p>
        </div>
      </div>
    </div>
  );
}
