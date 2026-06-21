const { v4: uuidv4 } = require('uuid');
const NodeCache = require('node-cache');
const { getSheetsClient, getSpreadsheetId } = require('../config/sheets');
const { SHEETS } = require('../config/sheetsSchema');

// Short-lived cache to keep us well under Sheets API quota (60 reads/min/user default).
const cache = new NodeCache({ stdTTL: 15, checkperiod: 5 });

function headersOf(tab) {
  const def = SHEETS[tab];
  if (!def) throw new Error(`Unknown sheet tab: ${tab}`);
  return def.headers;
}

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? row[i] : ''; });
  return obj;
}

function objectToRow(headers, obj) {
  return headers.map((h) => (obj[h] !== undefined && obj[h] !== null ? obj[h] : ''));
}

async function getAllRows(tab, { useCache = true } = {}) {
  const cacheKey = `tab:${tab}`;
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached) return cached;
  }
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const headers = headersOf(tab);
  const lastCol = String.fromCharCode(64 + headers.length); // supports up to column Z
  const range = `${tab}!A2:${lastCol}`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = (res.data.values || []).map((row) => rowToObject(headers, row));
  cache.set(cacheKey, rows);
  return rows;
}

function invalidate(tab) {
  cache.del(`tab:${tab}`);
}

async function findAll(tab, filter = {}) {
  const rows = await getAllRows(tab);
  const keys = Object.keys(filter);
  if (keys.length === 0) return rows;
  return rows.filter((r) => keys.every((k) => String(r[k]) === String(filter[k])));
}

async function findById(tab, id) {
  const rows = await getAllRows(tab);
  return rows.find((r) => r.id === id) || null;
}

async function insertRow(tab, data) {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const headers = headersOf(tab);
  const record = { ...data };
  if (headers.includes('id') && !record.id) record.id = `${tab.slice(0, 3).toLowerCase()}-${uuidv4().slice(0, 8)}`;
  if (headers.includes('created_at') && !record.created_at) record.created_at = new Date().toISOString();
  const row = objectToRow(headers, record);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
  invalidate(tab);
  return record;
}

// Updates a row matched by id. Re-reads sheet to find the physical row index (header = row 1).
async function updateRow(tab, id, patch) {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const headers = headersOf(tab);
  const lastCol = String.fromCharCode(64 + headers.length);
  const range = `${tab}!A2:${lastCol}`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const values = res.data.values || [];
  const idx = values.findIndex((row) => row[0] === id);
  if (idx === -1) return null;
  const existing = rowToObject(headers, values[idx]);
  const updated = { ...existing, ...patch };
  if (headers.includes('updated_at')) updated.updated_at = new Date().toISOString();
  const newRow = objectToRow(headers, updated);
  const targetRange = `${tab}!A${idx + 2}:${lastCol}${idx + 2}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: targetRange,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [newRow] },
  });
  invalidate(tab);
  return updated;
}

async function deleteRow(tab, id) {
  // Soft delete pattern: if the table has a status/employment_status/enrollment_status column,
  // we mark it inactive rather than physically removing the row (keeps audit trail intact).
  const headers = headersOf(tab);
  const statusField = ['status', 'enrollment_status', 'employment_status', 'application_status']
    .find((f) => headers.includes(f));
  if (statusField) {
    return updateRow(tab, id, { [statusField]: 'inactive' });
  }
  return updateRow(tab, id, {});
}

module.exports = {
  getAllRows, findAll, findById, insertRow, updateRow, deleteRow, invalidate, headersOf,
};
