const express = require('express');
const { findAll, findById, insertRow, updateRow, deleteRow } = require('../services/sheetsService');
const { authenticate, authorize, scopeToInstitution } = require('../middleware/auth');
const { logAction } = require('../services/auditService');

/**
 * Creates a standard REST router (list/get/create/update/delete) for a given
 * Google Sheets tab, with auth, institution scoping and audit logging baked in.
 */
function buildCrudRouter(tab, { writeRoles = [], readRoles = [] } = {}) {
  const router = express.Router();

  router.get('/', authenticate, scopeToInstitution, async (req, res) => {
    try {
      const filter = { ...req.query };
      delete filter.page;
      delete filter.limit;
      const rows = await findAll(tab, filter);
      res.json({ data: rows, count: rows.length });
    } catch (err) {
      res.status(500).json({ error: `Failed to list ${tab}`, details: err.message });
    }
  });

  router.get('/:id', authenticate, async (req, res) => {
    try {
      const row = await findById(tab, req.params.id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      if (req.user.role !== 'SuperAdmin' && row.institution_id && row.institution_id !== req.user.institution_id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      res.json({ data: row });
    } catch (err) {
      res.status(500).json({ error: `Failed to fetch ${tab}`, details: err.message });
    }
  });

  router.post('/', authenticate, authorize(...writeRoles), scopeToInstitution, async (req, res) => {
    try {
      const created = await insertRow(tab, req.body);
      await logAction(req.user, 'CREATE', tab, created.id, req.headers['x-sync-source'] || 'online', req.headers['x-device-id']);
      res.status(201).json({ data: created });
    } catch (err) {
      res.status(500).json({ error: `Failed to create ${tab} record`, details: err.message });
    }
  });

  router.put('/:id', authenticate, authorize(...writeRoles), async (req, res) => {
    try {
      const updated = await updateRow(tab, req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Not found' });
      await logAction(req.user, 'UPDATE', tab, req.params.id, req.headers['x-sync-source'] || 'online', req.headers['x-device-id']);
      res.json({ data: updated });
    } catch (err) {
      res.status(500).json({ error: `Failed to update ${tab} record`, details: err.message });
    }
  });

  router.delete('/:id', authenticate, authorize(...writeRoles), async (req, res) => {
    try {
      const result = await deleteRow(tab, req.params.id);
      if (!result) return res.status(404).json({ error: 'Not found' });
      await logAction(req.user, 'DELETE', tab, req.params.id, req.headers['x-sync-source'] || 'online', req.headers['x-device-id']);
      res.json({ data: result });
    } catch (err) {
      res.status(500).json({ error: `Failed to delete ${tab} record`, details: err.message });
    }
  });

  return router;
}

module.exports = { buildCrudRouter };
