import 'server-only';
import crypto from 'node:crypto';

function key() {
  const secret = process.env.DRAW_SECRET;
  if (!secret || secret.length < 16) throw new Error('DRAW_SECRET mancante o troppo corto');
  return crypto.createHash('sha256').update(secret).digest();
}

/** Cifra un testo con AES-256-GCM → "iv.tag.dati" (base64url). */
export function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map((b) => b.toString('base64url')).join('.');
}

export function decrypt(payload) {
  const [iv, tag, enc] = String(payload).split('.').map((s) => Buffer.from(s, 'base64url'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}
