import crypto from 'node:crypto';

function toBase64Url(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const secret = process.env.JWT_SIGN_SECRET;
const email = process.env.CI_BRUNO_EMAIL;
const name = 'bruno';

if (!secret || !email) {
  console.error('Missing required env vars: JWT_SIGN_SECRET, CI_BRUNO_EMAIL');
  process.exit(1);
}

const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const payload = toBase64Url(
  JSON.stringify({
    name,
    email,
    password: 'ci',
    iat: Math.floor(Date.now() / 1000)
  })
);

const body = `${header}.${payload}`;
const signature = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

process.stdout.write(`${body}.${signature}`);
