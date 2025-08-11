import { resolveFinalUrl } from "../src/checks/resolve.js";
import { isHttpsToHttpDowngrade } from "../src/checks/downgrade.js";
import { isListedInGSB } from "../src/checks/gsb.js";

async function main() {
  const inputUrl = process.argv[2] || "https://example.com";
  try {
    const finalUrl = await resolveFinalUrl(inputUrl, { timeoutMs: 8000 });
    const httpsToHttp = isHttpsToHttpDowngrade(inputUrl, finalUrl);
    const gsbListed = await isListedInGSB(finalUrl, { timeoutMs: 8000 });

    const result = {
      input_url: inputUrl,
      final_url: finalUrl,
      https_to_http: httpsToHttp,
      gsb_listed: gsbListed
    };
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Error:", err?.message || String(err));
    process.exitCode = 1;
  }
}

main();