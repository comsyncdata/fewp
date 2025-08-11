// How to run locally:
// 1) npm install
// 2) npm start
//
// This module detects HTTPS -> HTTP downgrades between two URLs.

/**
 * Determine whether navigating from originalUrl to finalUrl downgrades from HTTPS to HTTP.
 * @param {string} originalUrl
 * @param {string} finalUrl
 * @returns {boolean}
 */
export function isHttpsToHttpDowngrade(originalUrl, finalUrl) {
  if (!originalUrl || !finalUrl) return false;
  const originalLower = String(originalUrl).toLowerCase();
  const finalLower = String(finalUrl).toLowerCase();
  return originalLower.startsWith("https://") && finalLower.startsWith("http://");
}