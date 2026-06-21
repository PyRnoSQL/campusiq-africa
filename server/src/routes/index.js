const { buildCrudRouter } = require('../utils/routeFactory');

const studentsRouter = buildCrudRouter('Students', { writeRoles: ['InstitutionAdmin', 'Teacher'] });
const staffRouter = buildCrudRouter('Staff', { writeRoles: ['InstitutionAdmin'] });
const classesRouter = buildCrudRouter('Classes_Programs', { writeRoles: ['InstitutionAdmin'] });
const attendanceRouter = buildCrudRouter('Attendance', { writeRoles: ['InstitutionAdmin', 'Teacher'] });
const gradesRouter = buildCrudRouter('Grades_Assessments', { writeRoles: ['InstitutionAdmin', 'Teacher'] });
const financeRouter = buildCrudRouter('Finance_Fees', { writeRoles: ['InstitutionAdmin'] });
const admissionsRouter = buildCrudRouter('Admissions', { writeRoles: ['InstitutionAdmin'] });
const documentsRouter = buildCrudRouter('Certificates_Documents', { writeRoles: ['InstitutionAdmin'] });
const announcementsRouter = buildCrudRouter('Announcements_Notifications', { writeRoles: ['InstitutionAdmin', 'Teacher'] });

module.exports = {
  studentsRouter,
  staffRouter,
  classesRouter,
  attendanceRouter,
  gradesRouter,
  financeRouter,
  admissionsRouter,
  documentsRouter,
  announcementsRouter,
};
