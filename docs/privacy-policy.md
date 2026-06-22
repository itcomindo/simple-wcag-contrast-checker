# Privacy Policy — Simple WCAG Contrast Checker

**Draft for publication.** The final privacy policy must be published at:

**https://hardawebpro.com/privacy-policy/simple-wcag-contrast-checker/**

**Publisher:** HardaWebPro  
**Extension:** Simple WCAG Contrast Checker  
**Last updated:** June 23, 2026

This draft is based on review of the extension source code (`manifest.json`, `background.js`, `content.js`, `style.css`) as of the date above. Update this document if extension behavior changes.

## Overview

Simple WCAG Contrast Checker is a browser extension that checks text color contrast on web pages you choose to scan. This policy describes what information the extension accesses, stores, and processes on your device.

## Information the Extension Accesses

When you activate the extension on a web page, it processes page data locally in your browser to perform contrast checks. This includes:

- **Visible text content:** The extension walks text nodes on the page to find elements to evaluate.
- **Computed styles:** It reads CSS computed values such as text color, background color, font size, font weight, opacity, visibility, and display properties.
- **Element metadata:** For elements that fail contrast checks, the extension may display the HTML tag name and a short text preview (up to 20 characters) in the issues summary.
- **Generated CSS selectors:** When you select an element, the extension builds a CSS selector string from the element's tag, id, or class names.

This page data is used only to calculate contrast ratios and display results in the extension UI. The reviewed source code does not transmit page content, URLs, or scan results to HardaWebPro or third-party servers.

## Information Stored on Your Device

The extension stores one setting locally using Chrome's `chrome.storage.local` API:

| Key | Purpose |
|-----|------|
| `mm_wcag_active` | Remembers whether the contrast checker panel was open so it can reopen after a page refresh in the same tab |

This setting is stored on your device and is not synced or uploaded by the extension code reviewed for this policy.

## Clipboard Access

If you click the **Copy** button in the CSS selector tooltip, the extension writes the generated CSS selector to your system clipboard using the browser clipboard API. This action occurs only when you initiate it.

## Page Modifications

The extension injects UI overlays and a side panel into the active page. If you use the live color editor, the extension may apply temporary inline styles to the selected element for preview purposes. These changes affect only your local browser view of the page.

## What the Extension Does Not Do

Based on the reviewed source code, the extension does **not**:

- Send page content, browsing history, or scan results to external servers
- Use analytics, telemetry, or crash reporting SDKs
- Display advertising or use affiliate links
- Load or execute remote code from external servers
- Call external APIs or third-party services
- Create user accounts or collect contact information

## Permissions

The extension requests these Chrome permissions:

- **`activeTab`:** Interact with the tab you are viewing when you click the extension icon.
- **`scripting`:** Inject the content script into the active tab when needed.
- **`storage`:** Save the panel open or closed state locally.

## Children's Privacy

This extension is a developer and design utility. It is not directed at children and does not knowingly collect personal information.

## Changes to This Policy

HardaWebPro may update this privacy policy if the extension's data practices change. The published version at the URL above will reflect the current policy.

## Contact and Support

For questions about this extension or privacy practices, visit:

**https://hardawebpro.com/support/**

Do not rely on this draft URL for store submission until the final policy is published on the HardaWebPro website.
