const express = require('express');
const { insertRow, updateRow } = require('../services/sheetsService');
const { authenticate } = require('../middleware/auth');
const { logAction } = require('../services/auditService');

const router = express.Router();

const SYNCABLE_TABS = new Set([
  'Students', 'Staff', 'Classes_Programs', 'Attendance', 'Grades_Assessments',
  'Finance_Fees', 'Admissions', 'Certificates_Documents', 'Announcements_Notifications',
]);

/**
 * Body shape:
 * { operations: [
 *     { client_id, tab, action: 'create'|'update', payload, server_id? }
 * ] }
 *
 * Processes the queue built up by the PWA's IndexedDB while offline, in order.
 * Returns a per-operation result so the client can reconcile its local queue
 * (map client_id -> real server id, mark synced, or surface a conflict).
 */
router.post('/', authenticate, async (req, res) => {
  const { operations } = req.body;
  if (!Array.isArray(operations) || operations.length === 0) {
    return res.status(400).json({ error: 'operations must be a non-empty array' });
  }
  if (operations.length > 200) {
    return res.status(400).json({ error: 'Too many operations in one batch (max 200)' });
  }

  const results = [];
  for (const op of operations) {
    const { client_id, tab, action, payload, server_id } = op;
    try {
      if (!SYNCABLE_TABS.has(tab)) {
        results.push({ client_id, status: 'error', error: `Tab ${tab} is not syncable` });
        continue;
      }
      if (req.user.role !== 'SuperAdmin') {
        payload.institution_id = req.user.institution_id;
      }

      if (action === 'create') {
        const created = await insertRow(tab, payload);
        await logAction(req.user, 'CREATE', tab, created.id, 'offline-sync', req.headers['x-device-id']);
        results.push({ client_id, status: 'ok', server_id: created.id, record: created });
      } else if (action === 'update') {
        if (!server_id) {
          results.push({ client_id, status: 'error', error: 'server_id required for update' });
          continue;
        }
        const updated = await updateRow(tab, server_id, payload);
        if (!updated) {
          results.push({ client_id, status: 'error', error: 'Record not found (may have been deleted)' });
          continue;
        }
        await logAction(req.user, 'UPDATE', tab, server_id, 'offline-sync', req.headers['x-device-id']);
        results.push({ client_id, status: 'ok', server_id, record: updated });
      } else {
        results.push({ client_id, status: 'error', error: `Unknown action ${action}` });
      }
    } catch (err) {
      results.push({ client_id, status: 'error', error: err.message });
    }
  }

  res.json({ results, synced_at: new Date().toISOString() });
});

module.exports = router;
