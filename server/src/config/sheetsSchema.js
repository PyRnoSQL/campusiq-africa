/**
 * Single source of truth for the Google Sheets "database" schema.
 * Every tab = a table. headers[0] of every table is always "id".
 * Used by: server/scripts/setupSheets.js (creates the sheet) and the
 * generic sheetsService (reads/writes rows by header name).
 */

const SHEETS = {
  Institutions: {
    headers: [
      'id', 'name', 'type', 'level', 'country', 'region_city', 'address',
      'phone', 'email', 'logo_url', 'languages', 'currency', 'academic_year',
      'status', 'created_at',
    ],
    sample: [
      ['inst-001', 'Lycée Technique de Douala', 'Technical/Vocational', 'Secondary', 'Cameroon', 'Douala', 'Akwa, Douala', '+237699000111', 'contact@lt-douala.cm', '', 'FR,EN', 'XAF', '2025-2026', 'active', '2025-09-01'],
      ['inst-002', 'Greenfield International School', 'General', 'Primary/Secondary', 'Ghana', 'Accra', 'East Legon, Accra', '+233244000222', 'info@greenfield.gh', '', 'EN', 'GHS', '2025-2026', 'active', '2025-09-01'],
      ['inst-003', 'Université Polytechnique de Dakar', 'University', 'Higher Ed', 'Senegal', 'Dakar', 'Plateau, Dakar', '+221770000333', 'contact@upd.sn', '', 'FR,EN', 'XOF', '2025-2026', 'active', '2025-09-01'],
      ['inst-004', 'Instituto Técnico de Malabo', 'Technical/Vocational', 'Secondary', 'Equatorial Guinea', 'Malabo', 'Centro, Malabo', '+240222000444', 'info@itm.gq', '', 'SP,FR', 'XAF', '2025-2026', 'active', '2025-09-01'],
      ['inst-005', 'Cairo Modern University', 'University', 'Higher Ed', 'Egypt', 'Cairo', 'Nasr City, Cairo', '+201000000555', 'info@cmu.eg', '', 'AR,EN', 'EGP', '2025-2026', 'active', '2025-09-01'],
    ],
  },

  Users: {
    headers: [
      'id', 'institution_id', 'full_name', 'email', 'phone', 'password_hash',
      'role', 'preferred_language', 'avatar_url', 'status', 'last_login', 'created_at',
    ],
    sample: [
      ['usr-001', '', 'Super Admin', 'admin@campusiq.africa', '+237600000000', '$2a$10$replace.with.real.hash', 'SuperAdmin', 'EN', '', 'active', '', '2025-09-01'],
      ['usr-002', 'inst-001', 'Aïcha Mballa', 'aicha.mballa@lt-douala.cm', '+237699000112', '$2a$10$replace.with.real.hash', 'InstitutionAdmin', 'FR', '', 'active', '', '2025-09-01'],
      ['usr-003', 'inst-001', 'Jean Foko', 'jean.foko@lt-douala.cm', '+237699000113', '$2a$10$replace.with.real.hash', 'Teacher', 'FR', '', 'active', '', '2025-09-01'],
      ['usr-004', 'inst-002', 'Ama Owusu', 'ama.owusu@greenfield.gh', '+233244000223', '$2a$10$replace.with.real.hash', 'Teacher', 'EN', '', 'active', '', '2025-09-01'],
      ['usr-005', 'inst-003', 'Moussa Diop', 'moussa.diop@upd.sn', '+221770000334', '$2a$10$replace.with.real.hash', 'InstitutionAdmin', 'FR', '', 'active', '', '2025-09-01'],
      ['usr-006', 'inst-005', 'Yasmin El-Sayed', 'yasmin.elsayed@cmu.eg', '+201000000556', '$2a$10$replace.with.real.hash', 'Teacher', 'AR', '', 'active', '', '2025-09-01'],
      ['usr-007', 'inst-001', 'Parent of Koffi A.', 'parent.koffi@example.com', '+237699000114', '$2a$10$replace.with.real.hash', 'Parent', 'FR', '', 'active', '', '2025-09-01'],
    ],
  },

  Students: {
    headers: [
      'id', 'institution_id', 'matricule', 'first_name', 'last_name', 'gender',
      'date_of_birth', 'class_program_id', 'enrollment_status', 'guardian_name',
      'guardian_phone', 'guardian_email', 'address', 'photo_url', 'national_id',
      'created_at', 'updated_at',
    ],
    sample: [
      ['stu-001', 'inst-001', 'LTD-2025-001', 'Koffi', 'Assamoi', 'M', '2008-03-12', 'cls-001', 'enrolled', 'Mr. Assamoi K.', '+237699000114', 'parent.koffi@example.com', 'Bonabéri, Douala', '', 'CM-ID-001', '2025-09-01', '2025-09-01'],
      ['stu-002', 'inst-001', 'LTD-2025-002', 'Fatima', 'Njoya', 'F', '2007-11-05', 'cls-001', 'enrolled', 'Mme Njoya', '+237699000115', '', 'Bonabéri, Douala', '', 'CM-ID-002', '2025-09-01', '2025-09-01'],
      ['stu-003', 'inst-002', 'GIS-2025-014', 'Kwame', 'Mensah', 'M', '2010-06-20', 'cls-002', 'enrolled', 'Mr. Mensah', '+233244000224', '', 'East Legon, Accra', '', 'GH-ID-014', '2025-09-01', '2025-09-01'],
      ['stu-004', 'inst-003', 'UPD-2025-101', 'Aminata', 'Sow', 'F', '2003-01-18', 'cls-003', 'enrolled', '', '', '', 'Plateau, Dakar', '', 'SN-ID-101', '2025-09-01', '2025-09-01'],
      ['stu-005', 'inst-005', 'CMU-2025-220', 'Omar', 'Hassan', 'M', '2002-09-09', 'cls-004', 'enrolled', '', '', '', 'Nasr City, Cairo', '', 'EG-ID-220', '2025-09-01', '2025-09-01'],
    ],
  },

  Staff: {
    headers: [
      'id', 'institution_id', 'employee_no', 'first_name', 'last_name', 'role',
      'department', 'subjects_courses', 'phone', 'email', 'hire_date',
      'employment_status', 'salary_grade', 'created_at',
    ],
    sample: [
      ['stf-001', 'inst-001', 'EMP-001', 'Jean', 'Foko', 'Teacher', 'Electrical Engineering', 'Circuits I; Industrial Automation', '+237699000113', 'jean.foko@lt-douala.cm', '2020-09-01', 'active', 'G3', '2025-09-01'],
      ['stf-002', 'inst-002', 'EMP-014', 'Ama', 'Owusu', 'Teacher', 'Mathematics', 'Algebra; Geometry', '+233244000223', 'ama.owusu@greenfield.gh', '2019-09-01', 'active', 'G2', '2025-09-01'],
      ['stf-003', 'inst-003', 'EMP-040', 'Moussa', 'Diop', 'Registrar', 'Administration', '', '+221770000334', 'moussa.diop@upd.sn', '2018-01-15', 'active', 'G4', '2025-09-01'],
      ['stf-004', 'inst-005', 'EMP-060', 'Yasmin', 'El-Sayed', 'Lecturer', 'Computer Science', 'Data Structures; AI Fundamentals', '+201000000556', 'yasmin.elsayed@cmu.eg', '2021-02-01', 'active', 'L1', '2025-09-01'],
    ],
  },

  Classes_Programs: {
    headers: [
      'id', 'institution_id', 'name', 'level', 'track_specialization',
      'academic_year', 'homeroom_teacher_id', 'capacity', 'schedule_summary', 'created_at',
    ],
    sample: [
      ['cls-001', 'inst-001', 'Terminale F3 - Électrotechnique', 'Secondary - Terminale', 'Electrical Engineering', '2025-2026', 'stf-001', 35, 'Mon-Fri 07:30-14:30', '2025-09-01'],
      ['cls-002', 'inst-002', 'Grade 6B', 'Primary - Grade 6', 'General', '2025-2026', 'stf-002', 28, 'Mon-Fri 08:00-15:00', '2025-09-01'],
      ['cls-003', 'inst-003', 'Licence 2 - Génie Informatique', 'Undergraduate Year 2', 'Computer Engineering', '2025-2026', '', 120, 'Mon-Sat varied', '2025-09-01'],
      ['cls-004', 'inst-005', 'BSc Computer Science - Year 3', 'Undergraduate Year 3', 'Computer Science', '2025-2026', 'stf-004', 90, 'Sun-Thu varied', '2025-09-01'],
    ],
  },

  Attendance: {
    headers: [
      'id', 'institution_id', 'student_id', 'class_program_id', 'date',
      'status', 'recorded_by', 'note', 'synced_offline', 'created_at',
    ],
    sample: [
      ['att-001', 'inst-001', 'stu-001', 'cls-001', '2026-06-15', 'present', 'stf-001', '', 'FALSE', '2026-06-15'],
      ['att-002', 'inst-001', 'stu-002', 'cls-001', '2026-06-15', 'absent', 'stf-001', 'Sick leave', 'FALSE', '2026-06-15'],
      ['att-003', 'inst-002', 'stu-003', 'cls-002', '2026-06-15', 'present', 'stf-002', '', 'FALSE', '2026-06-15'],
      ['att-004', 'inst-003', 'stu-004', 'cls-003', '2026-06-15', 'late', 'stf-003', 'Arrived 15 min late', 'TRUE', '2026-06-15'],
    ],
  },

  Grades_Assessments: {
    headers: [
      'id', 'institution_id', 'student_id', 'class_program_id', 'subject_course',
      'assessment_type', 'term', 'score', 'max_score', 'grade_letter',
      'recorded_by', 'comments', 'created_at',
    ],
    sample: [
      ['grd-001', 'inst-001', 'stu-001', 'cls-001', 'Circuits I', 'Exam', 'Term 2', 15.5, 20, 'B', 'stf-001', 'Good progress', '2026-04-10'],
      ['grd-002', 'inst-001', 'stu-002', 'cls-001', 'Circuits I', 'Exam', 'Term 2', 11, 20, 'C', 'stf-001', 'Needs revision on AC theory', '2026-04-10'],
      ['grd-003', 'inst-002', 'stu-003', 'cls-002', 'Mathematics', 'Quiz', 'Term 2', 18, 20, 'A', 'stf-002', 'Excellent', '2026-04-12'],
      ['grd-004', 'inst-005', 'stu-005', 'cls-004', 'Data Structures', 'Midterm', 'Spring', 78, 100, 'B+', 'stf-004', '', '2026-03-20'],
    ],
  },

  Finance_Fees: {
    headers: [
      'id', 'institution_id', 'student_id', 'fee_type', 'amount_due',
      'amount_paid', 'currency', 'due_date', 'payment_date', 'payment_method',
      'status', 'receipt_no', 'recorded_by', 'created_at',
    ],
    sample: [
      ['fee-001', 'inst-001', 'stu-001', 'Tuition - Term 2', 75000, 75000, 'XAF', '2026-02-01', '2026-01-28', 'Mobile Money', 'paid', 'RCT-1001', 'usr-002', '2026-01-28'],
      ['fee-002', 'inst-001', 'stu-002', 'Tuition - Term 2', 75000, 30000, 'XAF', '2026-02-01', '2026-01-30', 'Cash', 'partial', 'RCT-1002', 'usr-002', '2026-01-30'],
      ['fee-003', 'inst-002', 'stu-003', 'Tuition - Term 2', 1200, 1200, 'GHS', '2026-02-05', '2026-02-01', 'Bank Transfer', 'paid', 'RCT-2001', 'usr-004', '2026-02-01'],
      ['fee-004', 'inst-003', 'stu-004', 'Tuition - Semester', 250000, 0, 'XOF', '2026-02-10', '', '', 'unpaid', '', 'usr-005', '2026-01-10'],
    ],
  },

  Admissions: {
    headers: [
      'id', 'institution_id', 'applicant_name', 'date_of_birth', 'gender',
      'desired_program', 'guardian_contact', 'previous_school', 'documents_url',
      'application_status', 'application_date', 'reviewed_by', 'decision_date', 'notes',
    ],
    sample: [
      ['adm-001', 'inst-001', 'Paul Etoundi', '2009-05-14', 'M', 'Électrotechnique', '+237699000999', 'CES Bonabéri', '', 'pending', '2026-05-20', '', '', ''],
      ['adm-002', 'inst-005', 'Layla Ibrahim', '2003-08-22', 'F', 'Computer Science', '+201000000999', 'Cairo Modern High', '', 'accepted', '2026-04-10', 'stf-004', '2026-04-20', 'Strong entrance score'],
    ],
  },

  Certificates_Documents: {
    headers: [
      'id', 'institution_id', 'student_id', 'document_type', 'reference_no',
      'issue_date', 'issued_by', 'verification_code', 'file_url', 'status',
    ],
    sample: [
      ['doc-001', 'inst-001', 'stu-001', 'Enrollment Certificate', 'CERT-2026-001', '2026-01-15', 'usr-002', 'VERIFY-AB12CD', '', 'issued'],
      ['doc-002', 'inst-003', 'stu-004', 'Transcript', 'TRX-2026-014', '2026-03-01', 'usr-005', 'VERIFY-XY99ZT', '', 'issued'],
    ],
  },

  Announcements_Notifications: {
    headers: [
      'id', 'institution_id', 'title', 'body', 'audience_role', 'language',
      'channel', 'sent_by', 'sent_at', 'status',
    ],
    sample: [
      ['ann-001', 'inst-001', 'Réunion des parents', 'Réunion parents-professeurs le 28 juin à 15h.', 'Parent', 'FR', 'in-app', 'usr-002', '2026-06-18', 'sent'],
      ['ann-002', 'inst-002', 'Exam Schedule Released', 'Term 2 final exam schedule is now available.', 'Student', 'EN', 'in-app,sms', 'usr-004', '2026-06-19', 'sent'],
    ],
  },

  AuditLog: {
    headers: [
      'id', 'institution_id', 'user_id', 'action', 'entity', 'entity_id',
      'source', 'device_id', 'timestamp',
    ],
    sample: [
      ['log-001', 'inst-001', 'usr-002', 'CREATE', 'Students', 'stu-001', 'online', 'web-chrome', '2025-09-01T08:00:00Z'],
      ['log-002', 'inst-003', 'usr-005', 'UPDATE', 'Grades_Assessments', 'grd-003', 'offline-sync', 'mobile-app-001', '2026-04-12T17:30:00Z'],
    ],
  },

  Settings: {
    headers: ['key', 'value', 'description'],
    sample: [
      ['default_language', 'FR', 'Default UI language for new institutions'],
      ['supported_languages', 'EN,FR,SP,AR', 'Languages enabled in the app'],
      ['app_name', 'CampusIQ Africa', 'Branding name shown in the UI'],
      ['offline_sync_interval_sec', '30', 'How often the client retries syncing the offline queue'],
      ['attendance_alert_threshold_pct', '80', 'Below this attendance %, trigger a risk flag'],
    ],
  },
};

module.exports = { SHEETS };
