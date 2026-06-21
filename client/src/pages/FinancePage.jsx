import React, { useEffect, useState } from 'react';
import { Plus, FileDown, QrCode } from 'lucide-react';
import { list, create } from '../api/client';
import { useInstitution } from '../context/InstitutionContext';
import { generateReceiptPDF } from '../utils/receiptPdf';
import PaymentQrModal from '../components/PaymentQrModal';

const emptyForm = { student_id: '', fee_type: '', amount_due: '', amount_paid: '0', currency: 'XAF', due_date: '', status: 'unpaid' };

const STATUS_STYLE = {
  paid: 'bg-teal/10 text-teal',
  partial: 'bg-gold/10 text-gold',
  unpaid: 'bg-clay/10 text-clay',
};

export default function FinancePage() {
  const { active } = useInstitution();
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [qrFee, setQrFee] = useState(null);

  async function refresh() {
    setLoading(true);
    const [f, s] = await Promise.all([list('finance'), list('students')]);
    setFees(f.data);
    setStudents(s.data);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const { data } = await create('finance', form);
    setFees((prev) => [data, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
  }

  function studentFor(fee) {
    return students.find((s) => s.id === fee.student_id);
  }

  const totals = fees.reduce(
    (acc, f) => ({ due: acc.due + (Number(f.amount_due) || 0), paid: acc.paid + (Number(f.amount_paid) || 0) }),
    { due: 0, paid: 0 }
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Fees & Finance</h1>
          <p className="text-xs text-slate">
            {totals.paid.toLocaleString()} / {totals.due.toLocaleString()} collected
            {totals.due > 0 && ` (${Math.round((totals.paid / totals.due) * 100)}%)`}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-card bg-ink text-sand text-sm font-medium px-4 py-2.5 hover:bg-ink/90"
        >
          <Plus size={16} /> Add fee record
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-line rounded-card p-5 grid sm:grid-cols-3 gap-4">
          <select required value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}
            className="rounded-card border border-line px-3.5 py-2.5 text-sm">
            <option value="">Select student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
          </select>
          <input required placeholder="Fee type" value={form.fee_type}
            onChange={(e) => setForm({ ...form, fee_type: e.target.value })}
            className="rounded-card border border-line px-3.5 py-2.5 text-sm" />
          <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
            placeholder="Currency" className="rounded-card border border-line px-3.5 py-2.5 text-sm" />
          <input required type="number" placeholder="Amount due" value={form.amount_due}
            onChange={(e) => setForm({ ...form, amount_due: e.target.value })}
            className="rounded-card border border-line px-3.5 py-2.5 text-sm" />
          <input type="number" placeholder="Amount paid" value={form.amount_paid}
            onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
            className="rounded-card border border-line px-3.5 py-2.5 text-sm" />
          <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            className="rounded-card border border-line px-3.5 py-2.5 text-sm" />
          <div className="sm:col-span-3 flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="text-sm font-medium text-slate px-4 py-2.5">Cancel</button>
            <button type="submit" className="rounded-card bg-clay text-white text-sm font-medium px-5 py-2.5 hover:bg-clay/90">Save</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-line rounded-card overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-ink text-sand text-xs uppercase tracking-wide">
            <tr>
              <th className="text-start px-4 py-3 font-medium">Student</th>
              <th className="text-start px-4 py-3 font-medium">Fee type</th>
              <th className="text-start px-4 py-3 font-medium">Due</th>
              <th className="text-start px-4 py-3 font-medium">Paid</th>
              <th className="text-start px-4 py-3 font-medium">Status</th>
              <th className="text-start px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-4 py-6 text-slate" colSpan={6}>Loading…</td></tr>}
            {!loading && fees.length === 0 && <tr><td className="px-4 py-6 text-slate" colSpan={6}>No fee records yet</td></tr>}
            {fees.map((f) => {
              const student = studentFor(f);
              return (
                <tr key={f.id} className="border-t border-line">
                  <td className="px-4 py-3">{student ? `${student.first_name} ${student.last_name}` : f.student_id}</td>
                  <td className="px-4 py-3">{f.fee_type}</td>
                  <td className="px-4 py-3 font-mono text-xs">{Number(f.amount_due).toLocaleString()} {f.currency}</td>
                  <td className="px-4 py-3 font-mono text-xs">{Number(f.amount_paid).toLocaleString()} {f.currency}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[f.status] || 'bg-slate/10 text-slate'}`}>{f.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => generateReceiptPDF({ institution: active, student, fee: f })} className="flex items-center gap-1 text-xs font-medium text-clay hover:underline">
                        <FileDown size={13} /> Receipt
                      </button>
                      {f.status !== 'paid' && (
                        <button onClick={() => setQrFee(f)} className="flex items-center gap-1 text-xs font-medium text-teal hover:underline">
                          <QrCode size={13} /> Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {qrFee && <PaymentQrModal fee={qrFee} student={studentFor(qrFee)} institution={active} onClose={() => setQrFee(null)} />}
    </div>
  );
}
