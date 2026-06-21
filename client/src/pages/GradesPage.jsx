import React, { useEffect, useMemo, useState } from 'react';
import { Plus, FileDown } from 'lucide-react';
import { list, create } from '../api/client';
import { useInstitution } from '../context/InstitutionContext';
import { scoreToScale } from '../config/institutionTypes';
import { generateReportCardPDF } from '../utils/reportCardPdf';

const emptyForm = { student_id: '', subject_course: '', assessment_type: '', term: '', score: '', max_score: '20', comments: '' };

export default function GradesPage() {
  const { active, typeConfig } = useInstitution();
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const [g, s] = await Promise.all([list('grades'), list('students')]);
    setGrades(g.data);
    setStudents(s.data);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  const studentGrades = useMemo(
    () => grades.filter((g) => !selectedStudentId || g.student_id === selectedStudentId),
    [grades, selectedStudentId]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    const { data } = await create('grades', form);
    setGrades((prev) => [data, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
  }

  function handleGenerateReportCard(studentId) {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    const studentRecords = grades.filter((g) => g.student_id === studentId);
    generateReportCardPDF({ institution: active, student, grades: studentRecords, typeConfig });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Grades</h1>
          <p className="text-xs text-slate">Recorded on a {typeConfig.scoreScale.max === 4 ? '4.0 GPA' : '/20'} scale, shown as {typeConfig.gradeTerm}</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-card bg-ink text-sand text-sm font-medium px-4 py-2.5 hover:bg-ink/90"
        >
          <Plus size={16} /> Add grade
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm"
        >
          <option value="">All students</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.matricule})</option>
          ))}
        </select>
        {selectedStudentId && (
          <button
            onClick={() => handleGenerateReportCard(selectedStudentId)}
            className="flex items-center gap-2 rounded-card bg-clay text-white text-sm font-medium px-4 py-2.5 hover:bg-clay/90"
          >
            <FileDown size={16} /> Generate report card PDF
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-ink-surface border border-line dark:border-ink-border rounded-card p-5 grid sm:grid-cols-3 gap-4">
          <select required value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}
            className="rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm sm:col-span-1">
            <option value="">Select student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
          </select>
          <input required placeholder="Subject / Course" value={form.subject_course}
            onChange={(e) => setForm({ ...form, subject_course: e.target.value })}
            className="rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm" />
          <select required value={form.assessment_type} onChange={(e) => setForm({ ...form, assessment_type: e.target.value })}
            className="rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm">
            <option value="">Assessment type</option>
            {typeConfig.assessmentTypes.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })}
            className="rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm">
            <option value="">{typeConfig.termLabel}</option>
            {typeConfig.terms.map((tm) => <option key={tm} value={tm}>{tm}</option>)}
          </select>
          <input required type="number" step="0.1" placeholder="Score" value={form.score}
            onChange={(e) => setForm({ ...form, score: e.target.value })}
            className="rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm" />
          <input required type="number" step="0.1" placeholder="Max score" value={form.max_score}
            onChange={(e) => setForm({ ...form, max_score: e.target.value })}
            className="rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm" />
          <input placeholder="Comments" value={form.comments}
            onChange={(e) => setForm({ ...form, comments: e.target.value })}
            className="rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm sm:col-span-3" />
          <div className="sm:col-span-3 flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="text-sm font-medium text-slate px-4 py-2.5">Cancel</button>
            <button type="submit" className="rounded-card bg-clay text-white text-sm font-medium px-5 py-2.5 hover:bg-clay/90">Save</button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-ink-surface border border-line dark:border-ink-border rounded-card overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-ink text-sand text-xs uppercase tracking-wide">
            <tr>
              <th className="text-start px-4 py-3 font-medium">Student</th>
              <th className="text-start px-4 py-3 font-medium">Subject / Course</th>
              <th className="text-start px-4 py-3 font-medium">Assessment</th>
              <th className="text-start px-4 py-3 font-medium">Term</th>
              <th className="text-start px-4 py-3 font-medium">Raw score</th>
              <th className="text-start px-4 py-3 font-medium">{typeConfig.gradeTerm}</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-4 py-6 text-slate" colSpan={6}>Loading…</td></tr>}
            {!loading && studentGrades.length === 0 && <tr><td className="px-4 py-6 text-slate" colSpan={6}>No grades yet</td></tr>}
            {studentGrades.map((g) => {
              const student = students.find((s) => s.id === g.student_id);
              const scaled = scoreToScale(g.score, g.max_score, active?.type);
              return (
                <tr key={g.id} className="border-t border-line dark:border-ink-border">
                  <td className="px-4 py-3">{student ? `${student.first_name} ${student.last_name}` : g.student_id}</td>
                  <td className="px-4 py-3">{g.subject_course}</td>
                  <td className="px-4 py-3 text-slate">{g.assessment_type}</td>
                  <td className="px-4 py-3 text-slate">{g.term}</td>
                  <td className="px-4 py-3 font-mono text-xs">{g.score}/{g.max_score}</td>
                  <td className="px-4 py-3 font-semibold text-clay">{scaled.formatted}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
