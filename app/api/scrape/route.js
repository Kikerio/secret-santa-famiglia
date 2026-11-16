export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import dns from 'node:dns/promises';
import net from 'node:net';
import { json, fail, requireUser } from '@/lib/server';

const BLOCKED = /(^|\.)(amazon\.[a-z.]+|amzn\.[a-z]+)$/i;

function isPrivate(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const l = ip.toLowerCase();
  return l === '::1' || l === '::' || l.startsWith('fc') || l.startsWith('fd') || l.startsWith('fe80') || l.startsWith('::ffff:');
}

function decode(s = '') {
  return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/\s+/g, ' ').trim();
}

function meta(html, keys) {
  for (const k of keys) {
    const re1 = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${k}["'][^>]*content=["']([^"']*)["']`, 'i');
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name|itemprop)=["']${k}["']`, 'i');
    const m = html.match(re1) || html.match(re2);
    if (m && m[1]) return decode(m[1]);
  }
  return null;
}

function findProduct(node) {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) { for (const n of node) { const r = findProduct(n); if (r) return r; } return null; }
  const t = node['@type'];
  if (t === 'Product' || (Array.isArray(t) && t.includes('Product'))) return node;
  if (node['@graph']) return findProduct(node['@graph']);
  return null;
}

function parsePrice(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/[’'\s]/g, '').replace(/CHF|Fr\.?|SFr\.?/gi, '').replace(/[–-]+$/, '');
  const m = s.match(/\d+(?:[.,]\d{1,2})?/);
  if (!m) return null;
  const n = parseFloat(m[0].replace(',', '.'));
  return Number.isFinite(n) && n >= 0 && n < 100000 ? Math.round(n * 100) / 100 : null;
}

export async function POST(req) {
  const { error } = await requireUser(req);
  if (error) return error;
  const { url } = await req.json().catch(() => ({}));
  let u;
  try { u = new URL(String(url).trim()); } catch { return fail('Link non valido'); }
  if (!/^https?:$/.test(u.protocol)) return fail('Link non valido');
  const storeGuess = u.hostname.replace(/^www\./, '').split('.').slice(-2, -1)[0];
  const store = storeGuess ? storeGuess.charAt(0).toUpperCase() + storeGuess.slice(1) : null;
  if (BLOCKED.test(u.hostname)) return json({ ok: false, blocked: true, store, url: u.toString() });

  try {
    const { address } = await dns.lookup(u.hostname);
    if (isPrivate(address)) return fail('Link non consentito');
  } catch { return fail('Sito non raggiungibile'); }

  let html = '';
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(u, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'it-CH,it;q=0.9,de-CH;q=0.8',
      },
    });
    clearTimeout(t);
    if (!res.ok) return json({ ok: false, blocked: true, store, url: u.toString() });
    const reader = res.body.getReader();
    let total = 0; const chunks = [];
    while (total < 1_500_000) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value); total += value.length;
    }
    try { reader.cancel(); } catch {}
    html = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8');
  } catch {
    return json({ ok: false, blocked: true, store, url: u.toString() });
  }

  let product = null;
  const scripts = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const s of scripts) {
    try { product = findProduct(JSON.parse(s[1].trim())); if (product) break; } catch {}
  }

  let title = product?.name ? decode(String(product.name)) : null;
  let image = product?.image ? (Array.isArray(product.image) ? product.image[0] : product.image) : null;
  if (image && typeof image === 'object') image = image.url || image.contentUrl || null;
  let price = null, currency = null;
  const offers = product?.offers ? (Array.isArray(product.offers) ? product.offers[0] : product.offers) : null;
  if (offers) {
    price = parsePrice(offers.price ?? offers.lowPrice ?? offers.priceSpecification?.price);
    currency = offers.priceCurrency || offers.priceSpecification?.priceCurrency || null;
  }
  title = title || meta(html, ['og:title', 'twitter:title']) || decode((html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '');
  image = image || meta(html, ['og:image', 'og:image:secure_url', 'twitter:image']);
  if (price === null) {
    price = parsePrice(meta(html, ['product:price:amount', 'og:price:amount', 'price']));
    currency = currency || meta(html, ['product:price:currency', 'og:price:currency', 'priceCurrency']);
  }
  const siteName = meta(html, ['og:site_name']) || store;
  if (currency && currency.toUpperCase() !== 'CHF') price = null; // solo CHF
  if (image) { try { image = new URL(image, u).toString(); } catch { image = null; } }
  if (image && !/^https?:/.test(image)) image = null;

  const ok = !!title && !/access denied|robot|captcha|just a moment/i.test(title);
  return json({
    ok,
    blocked: !ok,
    url: u.toString(),
    title: ok ? title.slice(0, 160) : null,
    image_url: ok ? image : null,
    store: siteName ? String(siteName).slice(0, 40) : store,
    price_chf: ok ? price : null,
  });
}
