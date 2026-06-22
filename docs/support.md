# Support — Simple WCAG Contrast Checker

**Draft for publication.** The final support content must be published on the HardaWebPro website before using this URL in the Chrome Web Store:

**https://hardawebpro.com/support/**

**Publisher:** HardaWebPro  
**Extension:** Simple WCAG Contrast Checker

## What This Extension Does

Simple WCAG Contrast Checker scans the current web page for visible text whose foreground and background colors do not meet WCAG contrast ratio thresholds. It highlights failing elements, lists them in a side panel, and lets you inspect colors, view AA and AAA results, test alternate colors, and copy a CSS selector for a selected element.

This extension checks **color contrast only**. It does not certify full WCAG compliance or perform complete accessibility audits.

## Installation

### Chrome Web Store

1. Install the extension from its Chrome Web Store listing.
2. Pin **Simple WCAG Contrast Checker** from the Chrome extensions menu for quick access.

### Local development install

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the extension folder.
4. Reload the extension after code changes.

## Basic Usage

1. Open the web page you want to check.
2. Click the **Simple WCAG Contrast Checker** toolbar icon.
3. Wait for the scan to complete. Failing elements appear with red overlays and ratio labels.
4. Click an overlay or an item in the **Issues Found** list to inspect an element.
5. Adjust foreground or background colors in the panel to preview different contrast results.
6. Click **↻** to rescan after the page changes.
7. Press **Esc** or click **✕** to close the panel.

## Troubleshooting

### The panel does not open when I click the icon

- Refresh the page and click the toolbar icon again.
- On restricted pages (such as `chrome://` URLs or the Chrome Web Store), extensions cannot run content scripts. Open a normal website and try again.
- Open `chrome://extensions`, find **Simple WCAG Contrast Checker**, and confirm it is enabled.
- If you loaded the extension unpacked, click **Reload** on the extensions page after updating files.

### No issues are found, but I expected failures

- The scan evaluates visible text using computed foreground color and the nearest non-transparent ancestor background. Gradients, background images, video, and complex layering may not be measured accurately.
- Only elements that fail **WCAG AA** contrast thresholds are highlighted. Elements that pass AA but fail AAA may not appear in the overlay list.
- Hidden or zero-size elements are skipped.

### Overlays appear in the wrong place

- Scroll or resize the page, then click the rescan control (↻).
- Dynamic layouts that change after load may need a rescan.

### The panel reopens after I refresh the page

- This is expected. The extension saves whether the panel was open in local storage (`mm_wcag_active`) and restores that state after refresh.
- Close the panel with **✕** or **Esc** before refreshing if you do not want it to reopen.

### Copy does not work

- The Copy button copies the element's **CSS selector**, not a hex color code.
- Clipboard access requires a secure context and user interaction. Click the Copy button directly and ensure the site allows clipboard writes.

### Color edits disappear after refresh

- Live color changes are temporary inline previews on the page. They are not saved to your site's CSS files.

### I need help beyond these steps

Visit the HardaWebPro support website:

**https://hardawebpro.com/support/**
