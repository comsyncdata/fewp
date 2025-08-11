// How to run locally:
// 1) npm install
// 2) npm start
//
// This module resolves the final destination URL after following redirects.

/**
 * Resolve the final destination URL by following redirects.
 * @param {string} inputUrl
 * @param {object} options
 * @param {number} [options.timeoutMs=10000]
 * @returns {Promise<string>} final URL after redirects
 */
export async function resolveFinalUrl(inputUrl, options = {}) {
  const { timeoutMs = 10000 } = options;

  // Validate URL early to provide a clear error
  let validatedUrl;
  try {
    validatedUrl = new URL(inputUrl);
  } catch {
    throw new Error("Invalid URL. Provide an absolute URL starting with http:// or https://");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(validatedUrl.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        // Some servers behave better with an explicit User-Agent
        "User-Agent": "url-checker/1.0 (+https://example.local)",
        "Accept": "*/*"
      }
    });

    // response.url is the final URL after following redirects
    return response.url;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Timeout while resolving URL");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}