# Chrome Web Store Listing — Simple WCAG Contrast Checker

Draft text for manual entry in the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole). Verify all fields against the current extension source before submission.

## Extension Name

Simple WCAG Contrast Checker

## Short Description

Checks color contrast on the current page against WCAG contrast requirements.

## Full Store Description

Simple WCAG Contrast Checker helps developers and designers find text on the current web page that may not meet WCAG color contrast ratio requirements.

Open the extension on any page to scan visible text, highlight elements that fail WCAG AA contrast thresholds, and review a summary list of issues. Click a highlighted element or a summary item to inspect foreground and background colors, view AA and AAA pass or fail results, and test alternate colors with a live editor.

Features include:

- Automatic page scan for text contrast failures
- Visual overlay highlights with contrast ratio labels
- Issues summary with click-to-navigate
- Live foreground and background color editor
- WCAG AA and AAA ratio badges for the selected element
- CSS selector copy for the selected element
- Rescan after page changes
- Panel state persistence across page refresh
- Press Esc to close the panel

**Important:** This extension checks color contrast only. It does not certify full WCAG compliance, perform complete accessibility audits, or represent official W3C endorsement.

Published by HardaWebPro.

## Single Purpose Description

This extension has a single purpose: to check text color contrast on the active web page against WCAG contrast ratio requirements and help users inspect failing elements.

## Recommended Category

**Developer Tools**

The extension scans page styles, highlights contrast issues, copies CSS selectors, and supports live color preview for development and design workflows.

Alternative category if Developer Tools is unavailable: **Productivity**.

## Publisher Name

HardaWebPro

## Official URL

https://hardawebpro.com/

## Homepage URL

https://hardawebpro.com/

## Support URL

https://hardawebpro.com/support/

## Privacy Policy URL

https://hardawebpro.com/privacy-policy/simple-wcag-contrast-checker/

## Permission Justifications

### `activeTab`

Required so the extension can interact with the tab the user is viewing when they click the toolbar icon. The background service worker sends messages to the active tab to open or close the contrast checker panel.

### `scripting`

Used as a fallback when the content script is not yet injected in the active tab. If messaging fails, the extension injects `content.js` into the current tab so the user can run a contrast scan without reloading the page.

### `storage`

Used to store one local setting: whether the contrast checker panel was open (`mm_wcag_active`). This allows the panel to reopen automatically after a page refresh in the same tab. Data is stored with `chrome.storage.local` on the user's device.

## Remote Code Declaration

**Does the extension use remote code?** No.

All extension logic runs from local bundled files (`background.js`, `content.js`, `style.css`). The extension does not load executable code from external servers, CDNs, or remote APIs.

## Data-Use Disclosure Draft

Use this draft when completing the Chrome Web Store privacy practices form and your published privacy policy.

### Data the extension accesses on the device

- **Page content and styles (in memory only):** When you activate the extension, it reads visible text nodes and computed CSS properties (such as text color, background color, font size, font weight, visibility, and display) from the current page to calculate contrast ratios. Short text snippets (up to 20 characters) from failing elements are shown in the issues summary list.
- **DOM modifications (local preview):** The extension injects overlay UI and a side panel into the page. If you edit colors in the panel, it may apply temporary inline styles to the selected element for preview.
- **Clipboard (user-initiated):** If you click Copy in the selector tooltip, the extension writes a CSS selector string to your clipboard using the browser clipboard API.

### Data stored locally

- **Extension setting:** A boolean value indicating whether the panel was open is saved in `chrome.storage.local` under the key `mm_wcag_active`.

### Data not collected or transmitted by the extension

Based on current source code review:

- No analytics or telemetry
- No advertising or affiliate tracking
- No account registration or user profiles
- No external network requests, APIs, or third-party data sharing
- No remote code execution

Page content processed during a scan is used only in the browser to display results and is not sent to HardaWebPro or other servers by the extension code reviewed for this listing.

## Manual Dashboard Checklist

Enter these fields manually in the Chrome Web Store Developer Dashboard. They are not set in `manifest.json`.

- [ ] **Publisher name:** HardaWebPro
- [ ] **Official URL:** https://hardawebpro.com/
- [ ] **Homepage URL:** https://hardawebpro.com/
- [ ] **Support URL:** https://hardawebpro.com/support/ (publish support content on the website first)
- [ ] **Privacy policy URL:** https://hardawebpro.com/privacy-policy/simple-wcag-contrast-checker/ (publish the final privacy policy on the website first)
- [ ] **Category:** Developer Tools (or Productivity)
- [ ] **Single purpose:** Contrast checking on the active page
- [ ] **Remote code:** No
- [ ] **Permission justifications:** activeTab, scripting, storage (see above)
- [ ] **Data use / privacy practices:** Align dashboard answers with `docs/privacy-policy.md`
