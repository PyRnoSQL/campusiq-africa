const { insertRow } = require('./sheetsService');

async function logAction(user, action, entity, entityId, source = 'online', deviceId = '') {
  try {
    await insertRow('AuditLog', {
      institution_id: user.institution_id || '',
      user_id: user.id,
      action,
      entity,
      entity_id: entityId,
      source,
      device_id: deviceId || '',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Audit logging must never break the main request flow.
    console.error('Audit log failed:', err.message);
  }
}

module.exports = { logAction };
