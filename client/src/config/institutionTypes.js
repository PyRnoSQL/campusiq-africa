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
    gradeTerm: 'Grade',
    scoreScale: { max: 20, passMark: 10, format: (v) => `${v}/20` },
    classTerm: 'Class',
    staffTerm: 'Teacher',
    studentIdPrefix: 'STU',
    dashboardWidgets: ['attendance_rate', 'collection_rate', 'risk_flags', 'class_distribution'],
    reportCardTitle: 'Bulletin Scolaire / Report Card',
    extraNav: [],
  },
  'Technical/Vocational': {
    label: 'Technical / Vocational Institute',
    shortLabel: 'Vocational',
    gradeTerm: 'Competency Score',
    scoreScale: { max: 20, passMark: 10, format: (v) => `${v}/20` },
    classTerm: 'Cohort',
    staffTerm: 'Instructor',
    studentIdPrefix: 'TRN',
    dashboardWidgets: ['attendance_rate', 'collection_rate', 'risk_flags', 'practical_completion'],
    reportCardTitle: 'Relevé de Compétences / Competency Record',
    extraNav: [{ to: 'practical', key: 'practical', labelFallback: 'Practical Assessments' }],
  },
  University: {
    label: 'University / Higher Ed',
    shortLabel: 'University',
    gradeTerm: 'GPA',
    scoreScale: { max: 4, passMark: 2, format: (v) => Number(v).toFixed(2) },
    classTerm: 'Course Section',
    staffTerm: 'Lecturer',
    studentIdPrefix: 'UNI',
    dashboardWidgets: ['attendance_rate', 'collection_rate', 'risk_flags', 'credit_completion'],
    reportCardTitle: 'Transcript',
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
