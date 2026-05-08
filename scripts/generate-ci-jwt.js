import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;
const email = process.env.CI_USER;
const name = 'bruno';

if (!secret || !email) {
  console.error('Missing required env vars: JWT_SECRET, CI_USER');
  process.exit(1);
}

const token = jwt.sign(
  {
    name,
    email,
    password: 'ci'
  },
  secret
);

process.stdout.write(token);
