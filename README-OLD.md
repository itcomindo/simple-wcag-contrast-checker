# MM WCAG - Advanced Color Contrast Checker

**MM WCAG** is a powerful Google Chrome Extension (Manifest V3) designed to help developers and designers ensure their websites meet WCAG AA and AAA accessibility standards.

Unlike standard checkers, MM WCAG solves the common problem of inspecting "hover states" by using a unique **Overlay Shield** technology that blocks mouse events on the underlying page, allowing you to inspect base elements without triggering CSS hover effects.

![Version](https://img.shields.io/badge/version-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Key Features

- **🛡️ Hover Shield Technology**: Automatically blocks `hover` events on the website while inspecting. This makes it incredibly easy to pick and inspect elements that usually change color when hovered.
- **⚡ Auto-Scan & Persistence**: Automatically scans the page upon opening and stays active even after you refresh (F5) the page.
- **📊 Summary Dashboard**: Displays a list of all elements with contrast failures. Click any item in the list to auto-scroll to that element.
- **🎯 Visual Feedback**: Draws physical overlay boxes over failing elements.
  - **Red Outline**: Fails WCAG AA/AAA.
  - **Label**: Shows the current contrast ratio directly on the element.
- **🎛️ Live Editor**: Click any failing element to open the editor panel. Adjust Foreground/Background colors and see the live contrast ratio update.
- **📋 One-Click Copy**: Copy the fixed Hex color codes to your clipboard instantly.
- **⌨️ Shortcuts**: Press `Esc` to close the extension quickly.

## 🛠️ Installation (Developer Mode)

Since this extension is not yet on the Chrome Web Store, you need to install it manually:

1.  **Clone or Download** this repository to your computer.
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Enable **Developer mode** (toggle switch in the top-right corner).
4.  Click the **Load unpacked** button.
5.  Select the folder where you saved/cloned this project (`MM-WCAG`).
6.  The extension is now installed! Pin it to your toolbar for easy access.

> **Note:** Ensure you have the icon files (`icon16.png`, `icon48.png`, `icon128.png`) in the folder for the best experience.

## 📖 How to Use

1.  **Activate**: Click the **MM WCAG** icon in your Chrome toolbar.
2.  **Analyze**:
    - The extension will immediately scan the page.
    - Elements failing the contrast test will be highlighted with a **Red Box**.
    - A summary panel will appear on the right.
3.  **Inspect & Fix**:
    - Click on a **Red Box** on the page OR click an item in the **Summary List**.
    - The panel will show the current Foreground and Background colors.
    - Use the color pickers or text inputs to adjust colors until the score turns **Green (Pass)**.
4.  **Copy**: Click the copy icon next to the Hex code to use it in your CSS.
5.  **Refresh**: You can refresh the page, and the extension will automatically re-scan.
6.  **Close**: Click the `X` button or press `Esc` on your keyboard.

## 📂 Project Structure

```text
MM-WCAG/
├── manifest.json   # Extension configuration (Manifest V3)
├── background.js   # Service worker for handling events
├── content.js      # Main logic (Scanner, Overlay, UI Injection)
├── style.css       # Styles for the floating panel and overlays
├── icon16.png      # Extension Icon
├── icon48.png      # Extension Icon
├── icon128.png     # Extension Icon
├── LICENSE         # MIT License
└── README.md       # Documentation
```

## 🤝 Contributing

Contributions are welcome! Feel free to fork this repository and submit pull requests.

1. Fork the project
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## 👤 Author

Budi Haryono

Created with ❤️ for a more accessible web.

---

### 2. File `LICENSE`

```text
MIT License

Copyright (c) 2024 Budi Haryono

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
