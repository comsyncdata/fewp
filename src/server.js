/**
 * How to run locally:
 * - Requires Node.js >= 18 (global fetch available)
 * - Install dependencies: `npm install`
 * - Start server: `npm start`
 * - Request example:
 *   GET http://localhost:3000/check?url=https://example.com
 */

import express from "express";
import { resolveFinalUrl } from "./checks/resolve.js";
import { isHttpsToHttpDowngrade } from "./checks/downgrade.js";
import { isListedInGSB } from "./checks/gsb.js";

const app = express();
const port = process.env.PORT || 3000;

app.get("/check", async (req, res) => {
  const inputUrl = String(req.query.url || "").trim();

  if (!inputUrl) {
    return res.status(400).json({
      error: "Missing required query parameter 'url'",
      input_url: null,
      final_url: null,
      https_to_http: false,
      gsb_listed: false
    });
  }

  // Validate minimally that a scheme is present
  if (!/^https?:\/\//i.test(inputUrl)) {
    return res.status(400).json({
      error: "Invalid URL. Must start with http:// or https://",
      input_url: inputUrl,
      final_url: null,
      https_to_http: false,
      gsb_listed: false
    });
  }

  try {
    // Step 1: Resolve redirects to get final destination URL
    const finalUrl = await resolveFinalUrl(inputUrl);

    // Step 2: Detect HTTPS -> HTTP downgrade
    const httpsToHttp = isHttpsToHttpDowngrade(inputUrl, finalUrl);

    // Step 3: Check Google Safe Browsing for the final URL
    const gsbListed = await isListedInGSB(finalUrl);

    return res.json({
      input_url: inputUrl,
      final_url: finalUrl,
      https_to_http: httpsToHttp,
      gsb_listed: gsbListed
    });
  } catch (error) {
    return res.status(502).json({
      error: error?.message || String(error),
      input_url: inputUrl,
      final_url: null,
      https_to_http: false,
      gsb_listed: false
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});