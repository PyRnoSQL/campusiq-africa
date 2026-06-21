/**
 * One-time setup script.
 *
 * Usage:
 *   1) Create a Google Cloud service account, enable the Sheets API, download the JSON key.
 *   2) Create a blank Google Sheet, share it with the service account email (Editor access).
 *   3) Set env vars: GOOGLE_SHEET_ID, and either GOOGLE_SERVICE_ACCOUNT_JSON
 *      (paste the whole key file content, base64-encoded recommended) or
 *      GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY.
 *   4) Run: npm run setup:sheets
 *
 * This creates every tab defined in src/config/sheetsSchema.js, writes the header
 * row, and seeds it with realistic sample data so the app is demoable immediately.
 * Re-running is safe: existing tabs are cleared and rewritten (idempotent).
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getSheetsClient, getSpreadsheetId } = require('../src/config/sheets');
const { SHEETS } = require('../src/config/sheetsSchema');

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Campus2026!';
// Set SEED_SAMPLE_DATA=false to create only headers (production-blank setup) —
// useful when onboarding real institutions instead of demoing with sample data.
const SEED_SAMPLE_DATA = (process.env.SEED_SAMPLE_DATA || 'true').toLowerCase() !== 'false';

async function ensureTabExists(sheets, spreadsheetId, existingTitles, title) {
  if (existingTitles.includes(title)) return;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ addSheet: { properties: { title } } }] },
  });
  console.log(`  + created tab "${title}"`);
}

async function writeTabData(sheets, spreadsheetId, tabName, headers, sampleRows) {
  // Clear any existing content first so re-runs are idempotent.
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${tabName}!A1:ZZ10000`,
  });

  const rows = [headers, ...sampleRows];
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });

  // Freeze header row + bold it for readability.
  const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = sheetMeta.data.sheets.find((s) => s.properties.title === tabName);
  const sheetId = sheet.properties.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        { updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } },
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.11, green: 0.16, blue: 0.32 }, textColor: { red: 1, green: 1, blue: 1 } } },
            fields: 'userEnteredFormat(textFormat,backgroundColor,textColor)',
          },
        },
      ],
    },
  });
}

async function main() {
  console.log('Setting up CampusIQ Africa Google Sheets backend...');
  console.log(`Mode: ${SEED_SAMPLE_DATA ? 'WITH sample/demo data' : 'BLANK (headers only, production)'}`);
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTitles = meta.data.sheets.map((s) => s.properties.title);

  const schema = JSON.parse(JSON.stringify(SHEETS));

  if (SEED_SAMPLE_DATA) {
    // Hash demo passwords for the Users sample rows before writing.
    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const userHeaders = schema.Users.headers;
    const pwIndex = userHeaders.indexOf('password_hash');
    schema.Users.sample = schema.Users.sample.map((row) => {
      const copy = [...row];
      copy[pwIndex] = hash;
      return copy;
    });
  } else {
    // Blank production mode: every tab gets headers only — EXCEPT Users and Settings,
    // which always need at least one working SuperAdmin account and base config so
    // you can actually log in and start onboarding institutions.
    const adminPassword = process.env.SUPERADMIN_PASSWORD || DEMO_PASSWORD;
    const adminEmail = process.env.SUPERADMIN_EMAIL || 'admin@campusiq.africa';
    const adminName = process.env.SUPERADMIN_NAME || 'Super Admin';
    const hash = await bcrypt.hash(adminPassword, 10);

    for (const def of Object.values(schema)) def.sample = [];

    schema.Users.sample = [
      ['usr-001', '', adminName, adminEmail, '', hash, 'SuperAdmin', 'EN', '', 'active', '', new Date().toISOString()],
    ];
    schema.Settings.sample = [
      ['default_language', 'FR', 'Default UI language for new institutions'],
      ['supported_languages', 'EN,FR,SP,AR', 'Languages enabled in the app'],
      ['app_name', 'CampusIQ Africa', 'Branding name shown in the UI'],
      ['offline_sync_interval_sec', '30', 'How often the client retries syncing the offline queue'],
      ['attendance_alert_threshold_pct', '80', 'Below this attendance %, trigger a risk flag'],
    ];
  }

  for (const [tabName, def] of Object.entries(schema)) {
    console.log(`Tab: ${tabName}`);
    await ensureTabExists(sheets, spreadsheetId, existingTitles, tabName);
    await writeTabData(sheets, spreadsheetId, tabName, def.headers, def.sample);
    console.log(`  ✓ wrote ${def.sample.length} row(s)`);
  }

  // Remove default "Sheet1" if it's still empty and unused.
  const finalMeta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet1 = finalMeta.data.sheets.find((s) => s.properties.title === 'Sheet1');
  if (sheet1 && finalMeta.data.sheets.length > 1) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ deleteSheet: { sheetId: sheet1.properties.sheetId } }] },
    });
    console.log('Removed unused default "Sheet1"');
  }

  if (SEED_SAMPLE_DATA) {
    console.log('\nDone! All sample users share the demo password:', DEMO_PASSWORD);
    console.log('Example login: admin@campusiq.africa /', DEMO_PASSWORD);
  } else {
    console.log('\nDone! Sheet is blank and ready for real institutions.');
    console.log(`Log in with: ${process.env.SUPERADMIN_EMAIL || 'admin@campusiq.africa'} / ${process.env.SUPERADMIN_PASSWORD || DEMO_PASSWORD}`);
    console.log('Change this password immediately after first login.');
  }
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
