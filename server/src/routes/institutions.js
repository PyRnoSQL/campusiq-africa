const express = require('express');
const { findAll, findById, insertRow, updateRow } = require('../services/sheetsService');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../services/auditService');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'SuperAdmin') {
      const rows = await findAll('Institutions');
      return res.json({ data: rows, count: rows.length });
    }
    const row = await findById('Institutions', req.user.institution_id);
    res.json({ data: row ? [row] : [], count: row ? 1 : 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list institutions', details: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const row = await findById('Institutions', req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ data: row });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch institution', details: err.message });
  }
});

router.post('/', authenticate, authorize('SuperAdmin'), async (req, res) => {
  try {
    const created = await insertRow('Institutions', req.body);
    await logAction(req.user, 'CREATE', 'Institutions', created.id);
    res.status(201).json({ data: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create institution', details: err.message });
  }
});

router.put('/:id', authenticate, authorize('SuperAdmin', 'InstitutionAdmin'), async (req, res) => {
  try {
    if (req.user.role === 'InstitutionAdmin' && req.user.institution_id !== req.params.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const updated = await updateRow('Institutions', req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    await logAction(req.user, 'UPDATE', 'Institutions', req.params.id);
    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update institution', details: err.message });
  }
});

module.exports = router;
