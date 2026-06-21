const { google } = require('googleapis');

/**
 * Builds an authenticated Google Sheets client using a service account.
 * Two supported ways to provide credentials (Railway-friendly):
 *  1) GOOGLE_SERVICE_ACCOUNT_JSON  -> the full JSON key as one env var (base64 OR raw JSON)
 *  2) GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY (separate env vars)
 */
function loadCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    try {
      const decoded = raw.trim().startsWith('{')
        ? raw
        : Buffer.from(raw, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (err) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON or base64-encoded JSON: ' + err.message);
    }
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  throw new Error(
    'Missing Google credentials. Set GOOGLE_SERVICE_ACCOUNT_JSON (full key file, base64 or raw) ' +
    'or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY in the environment.'
  );
}

let _sheetsClient = null;

function getSheetsClient() {
  if (_sheetsClient) return _sheetsClient;
  const credentials = loadCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  _sheetsClient = google.sheets({ version: 'v4', auth });
  return _sheetsClient;
}

function getSpreadsheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error('GOOGLE_SHEET_ID env var is not set.');
  return id;
}

module.exports = { getSheetsClient, getSpreadsheetId, loadCredentials };
