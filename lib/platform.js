'use client';
/** iPhone/iPad (anche iPadOS che si presenta come Mac). NB: non usiamo la versione nello UA (iOS 26 riporta 18). */
export function isIOS() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}
export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.navigator.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches;
}
/** Safari "vero" (non WhatsApp/Instagram/Chrome iOS in-app) */
export function isIOSSafari() {
  if (!isIOS()) return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|FBAN|FBAV|Instagram|WhatsApp|Line\//.test(ua);
}
export function isInAppBrowser() {
  if (typeof navigator === 'undefined') return false;
  return /FBAN|FBAV|Instagram|WhatsApp|Line\/|GSA\//.test(navigator.userAgent);
}
export function pushSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}
