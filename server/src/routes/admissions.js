const express = require('express');
const { findAll, findById, insertRow, updateRow } = require('../services/sheetsService');
const { authenticate, authorize, scopeToInstitution } = require('../middleware/auth');
const { logAction } = require('../services/auditService');

const router = express.Router();

// Public, no-auth endpoint — used by the public application form (/apply on the frontend).
// Anyone can submit an application for any active institution; institution staff then
// review/accept/reject it from inside the authenticated Admissions page.
router.post('/public', async (req, res) => {
  try {
    const { institution_id, applicant_name, date_of_birth, gender, desired_program, guardian_contact, previous_school } = req.body;
    if (!institution_id || !applicant_name || !desired_program) {
      return res.status(400).json({ error: 'institution_id, applicant_name and desired_program are required' });
    }
    const institution = await findById('Institutions', institution_id);
    if (!institution || institution.status !== 'active') {
      return res.status(404).json({ error: 'Institution not found or not accepting applications' });
    }
    const created = await insertRow('Admissions', {
      institution_id,
      applicant_name,
      date_of_birth: date_of_birth || '',
      gender: gender || '',
      desired_program,
      guardian_contact: guardian_contact || '',
      previous_school: previous_school || '',
      application_status: 'pending',
      application_date: new Date().toISOString().slice(0, 10),
    });
    res.status(201).json({ data: { id: created.id, application_status: 'pending' }, message: 'Application received' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit application', details: err.message });
  }
});

router.get('/', authenticate, scopeToInstitution, async (req, res) => {
  try {
    const filter = { ...req.query };
    const rows = await findAll('Admissions', filter);
    res.json({ data: rows, count: rows.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list admissions', details: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const row = await findById('Admissions', req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ data: row });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch application', details: err.message });
  }
});

router.post('/', authenticate, authorize('InstitutionAdmin'), scopeToInstitution, async (req, res) => {
  try {
    const created = await insertRow('Admissions', { ...req.body, application_status: req.body.application_status || 'pending', application_date: req.body.application_date || new Date().toISOString().slice(0, 10) });
    await logAction(req.user, 'CREATE', 'Admissions', created.id);
    res.status(201).json({ data: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create application', details: err.message });
  }
});

router.put('/:id', authenticate, authorize('InstitutionAdmin'), async (req, res) => {
  try {
    const patch = { ...req.body, reviewed_by: req.user.id };
    if (req.body.application_status && req.body.application_status !== 'pending') {
      patch.decision_date = new Date().toISOString().slice(0, 10);
    }
    const updated = await updateRow('Admissions', req.params.id, patch);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    await logAction(req.user, 'UPDATE', 'Admissions', req.params.id);
    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application', details: err.message });
  }
});

module.exports = router;
