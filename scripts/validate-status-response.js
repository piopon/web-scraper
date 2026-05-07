import fs from 'node:fs';

const statusFilePath = process.argv[2];

if (!statusFilePath) {
  console.error('Missing status response file path argument.');
  process.exit(1);
}

let payload;
try {
  payload = JSON.parse(fs.readFileSync(statusFilePath, 'utf8'));
} catch {
  console.error('Runtime smoke check failed: status response is not valid JSON.');
  process.exit(1);
}

if (!payload || typeof payload !== 'object') {
  console.error('Runtime smoke check failed: status payload is not an object.');
  process.exit(1);
}

if (!('app' in payload)) {
  console.error('Runtime smoke check failed: status payload is missing app field.');
  process.exit(1);
}

if (!('version' in payload)) {
  console.error('Runtime smoke check failed: status payload is missing version field.');
  process.exit(1);
}

if (!Array.isArray(payload.components)) {
  console.error('Runtime smoke check failed: status payload is missing components array.');
  process.exit(1);
}
