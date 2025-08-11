// How to run locally:
// 1) npm install
// 2) npm start
//
// This module checks a URL against Google Safe Browsing v4 threat lists.

const DEFAULT_GSB_API_KEY = "AIzaSyARWa0n7rEQUIiRtUL-hhmfq-KlyKFNLYM"; // Provided by user

/**
 * Check if a URL is listed in Google Safe Browsing.
 * @param {string} urlToCheck
 * @param {object} options
 * @param {string} [options.apiKey] Optional API key override. Defaults to env GSB_API_KEY or provided key.
 * @param {number} [options.timeoutMs=10000]
 * @returns {Promise<boolean>} true if listed, false otherwise
 */
export async function isListedInGSB(urlToCheck, options = {}) {
  const { apiKey = process.env.GSB_API_KEY || DEFAULT_GSB_API_KEY, timeoutMs = 10000 } = options;

  if (!apiKey) {
    // If missing key, safest to treat as not listed but report clearly via error to caller if they want
    throw new Error("Google Safe Browsing API key not configured");
  }

  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey)}`;

  const body = {
    client: {
      clientId: "url-checker",
      clientVersion: "1.0"
    },
    threatInfo: {
      threatTypes: [
        "MALWARE",
        "SOCIAL_ENGINEERING",
        "UNWANTED_SOFTWARE",
        "POTENTIALLY_HARMFUL_APPLICATION"
      ],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url: urlToCheck }]
    }
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`GSB request failed: HTTP ${response.status} ${response.statusText} ${text}`.trim());
    }

    const data = await response.json();
    // API returns { matches: [...] } when listed; otherwise empty object
    return Array.isArray(data?.matches) && data.matches.length > 0;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Timeout while querying Google Safe Browsing");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}