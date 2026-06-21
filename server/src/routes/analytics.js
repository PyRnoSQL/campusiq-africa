const express = require('express');
const { findAll } = require('../services/sheetsService');
const { authenticate, scopeToInstitution } = require('../middleware/auth');

const router = express.Router();

function scopeFilter(req) {
  return req.user.role === 'SuperAdmin' ? {} : { institution_id: req.user.institution_id };
}

router.get('/summary', authenticate, scopeToInstitution, async (req, res) => {
  try {
    const filter = scopeFilter(req);
    const [students, staff, attendance, fees, admissions, grades] = await Promise.all([
      findAll('Students', filter),
      findAll('Staff', filter),
      findAll('Attendance', filter),
      findAll('Finance_Fees', filter),
      findAll('Admissions', filter),
      findAll('Grades_Assessments', filter),
    ]);

    const enrolledStudents = students.filter((s) => s.enrollment_status === 'enrolled').length;
    const presentToday = attendance.filter((a) => a.status === 'present').length;
    const totalMarked = attendance.length || 1;
    const attendanceRate = Math.round((presentToday / totalMarked) * 1000) / 10;

    const totalDue = fees.reduce((sum, f) => sum + (Number(f.amount_due) || 0), 0);
    const totalPaid = fees.reduce((sum, f) => sum + (Number(f.amount_paid) || 0), 0);
    const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 1000) / 10 : 0;

    const pendingAdmissions = admissions.filter((a) => a.application_status === 'pending').length;

    // Pass rate: a 50%-of-max-score threshold works consistently whether the
    // institution displays scores as /20 or as a 4.0 GPA, since both scales
    // place their pass mark at the halfway point.
    const gradedRecords = grades.filter((g) => g.max_score && Number(g.max_score) > 0);
    const passingRecords = gradedRecords.filter((g) => Number(g.score) / Number(g.max_score) >= 0.5);
    const passRate = gradedRecords.length ? Math.round((passingRecords.length / gradedRecords.length) * 1000) / 10 : null;

    // Module/credit completion: distinct subject_course entries with at least
    // one recorded grade, as a share of distinct subjects offered overall —
    // a simple, transparent proxy until a dedicated curriculum/credits tab exists.
    const distinctSubjects = new Set(grades.map((g) => g.subject_course)).size;
    const completedSubjects = new Set(
      grades.filter((g) => Number(g.score) / Number(g.max_score || 1) >= 0.5).map((g) => g.subject_course)
    ).size;
    const completionRate = distinctSubjects ? Math.round((completedSubjects / distinctSubjects) * 1000) / 10 : null;

    res.json({
      data: {
        total_students: students.length,
        enrolled_students: enrolledStudents,
        total_staff: staff.length,
        attendance_rate_pct: attendanceRate,
        fees_total_due: totalDue,
        fees_total_paid: totalPaid,
        fees_collection_rate_pct: collectionRate,
        pending_admissions: pendingAdmissions,
        pass_rate_pct: passRate,
        completion_rate_pct: completionRate,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute summary', details: err.message });
  }
});

// Lightweight rule-based "AI" risk model: flags students with low attendance
// and/or low average grades as at-risk of dropping out. No ML infra needed —
// transparent, explainable thresholds that work well for a v1 early-warning system.
router.get('/risk-flags', authenticate, scopeToInstitution, async (req, res) => {
  try {
    const filter = scopeFilter(req);
    const [students, attendance, grades] = await Promise.all([
      findAll('Students', filter),
      findAll('Attendance', filter),
      findAll('Grades_Assessments', filter),
    ]);

    const ATTENDANCE_THRESHOLD = 80; // %
    const GRADE_THRESHOLD = 50; // % of max_score

    const flags = students
      .filter((s) => s.enrollment_status === 'enrolled')
      .map((student) => {
        const records = attendance.filter((a) => a.student_id === student.id);
        const present = records.filter((a) => a.status === 'present').length;
        const attendancePct = records.length ? Math.round((present / records.length) * 100) : 100;

        const studentGrades = grades.filter((g) => g.student_id === student.id);
        const avgPct = studentGrades.length
          ? Math.round(
              (studentGrades.reduce((sum, g) => sum + (Number(g.score) / (Number(g.max_score) || 1)) * 100, 0) /
                studentGrades.length) * 10
            ) / 10
          : null;

        const reasons = [];
        if (attendancePct < ATTENDANCE_THRESHOLD) reasons.push(`Low attendance (${attendancePct}%)`);
        if (avgPct !== null && avgPct < GRADE_THRESHOLD) reasons.push(`Low average grade (${avgPct}%)`);

        return reasons.length > 0
          ? {
              student_id: student.id,
              name: `${student.first_name} ${student.last_name}`,
              class_program_id: student.class_program_id,
              attendance_pct: attendancePct,
              average_grade_pct: avgPct,
              risk_level: reasons.length > 1 ? 'high' : 'medium',
              reasons,
            }
          : null;
      })
      .filter(Boolean);

    res.json({ data: flags, count: flags.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute risk flags', details: err.message });
  }
});

module.exports = router;
