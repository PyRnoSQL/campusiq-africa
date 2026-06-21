require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const institutionsRoutes = require('./routes/institutions');
const syncRoutes = require('./routes/sync');
const analyticsRoutes = require('./routes/analytics');
const {
  studentsRouter, staffRouter, classesRouter, attendanceRouter,
  gradesRouter, financeRouter, admissionsRouter, documentsRouter, announcementsRouter,
} = require('./routes');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet({ contentSecurityPolicy: false })); // CSP relaxed for PWA/manifest/SW; tighten per-deployment if needed
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));

const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 300 });
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'campusiq-africa', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/institutions', institutionsRoutes);
app.use('/api/students', studentsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/classes', classesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/grades', gradesRouter);
app.use('/api/finance', financeRouter);
app.use('/api/admissions', admissionsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/sync', syncRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve the built React PWA (client/dist) as static files, in the same Railway service.
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist, { maxAge: '1d' }));

// SPA fallback: any non-API route returns index.html so client-side routing works.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`CampusIQ Africa server listening on port ${PORT}`);
});
