# Simple WCAG Contrast Checker

Simple WCAG Contrast Checker is a Google Chrome extension (Manifest V3) published by **HardaWebPro**. It scans the current web page for text elements whose foreground and background colors do not meet WCAG contrast ratio thresholds, then helps you inspect and adjust those colors.

This extension checks **color contrast only**. It does not audit full WCAG compliance, certify accessibility, or represent official W3C endorsement.

## Key Features

- **Page contrast scan**: Walks visible text on the page, computes contrast ratios, and highlights elements that fail WCAG AA thresholds (4.5:1 for normal text, 3:1 for large or bold text).
- **Overlay highlights**: Draws labeled overlay boxes on failing elements showing the current contrast ratio.
- **Hover shield overlays**: Overlay boxes use a near-transparent shield so you can click elements without triggering underlying page hover styles.
- **Issues summary**: Lists failing elements in a side panel; click an item to scroll to and select that element.
- **AA and AAA badges**: Shows pass or fail badges for WCAG AA (4.5:1) and AAA (7:1) on the selected element.
- **Live color editor**: Adjust foreground and background colors for a selected element and see the contrast ratio update in real time.
- **CSS selector copy**: Copy a generated CSS selector for the selected element to the clipboard.
- **Rescan**: Re-run the scan after page changes with the rescan control.
- **Session persistence**: Remembers whether the panel was open and re-opens after a page refresh on the same tab.
- **Keyboard shortcut**: Press `Esc` to close the panel.

## Installation

### From the Chrome Web Store

1. Open the Chrome Web Store listing: `[Chrome Web Store URL — add when published]`
2. Click **Add to Chrome**.
3. Pin the extension from the Chrome toolbar menu for quick access.

### For local development (Load unpacked)

1. Download or clone this repository.
2. Open `chrome://extensions` in Google Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this project folder.
5. Ensure `icon16.png`, `icon48.png`, and `icon128.png` are present in the folder.

## Usage

1. Navigate to the page you want to check.
2. Click the **Simple WCAG Contrast Checker** toolbar icon to open the panel and start a scan.
3. Review red overlay boxes on elements that fail WCAG AA contrast requirements.
4. Open the **Issues Found** list in the panel, or click an overlay on the page, to inspect an element.
5. Use the foreground and background color controls to test alternate colors and view updated AA and AAA results.
6. Use the **Copy** button in the selector tooltip to copy the element's CSS selector.
7. Click the rescan control (↻) after DOM or style changes.
8. Close the panel with the **✕** button or press `Esc`.

## Limitations

- Checks **color contrast only** for visible text elements on the current page.
- Does **not** certify full WCAG compliance or complete accessibility auditing.
- Does not evaluate non-text contrast, focus indicators, keyboard access, ARIA, semantics, or other WCAG success criteria.
- Contrast is estimated from computed foreground color and the nearest non-transparent ancestor background; layered backgrounds, images, gradients, and transparency may affect accuracy.
- Scan highlighting uses WCAG AA thresholds; AAA is shown in the editor for the selected element.
- Live color edits apply inline styles on the page for preview only and are not saved to your project files.

## Publisher

**HardaWebPro**

- Website: [https://hardawebpro.com/](https://hardawebpro.com/)
- Support: [https://hardawebpro.com/support/](https://hardawebpro.com/support/)
- Privacy policy: [https://hardawebpro.com/privacy-policy/simple-wcag-contrast-checker/](https://hardawebpro.com/privacy-policy/simple-wcag-contrast-checker/)

## License

See [LICENSE](LICENSE) for license terms.
