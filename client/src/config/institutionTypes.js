/**
 * Drives type-aware behavior across the whole app. Every institution has a `type`
 * (set in the Institutions sheet/tab) of one of: 'General', 'Technical/Vocational',
 * 'University'. This config translates that into terminology, grading scales,
 * and which extra pages/widgets are relevant for that kind of institution.
 */

export const INSTITUTION_TYPES = ['General', 'Technical/Vocational', 'University'];

export const TYPE_CONFIG = {
  General: {
    label: 'General School',
    shortLabel: 'School',
    icon: 'school',
    gradeTerm: 'Grade',
    scoreScale: { max: 20, passMark: 10, format: (v) => `${v}/20` },
    classTerm: 'Class',
    staffTerm: 'Teacher',
    studentIdPrefix: 'STU',
    termLabel: 'Term',
    terms: ['Term 1', 'Term 2', 'Term 3'],
    dashboardWidgets: ['attendance_rate', 'collection_rate', 'risk_flags', 'pass_rate'],
    reportCardTitle: 'Bulletin Scolaire / Report Card',
    assessmentTypes: ['Devoir / Homework', 'Interrogation / Quiz', 'Composition Trimestrielle', 'Examen Final'],
    feeTypes: ['Frais de Scolarité', "Frais d'Inscription", 'Frais de Cantine', "Frais d'Examen", 'Transport scolaire', 'Uniforme & Fournitures'],
    extraNav: [],
  },
  'Technical/Vocational': {
    label: 'Technical / Vocational Institute',
    shortLabel: 'Vocational',
    icon: 'tool',
    gradeTerm: 'Competency Score',
    scoreScale: { max: 20, passMark: 10, format: (v) => `${v}/20` },
    classTerm: 'Cohort',
    staffTerm: 'Instructor',
    studentIdPrefix: 'TRN',
    termLabel: 'Module',
    terms: ['Module 1', 'Module 2', 'Module 3'],
    dashboardWidgets: ['attendance_rate', 'collection_rate', 'risk_flags', 'practical_completion'],
    reportCardTitle: 'Relevé de Compétences / Competency Record',
    assessmentTypes: ['Évaluation Théorique', 'Évaluation Pratique', 'Stage / Internship Review', 'Examen de Certification'],
    feeTypes: ['Frais de Formation', "Frais d'Inscription", 'Kit & Matériel Pratique', 'Frais de Certification', 'Hébergement'],
    extraNav: [{ to: 'practical', key: 'practical', labelFallback: 'Practical Assessments' }],
  },
  University: {
    label: 'University / Higher Ed',
    shortLabel: 'University',
    icon: 'graduation',
    gradeTerm: 'GPA',
    scoreScale: { max: 4, passMark: 2, format: (v) => Number(v).toFixed(2) },
    classTerm: 'Course Section',
    staffTerm: 'Lecturer',
    studentIdPrefix: 'UNI',
    termLabel: 'Semester',
    terms: ['Semester 1', 'Semester 2'],
    dashboardWidgets: ['attendance_rate', 'collection_rate', 'risk_flags', 'credit_completion'],
    reportCardTitle: 'Transcript',
    assessmentTypes: ['Contrôle Continu / Coursework', 'Examen Partiel / Midterm', 'Examen Final', 'Projet / Mémoire'],
    feeTypes: ["Frais d'Inscription Semestre", 'Frais de Scolarité', 'Frais de Bibliothèque', 'Frais de Laboratoire', 'Frais de Mémoire/Thèse', 'Logement universitaire'],
    extraNav: [{ to: 'catalog', key: 'catalog', labelFallback: 'Course Catalog' }],
  },
};

export function getTypeConfig(institutionType) {
  return TYPE_CONFIG[institutionType] || TYPE_CONFIG.General;
}

// Converts a raw score (assumed out of `max_score`) into the institution's
// display scale — e.g. a 78/100 score becomes "3.12" for a University (4.0 GPA)
// or stays "15.6/20" for a General school.
export function scoreToScale(score, maxScore, institutionType) {
  const cfg = getTypeConfig(institutionType);
  const pct = maxScore ? Number(score) / Number(maxScore) : 0;
  const scaled = pct * cfg.scoreScale.max;
  return { value: Math.round(scaled * 100) / 100, formatted: cfg.scoreScale.format(Math.round(scaled * 100) / 100) };
}
