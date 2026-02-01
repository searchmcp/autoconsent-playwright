# autoconsent-playwright

A tiny build wrapper that bundles **DuckDuckGo Autoconsent** (with all rule sets) into a **single, minified IIFE** you can inject as a **Playwright init script**. Perfect for Java/JS Playwright crawlers that want cookie banners auto-dismissed (opt-out by default) without shipping rule details to the app layer.

![latest release](https://img.shields.io/github/v/release/searchmcp/autoconsent-playwright)
![build](https://img.shields.io/github/actions/workflow/status/searchmcp/autoconsent-playwright/release.yml?branch=main)

> **License:** MIT  
> **Upstream:** [duckduckgo/autoconsent](https://github.com/duckduckgo/autoconsent)

---

## What this project does

- Bundles **Autoconsent core** + **all public rules**:
  - `rules/rules.json` (DuckDuckGo curated)
  - `rules/consentomatic.json` (Consent-O-Matic)
  - `rules/compact-rules.json` (compacted)
- Emits: `dist/autoconsent.playwright.js` (minified, IIFE)
- Provides a **single readiness flag** `window.acDone` you can wait for from Playwright (no selectors leaked to your code).

---

## Install & Build

```bash
git clone https://github.com/your-org/autoconsent-playwright
cd autoconsent-playwright
npm install
npm run build
# => dist/autoconsent.playwright.js
```

---

## Usage

### Java (Playwright)

```java
import com.microsoft.playwright.*;
import java.nio.file.Paths;
import com.microsoft.playwright.options.WaitForFunctionOptions;

try (Playwright pw = Playwright.create()) {
  Browser browser = pw.chromium().launch();
  BrowserContext ctx = browser.newContext();

  // Inject before any page scripts:
  ctx.addInitScript(Paths.get("dist/autoconsent.playwright.js"));

  Page page = ctx.newPage();
  page.navigate("https://example.com");

  // Wait for autoconsent to signal completion:
  page.waitForFunction("() => window.acDone === true",
      new WaitForFunctionOptions().setTimeout(10_000));

  // Now scrape:
  String html = page.content();
  browser.close();
}
```

### JS/TS (Playwright)

```ts
const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  await ctx.addInitScript({ path: "dist/autoconsent.playwright.js" });

  const page = await ctx.newPage();
  await page.goto("https://example.com");
  await page.waitForFunction(() => window.acDone === true, { timeout: 10_000 });
  // scrape...
  await browser.close();
})();
```

---

## Runtime config (optional)

Set `window.__AUTOCONSENT_CONFIG` **before** page scripts to override defaults:

```js
// Example (via another init script you add before ours)
window.__AUTOCONSENT_CONFIG = {
  enabled: true,
  autoAction: "optOut",        // "optOut" | "optIn" | undefined
  enableCosmeticRules: true,
  enableFilterList: true,
  logs: { lifecycle: true, errors: true }
};
```

---

## Releasing

This repo ships a **GitHub Actions** workflow (`.github/workflows/release.yml`) that:
- bumps **minor** version,
- rebuilds `dist/autoconsent.playwright.js`,
- updates README’s “Last release” line,
- tags & pushes,
- **creates a GitHub Release** attaching the built artifact.

Trigger it from the **Actions** tab (workflow_dispatch).

**Last release:** <!--LAST_RELEASE-->v1.7.0 on 2026-02-01<!--/LAST_RELEASE-->

---

## License

[MIT](./LICENSE)
