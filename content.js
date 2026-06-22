// --- STATE ---
let panelOpen = false;
let shadowRoot = null;
let selectedElement = null;
let overlays = [];
let failedElementsData = []; // Menyimpan referensi elemen yang gagal untuk navigasi

// --- INITIALIZATION (PERSISTENCE LOGIC) ---
chrome.storage.local.get(['mm_wcag_active'], (result) => {
    if (result.mm_wcag_active) {
        setTimeout(() => {
            togglePanel(true);
        }, 500);
    }
});

// Listener Tombol ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panelOpen) {
        togglePanel(false);
    }
});

// --- UTILS: COLOR ---
function sRGBtoLin(c) {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function getLuminance(r, g, b) {
    return 0.2126 * sRGBtoLin(r) + 0.7152 * sRGBtoLin(g) + 0.0722 * sRGBtoLin(b);
}

function getContrastRatio(fgHex, bgHex) {
    const fg = hexToRgb(fgHex);
    const bg = hexToRgb(bgHex);
    const l1 = getLuminance(fg.r, fg.g, fg.b);
    const l2 = getLuminance(bg.r, bg.g, bg.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
        : { r: 0, g: 0, b: 0 };
}

function rgbToHex(rgbStr) {
    if (!rgbStr || typeof rgbStr !== 'string') return null;
    if (rgbStr === 'transparent' || rgbStr.includes('rgba(0, 0, 0, 0)')) return null;
    const sep = rgbStr.indexOf(",") > -1 ? "," : " ";
    const parts = rgbStr.replace(/[^\d, ]/g, '').split(sep);
    if (parts.length < 3) return null;
    let r = (+parts[0]).toString(16);
    let g = (+parts[1]).toString(16);
    let b = (+parts[2]).toString(16);
    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;
    return "#" + r + g + b;
}

function getEffectiveBackgroundColor(el) {
    let current = el;
    while (current) {
        const style = window.getComputedStyle(current);
        const bg = style.backgroundColor;
        if (bg && bg !== 'transparent' && !bg.includes('rgba(0, 0, 0, 0)') && parseFloat(style.opacity) > 0) {
            return bg;
        }
        current = current.parentElement;
    }
    return 'rgb(255, 255, 255)';
}

// --- UTILS: CSS SELECTOR GENERATOR ---
function getCssSelector(el) {
    let path = [];
    let current = el;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
        if (current.id) {
            path.unshift('#' + current.id);
            break; // Jika sudah nemu ID, stop karena ID itu unik
        } else if (current.className && typeof current.className === 'string' && current.className.trim() !== '') {
            // Jika ada class, ambil maksimal 3 class pertama (agar jika pakai framework spt Tailwind tidak kepanjangan)
            let classesArray = current.className.trim().split(/\s+/);
            let classes = classesArray.slice(0, 3).join('.');
            path.unshift(current.tagName.toLowerCase() + '.' + classes);
            break; // Stop di parent terdekat yang punya class
        } else {
            // Jika tidak ada keduanya, ambil tag html nya dan lanjut ke parent
            path.unshift(current.tagName.toLowerCase());
        }

        current = current.parentNode;

        if (current === document.body || current === document.documentElement) {
            path.unshift('body');
            break;
        }
    }
    return path.join(' > ');
}

// --- CORE: SCANNER & OVERLAY ---

function scanPage() {
    clearOverlays();
    failedElementsData = [];

    // Inject CSS Global untuk Overlay Shield & Tooltip Selector
    if (!document.getElementById('mm-global-styles')) {
        const style = document.createElement('style');
        style.id = 'mm-global-styles';
        style.innerHTML = `
            .mm-overlay-box {
                position: absolute;
                z-index: 2147483640;
                background-color: rgba(255, 255, 255, 0.001); /* Anti-Hover Shield */
                cursor: pointer;
                box-sizing: border-box;
                border: 2px solid #ff0000;
            }
            .mm-overlay-box:hover {
                background-color: rgba(0, 0, 0, 0.1);
                z-index: 2147483641;
                border-width: 3px;
            }
            .mm-overlay-label {
                position: absolute;
                top: -18px; left: -2px;
                font-family: sans-serif; font-size: 10px; font-weight: bold;
                color: #fff; background: #ff0000;
                padding: 2px 4px; border-radius: 2px;
                white-space: nowrap; pointer-events: none;
                z-index: 2147483642; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            .mm-overlay-box.active {
                border-color: #00e5ff;
                z-index: 2147483643;
            }
            .mm-overlay-box.active .mm-overlay-label {
                background: #00e5ff; color: #000;
            }
            /* Tooltip CSS Selector */
            .mm-selector-tooltip {
                position: absolute;
                left: 0;
                background: #111;
                color: #00e5ff;
                padding: 4px 6px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
                z-index: 2147483645;
                box-shadow: 0 4px 8px rgba(0,0,0,0.5);
                max-width: 300px;
                pointer-events: auto; /* Bisa diklik */
            }
            .mm-sel-text {
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            }
            .mm-sel-copy {
                background: #333; border: 1px solid #555; color: #fff; border-radius: 3px;
                cursor: pointer; font-size: 9px; padding: 2px 6px; margin: 0; white-space: nowrap;
                transition: background 0.2s;
            }
            .mm-sel-copy:hover { background: #555; }
        `;
        document.head.appendChild(style);
    }

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function (node) {
                if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
                if (node.parentElement.closest('#mm-wcag-host')) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    let node;
    const elements = new Set();
    while (node = walker.nextNode()) {
        const el = node.parentElement;
        if (isElementVisible(el)) elements.add(el);
    }

    elements.forEach(el => processElement(el));
    updateSummaryUI();
}

function isElementVisible(el) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
}

function processElement(el) {
    const style = window.getComputedStyle(el);
    const fg = rgbToHex(style.color) || '#000000';
    const bg = rgbToHex(getEffectiveBackgroundColor(el)) || '#ffffff';

    const ratio = getContrastRatio(fg, bg);

    const fontSize = parseFloat(style.fontSize);
    const isBold = parseInt(style.fontWeight) >= 700 || style.fontWeight === 'bold';
    const isLarge = (fontSize >= 24) || (isBold && fontSize >= 18.6);

    const aaPass = ratio >= (isLarge ? 3.0 : 4.5);

    if (!aaPass) {
        const overlay = createOverlayBox(el, ratio, fg, bg);

        let labelText = el.innerText.substring(0, 20);
        if (el.innerText.length > 20) labelText += "...";

        failedElementsData.push({
            element: el,
            overlay: overlay,
            ratio: ratio,
            text: labelText,
            tag: el.tagName,
            fg: fg,
            bg: bg
        });
    }
}

function createOverlayBox(targetEl, ratio, fg, bg) {
    const rect = targetEl.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    const div = document.createElement('div');
    div.className = `mm-overlay-box`;

    div.style.top = (rect.top + scrollTop) + 'px';
    div.style.left = (rect.left + scrollLeft) + 'px';
    div.style.width = rect.width + 'px';
    div.style.height = rect.height + 'px';

    const label = document.createElement('div');
    label.className = 'mm-overlay-label';
    label.textContent = `${ratio.toFixed(2)}`;
    div.appendChild(label);

    div.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        activateElement(targetEl, div, fg, bg, ratio);
    });

    document.body.appendChild(div);
    overlays.push(div);
    return div;
}

// Fungsi utama untuk Handle Klik dan Munculkan Tooltip
function activateElement(targetEl, overlayEl, fg, bg, ratio) {
    selectedElement = targetEl;

    // Bersihkan semua highlight active dan hapus tooltip lama (jika ada)
    document.querySelectorAll('.mm-overlay-box').forEach(o => {
        o.classList.remove('active');
        const oldTooltip = o.querySelector('.mm-selector-tooltip');
        if (oldTooltip) oldTooltip.remove();
    });

    if (overlayEl) {
        overlayEl.classList.add('active');

        // --- BUAT TOOLTIP SELECTOR CSS ---
        const selectorText = getCssSelector(targetEl);
        const tooltip = document.createElement('div');
        tooltip.className = 'mm-selector-tooltip';
        tooltip.innerHTML = `
            <span class="mm-sel-text" title="${selectorText}">${selectorText}</span>
            <button class="mm-sel-copy" title="Copy to clipboard">📋 Copy</button>
        `;

        // Event Copy Clipboard
        tooltip.querySelector('.mm-sel-copy').addEventListener('click', (e) => {
            e.stopPropagation(); // Biar overlay gak ke-klik lagi
            navigator.clipboard.writeText(selectorText).then(() => {
                const btn = e.target;
                btn.textContent = '✔ Copied';
                btn.style.borderColor = '#00c853';
                btn.style.color = '#00c853';
                setTimeout(() => {
                    btn.textContent = '📋 Copy';
                    btn.style.borderColor = '#555';
                    btn.style.color = '#fff';
                }, 1500);
            });
        });

        overlayEl.appendChild(tooltip);

        // --- ATUR POSISI RESPONSIVE ---
        const rect = overlayEl.getBoundingClientRect();

        // Cek ruang atas (Y-Axis)
        if (rect.top < 40) {
            // Jika mepet atas, tampilkan di bawah elemen
            tooltip.style.bottom = 'auto';
            tooltip.style.top = '100%';
            tooltip.style.marginTop = '4px';
        } else {
            // Default: Tampilkan di atas elemen
            tooltip.style.bottom = '100%';
            tooltip.style.top = 'auto';
            tooltip.style.marginBottom = '4px';
        }

        // Cek ruang kanan (X-Axis) setelah elemen dirender oleh browser
        setTimeout(() => {
            const tRect = tooltip.getBoundingClientRect();
            if (tRect.right > window.innerWidth) {
                tooltip.style.left = 'auto';
                tooltip.style.right = '0'; // Align mentok ke kanan
            }
        }, 0);
    }

    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    updatePanelEditor(fg, bg, ratio);
}

function clearOverlays() {
    overlays.forEach(o => o.remove());
    overlays = [];
}

// --- PANEL UI & SUMMARY ---

function createPanel() {
    if (document.getElementById('mm-wcag-host')) return;

    const host = document.createElement('div');
    host.id = 'mm-wcag-host';
    shadowRoot = host.attachShadow({ mode: 'open' });

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('style.css');
    shadowRoot.appendChild(link);

    const wrapper = document.createElement('div');
    wrapper.className = 'mm-panel';
    wrapper.innerHTML = `
        <div class="mm-header">
            <span class="mm-header-title">Simple WCAG Contrast Checker <small>v1.0.0</small></span>
            <div class="mm-header-actions">
                <button id="mm-rescan" type="button" title="Rescan Page" aria-label="Rescan page">↻</button>
                <button id="mm-close" type="button" title="Close (Esc)" aria-label="Close panel">✕</button>
            </div>
        </div>
        
        <div class="mm-body">
            <div class="mm-summary-box">
                <div class="mm-summary-title">
                    <span>⚠️ Issues Found:</span>
                    <span id="mm-issue-count">0</span>
                </div>
                <div class="mm-summary-list" id="mm-summary-list">
                    <div style="padding:10px; color:#999; text-align:center;">Scanning...</div>
                </div>
            </div>

            <div class="mm-editor-title">Selected Element</div>
            
            <div class="mm-result">
                <div class="mm-score-val" id="mm-ratio">--.--</div>
                <div class="mm-badges">
                    <span id="b-aa" class="mm-badge">AA</span>
                    <span id="b-aaa" class="mm-badge">AAA</span>
                </div>
            </div>
            
            <div class="mm-row">
                <label>Foreground</label>
                <div class="mm-input-group">
                    <input type="color" id="fg-p"><input type="text" id="fg-t">
                </div>
            </div>
            <div class="mm-row">
                <label>Background</label>
                <div class="mm-input-group">
                    <input type="color" id="bg-p"><input type="text" id="bg-t">
                </div>
            </div>
        </div>
        <div class="mm-footer">Press <b>Esc</b> to close</div>
    `;

    shadowRoot.appendChild(wrapper);
    document.body.appendChild(host);

    shadowRoot.getElementById('mm-close').addEventListener('click', () => togglePanel(false));
    shadowRoot.getElementById('mm-rescan').addEventListener('click', scanPage);['fg-p', 'fg-t', 'bg-p', 'bg-t'].forEach(id => {
        shadowRoot.getElementById(id).addEventListener('input', onInput);
    });
}

function updateSummaryUI() {
    if (!shadowRoot) return;

    const listContainer = shadowRoot.getElementById('mm-summary-list');
    const countLabel = shadowRoot.getElementById('mm-issue-count');

    countLabel.textContent = failedElementsData.length;
    listContainer.innerHTML = '';

    if (failedElementsData.length === 0) {
        listContainer.innerHTML = `<div style="padding:10px; color:#2e7d32; text-align:center;">🎉 Great! No contrast issues found.</div>`;
        return;
    }

    failedElementsData.forEach((data, index) => {
        const item = document.createElement('div');
        item.className = 'mm-summary-item';
        item.innerHTML = `
            <span class="mm-item-tag">${data.tag}</span>
            <span class="mm-item-text">${data.text}</span>
            <span class="mm-item-ratio">${data.ratio.toFixed(2)}</span>
        `;

        item.addEventListener('click', () => {
            activateElement(data.element, data.overlay, data.fg, data.bg, data.ratio);
        });

        listContainer.appendChild(item);
    });
}

function onInput(e) {
    if (!selectedElement) return;
    const isFg = e.target.id.startsWith('fg');
    const val = e.target.value;

    const picker = shadowRoot.getElementById(isFg ? 'fg-p' : 'bg-p');
    const text = shadowRoot.getElementById(isFg ? 'fg-t' : 'bg-t');
    picker.value = val;
    text.value = val;

    if (/^#[0-9A-F]{6}$/i.test(val)) {
        selectedElement.style.setProperty(isFg ? 'color' : 'background-color', val, 'important');
        const fg = shadowRoot.getElementById('fg-t').value;
        const bg = shadowRoot.getElementById('bg-t').value;
        updatePanelEditor(fg, bg, getContrastRatio(fg, bg));
    }
}

function updatePanelEditor(fg, bg, ratio) {
    if (!shadowRoot) return;
    shadowRoot.getElementById('fg-p').value = fg;
    shadowRoot.getElementById('fg-t').value = fg;
    shadowRoot.getElementById('bg-p').value = bg;
    shadowRoot.getElementById('bg-t').value = bg;

    const rEl = shadowRoot.getElementById('mm-ratio');
    rEl.textContent = ratio.toFixed(2);
    rEl.style.color = ratio < 4.5 ? '#d32f2f' : '#2e7d32';

    const aa = shadowRoot.getElementById('b-aa');
    const aaa = shadowRoot.getElementById('b-aaa');

    aa.className = ratio >= 4.5 ? 'mm-badge pass' : 'mm-badge fail';
    aa.textContent = ratio >= 4.5 ? 'AA Pass' : 'AA Fail';

    aaa.className = ratio >= 7.0 ? 'mm-badge pass' : 'mm-badge fail';
    aaa.textContent = ratio >= 7.0 ? 'AAA Pass' : 'AAA Fail';
}

function togglePanel(forceState = null) {
    const host = document.getElementById('mm-wcag-host');
    const newState = forceState !== null ? forceState : !panelOpen;

    if (newState) {
        if (!host) createPanel();
        else document.getElementById('mm-wcag-host').style.display = 'block';

        panelOpen = true;
        chrome.storage.local.set({ mm_wcag_active: true });
        setTimeout(scanPage, 100);
    } else {
        if (host) document.getElementById('mm-wcag-host').style.display = 'none';

        panelOpen = false;
        clearOverlays();
        chrome.storage.local.set({ mm_wcag_active: false });
    }
}

chrome.runtime.onMessage.addListener((req) => {
    if (req.action === 'toggle_mm_wcag') togglePanel();
});
