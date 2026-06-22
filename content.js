let panelOpen = false;
let shadowRoot = null;
let selectedElement = null;
let overlays = [];
let failedElementsData = [];
let swcc_act = 'AA';
let swcc_p_st = null;
let swcc_s_st = null;
let swcc_d_on = false;
let swcc_d_ox = 0;
let swcc_d_oy = 0;
let swcc_r_on = false;
let swcc_r_ox = 0;
let swcc_r_oy = 0;
let swcc_r_ow = 0;
let swcc_r_oh = 0;
let swcc_opc = 100;
let swcc_nrw = false;
let swcc_nct = false;

const SWCC_MRG = 8;
const SWCC_MNW = 300;
const SWCC_MNH = 360;
const SWCC_NW0 = 316;
const SWCC_NW1 = 640;
const SWCC_NH0 = 376;

chrome.storage.local.get(['mm_wcag_active', 'swcc_std', 'swcc_pos', 'swcc_siz', 'swcc_opc'], (result) => {
    swcc_act = result.swcc_std === 'AAA' ? 'AAA' : 'AA';
    swcc_p_st = result.swcc_pos || null;
    swcc_s_st = result.swcc_siz || null;
    const opc = result.swcc_opc;
    if (typeof opc === 'number' && opc >= 40 && opc <= 100) swcc_opc = opc;
    else swcc_opc = 100;
    if (result.mm_wcag_active) {
        setTimeout(() => {
            togglePanel(true);
        }, 500);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panelOpen) {
        togglePanel(false);
    }
});

window.addEventListener('resize', swcc_onRs);
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', swcc_onRs);
    window.visualViewport.addEventListener('scroll', swcc_onRs);
}

function swcc_onRs() {
    if (!panelOpen || !shadowRoot) return;
    const panel = shadowRoot.querySelector('.mm-panel');
    if (panel) swcc_rsp(panel);
}

function swcc_vwp() {
    const vv = window.visualViewport;
    if (vv) return { w: vv.width, h: vv.height, offX: vv.offsetLeft, offY: vv.offsetTop };
    return { w: window.innerWidth, h: window.innerHeight, offX: 0, offY: 0 };
}

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

function getCssSelector(el) {
    let path = [];
    let current = el;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
        if (current.id) {
            path.unshift('#' + current.id);
            break;
        } else if (current.className && typeof current.className === 'string' && current.className.trim() !== '') {
            let classesArray = current.className.trim().split(/\s+/);
            let classes = classesArray.slice(0, 3).join('.');
            path.unshift(current.tagName.toLowerCase() + '.' + classes);
            break;
        } else {
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

function swcc_lrg(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    const fontSize = parseFloat(style.fontSize);
    const isBold = parseInt(style.fontWeight) >= 700 || style.fontWeight === 'bold';
    return (fontSize >= 24) || (isBold && fontSize >= 18.6);
}

function swcc_aaOk(ratio, large) {
    return ratio >= (large ? 3.0 : 4.5);
}

function swcc_aaaOk(ratio, large) {
    return ratio >= (large ? 4.5 : 7.0);
}

function swcc_tgt(large, std) {
    if (std === 'AAA') return large ? '4.5:1' : '7:1';
    return large ? '3:1' : '4.5:1';
}

function swcc_tgtLbl(large, std) {
    const val = swcc_tgt(large, std);
    if (large) return std + ' Target: ' + val;
    return 'Target: ' + val;
}

function swcc_actOk(ratio, large, std) {
    if (std === 'AAA') return swcc_aaaOk(ratio, large);
    return swcc_aaOk(ratio, large);
}

function swcc_resAll(ratio, large) {
    return {
        aa: { pass: swcc_aaOk(ratio, large), tgt: swcc_tgt(large, 'AA') },
        aaa: { pass: swcc_aaaOk(ratio, large), tgt: swcc_tgt(large, 'AAA') }
    };
}

function swcc_fail(ratio, large, std) {
    if (std === 'AAA') return !swcc_aaaOk(ratio, large);
    return !swcc_aaOk(ratio, large);
}

function swcc_clp(left, top, w, h, v) {
    v = v || swcc_vwp();
    const minL = v.offX + SWCC_MRG - w;
    const maxL = v.offX + v.w - SWCC_MRG;
    const minT = v.offY + SWCC_MRG - h;
    const maxT = v.offY + v.h - SWCC_MRG;
    return {
        left: Math.max(minL, Math.min(left, maxL)),
        top: Math.max(minT, Math.min(top, maxT))
    };
}

function swcc_max(w, h, left, top, v) {
    v = v || swcc_vwp();
    const maxW = v.offX + v.w - left - SWCC_MRG;
    const maxH = v.offY + v.h - top - SWCC_MRG;
    return {
        width: Math.max(SWCC_MNW, Math.min(w, maxW)),
        height: Math.max(SWCC_MNH, Math.min(h, maxH))
    };
}

function swcc_fvw(v, w, h) {
    const capW = Math.max(SWCC_MNW, v.w - SWCC_MRG * 2);
    const capH = Math.max(SWCC_MNH, v.h - SWCC_MRG * 2);
    return {
        width: Math.max(SWCC_MNW, Math.min(w, capW)),
        height: Math.max(SWCC_MNH, Math.min(h, capH))
    };
}

function swcc_app(panel, save) {
    if (!panel || !swcc_p_st || !swcc_s_st) return;
    const v = swcc_vwp();
    const sized = swcc_max(swcc_s_st.width, swcc_s_st.height, swcc_p_st.left, swcc_p_st.top, v);
    const pos = swcc_clp(swcc_p_st.left, swcc_p_st.top, sized.width, sized.height, v);
    panel.style.right = 'auto';
    panel.style.left = pos.left + 'px';
    panel.style.top = pos.top + 'px';
    panel.style.width = sized.width + 'px';
    panel.style.height = sized.height + 'px';
    if (save) swcc_sav(panel);
}

function swcc_clmp(panel) {
    if (!panel) return;
    const v = swcc_vwp();
    const rect = panel.getBoundingClientRect();
    const sized = swcc_max(rect.width, rect.height, rect.left, rect.top, v);
    const pos = swcc_clp(rect.left, rect.top, sized.width, sized.height, v);
    panel.style.right = 'auto';
    panel.style.left = pos.left + 'px';
    panel.style.top = pos.top + 'px';
    panel.style.width = sized.width + 'px';
    panel.style.height = sized.height + 'px';
}

function swcc_cent(panel, v) {
    v = v || swcc_vwp();
    const rect = panel.getBoundingClientRect();
    const sized = swcc_fvw(v, rect.width, rect.height);
    let left = v.offX + (v.w - sized.width) / 2;
    let top = v.offY + (v.h - sized.height) / 2;
    const pos = swcc_clp(left, top, sized.width, sized.height, v);
    panel.style.right = 'auto';
    panel.style.left = pos.left + 'px';
    panel.style.top = pos.top + 'px';
    panel.style.width = sized.width + 'px';
    panel.style.height = sized.height + 'px';
}

function swcc_safe(panel, v) {
    v = v || swcc_vwp();
    const rect = panel.getBoundingClientRect();
    const sized = swcc_fvw(v, Math.max(rect.width, SWCC_MNW), Math.max(rect.height, SWCC_MNH));
    let left = v.offX + SWCC_MRG;
    let top = v.offY + SWCC_MRG;
    if (v.w >= SWCC_MNW) left = v.offX + Math.max(SWCC_MRG, (v.w - sized.width) / 2);
    const pos = swcc_clp(left, top, sized.width, sized.height, v);
    panel.style.right = 'auto';
    panel.style.left = pos.left + 'px';
    panel.style.top = pos.top + 'px';
    panel.style.width = sized.width + 'px';
    panel.style.height = sized.height + 'px';
}

function swcc_rsp(panel) {
    if (!panel) return;
    const v = swcc_vwp();
    const inNrw = v.w >= SWCC_NW0 && v.w <= SWCC_NW1 && v.h >= SWCC_NH0;
    if (v.w > SWCC_NW1) {
        swcc_nrw = false;
        swcc_nct = false;
        if (swcc_p_st && swcc_s_st) swcc_app(panel, false);
        return;
    }
    if (inNrw) {
        const entering = !swcc_nrw;
        swcc_nrw = true;
        if (entering || !swcc_nct) swcc_cent(panel, v);
        else swcc_clmp(panel);
        return;
    }
    swcc_nrw = false;
    swcc_safe(panel, v);
}

function swcc_sav(panel) {
    if (swcc_nrw) return;
    const rect = panel.getBoundingClientRect();
    swcc_p_st = { left: rect.left, top: rect.top };
    swcc_s_st = { width: rect.width, height: rect.height };
    chrome.storage.local.set({ swcc_pos: swcc_p_st, swcc_siz: swcc_s_st });
}

function swcc_set(std) {
    swcc_act = std;
    chrome.storage.local.set({ swcc_std: std });
    swcc_ui();
    scanPage();
}

function swcc_ui() {
    if (!shadowRoot) return;
    const aaBtn = shadowRoot.getElementById('swcc-std-aa');
    const aaaBtn = shadowRoot.getElementById('swcc-std-aaa');
    if (!aaBtn || !aaaBtn) return;
    const isAA = swcc_act === 'AA';
    aaBtn.setAttribute('aria-pressed', isAA ? 'true' : 'false');
    aaaBtn.setAttribute('aria-pressed', isAA ? 'false' : 'true');
    aaBtn.classList.toggle('swcc-std-on', isAA);
    aaaBtn.classList.toggle('swcc-std-on', !isAA);
    const lbl = shadowRoot.getElementById('swcc-iss-lbl');
    if (lbl) lbl.textContent = 'Issues Found (' + swcc_act + '):';
    swcc_sel();
}

function swcc_apOpc(panel) {
    if (!panel) return;
    panel.style.setProperty('--swcc-opc', (swcc_opc / 100).toString());
}

function swcc_setOpc(val) {
    swcc_opc = Math.max(40, Math.min(100, Math.round(val / 5) * 5));
    chrome.storage.local.set({ swcc_opc: swcc_opc });
    const panel = shadowRoot && shadowRoot.querySelector('.mm-panel');
    if (panel) swcc_apOpc(panel);
    if (!shadowRoot) return;
    const rng = shadowRoot.getElementById('swcc-opc-rng');
    const valEl = shadowRoot.getElementById('swcc-opc-val');
    if (rng) {
        rng.value = swcc_opc;
        rng.setAttribute('aria-valuenow', swcc_opc);
    }
    if (valEl) valEl.textContent = swcc_opc + '%';
}

function swcc_drg(panel, hdr) {
    hdr.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.mm-header-actions')) return;
        if (e.target.closest('button')) return;
        e.preventDefault();
        swcc_d_on = true;
        const rect = panel.getBoundingClientRect();
        panel.style.right = 'auto';
        panel.style.left = rect.left + 'px';
        panel.style.top = rect.top + 'px';
        swcc_d_ox = e.clientX - rect.left;
        swcc_d_oy = e.clientY - rect.top;
        hdr.setPointerCapture(e.pointerId);
        hdr.classList.add('swcc-grab');
        document.body.style.userSelect = 'none';
    });
    hdr.addEventListener('pointermove', (e) => {
        if (!swcc_d_on) return;
        const w = panel.offsetWidth;
        const h = panel.offsetHeight;
        const pos = swcc_clp(e.clientX - swcc_d_ox, e.clientY - swcc_d_oy, w, h);
        panel.style.left = pos.left + 'px';
        panel.style.top = pos.top + 'px';
    });
    const endDrag = (e) => {
        if (!swcc_d_on) return;
        swcc_d_on = false;
        hdr.releasePointerCapture(e.pointerId);
        hdr.classList.remove('swcc-grab');
        document.body.style.userSelect = '';
        if (swcc_nrw) swcc_nct = true;
        else swcc_sav(panel);
    };
    hdr.addEventListener('pointerup', endDrag);
    hdr.addEventListener('pointercancel', endDrag);
}

function swcc_rsz(panel, handle) {
    handle.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        swcc_r_on = true;
        const rect = panel.getBoundingClientRect();
        panel.style.right = 'auto';
        panel.style.left = rect.left + 'px';
        panel.style.top = rect.top + 'px';
        swcc_r_ox = e.clientX;
        swcc_r_oy = e.clientY;
        swcc_r_ow = rect.width;
        swcc_r_oh = rect.height;
        handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', (e) => {
        if (!swcc_r_on) return;
        const rect = panel.getBoundingClientRect();
        const sized = swcc_max(
            swcc_r_ow + (e.clientX - swcc_r_ox),
            swcc_r_oh + (e.clientY - swcc_r_oy),
            rect.left,
            rect.top
        );
        panel.style.width = sized.width + 'px';
        panel.style.height = sized.height + 'px';
        const pos = swcc_clp(rect.left, rect.top, sized.width, sized.height);
        panel.style.left = pos.left + 'px';
        panel.style.top = pos.top + 'px';
    });
    const endRsz = (e) => {
        if (!swcc_r_on) return;
        swcc_r_on = false;
        handle.releasePointerCapture(e.pointerId);
        if (!swcc_nrw) swcc_sav(panel);
    };
    handle.addEventListener('pointerup', endRsz);
    handle.addEventListener('pointercancel', endRsz);
}

function scanPage() {
    clearOverlays();
    failedElementsData = [];
    selectedElement = null;

    if (!document.getElementById('mm-global-styles')) {
        const style = document.createElement('style');
        style.id = 'mm-global-styles';
        style.innerHTML = `
            .mm-overlay-box {
                position: absolute;
                z-index: 2147483640;
                background-color: rgba(255, 255, 255, 0.001);
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
                pointer-events: auto;
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
    const isLarge = swcc_lrg(el);

    if (swcc_fail(ratio, isLarge, swcc_act)) {
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

function activateElement(targetEl, overlayEl, fg, bg, ratio) {
    selectedElement = targetEl;

    document.querySelectorAll('.mm-overlay-box').forEach(o => {
        o.classList.remove('active');
        const oldTooltip = o.querySelector('.mm-selector-tooltip');
        if (oldTooltip) oldTooltip.remove();
    });

    if (overlayEl) {
        overlayEl.classList.add('active');

        const selectorText = getCssSelector(targetEl);
        const tooltip = document.createElement('div');
        tooltip.className = 'mm-selector-tooltip';
        tooltip.innerHTML = `
            <span class="mm-sel-text" title="${selectorText}">${selectorText}</span>
            <button class="mm-sel-copy" title="Copy to clipboard">📋 Copy</button>
        `;

        tooltip.querySelector('.mm-sel-copy').addEventListener('click', (e) => {
            e.stopPropagation();
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

        const rect = overlayEl.getBoundingClientRect();

        if (rect.top < 40) {
            tooltip.style.bottom = 'auto';
            tooltip.style.top = '100%';
            tooltip.style.marginTop = '4px';
        } else {
            tooltip.style.bottom = '100%';
            tooltip.style.top = 'auto';
            tooltip.style.marginBottom = '4px';
        }

        setTimeout(() => {
            const tRect = tooltip.getBoundingClientRect();
            if (tRect.right > window.innerWidth) {
                tooltip.style.left = 'auto';
                tooltip.style.right = '0';
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
        <div class="mm-header swcc-drag">
            <span class="mm-header-title">Simple WCAG Contrast Checker <small>v1.0.0</small></span>
            <div class="mm-header-actions">
                <button id="mm-rescan" type="button" title="Rescan Page" aria-label="Rescan page">↻</button>
                <button id="mm-close" type="button" title="Close (Esc)" aria-label="Close panel">✕</button>
            </div>
        </div>
        
        <div class="mm-body">
            <div class="swcc-std-row">
                <span class="swcc-std-lbl">Standard:</span>
                <div class="swcc-std-grp" role="group" aria-label="WCAG contrast standard">
                    <button type="button" id="swcc-std-aa" class="swcc-std-btn" aria-pressed="true">AA</button>
                    <button type="button" id="swcc-std-aaa" class="swcc-std-btn" aria-pressed="false">AAA</button>
                </div>
            </div>
            <div class="mm-summary-box">
                <div class="mm-summary-title">
                    <span id="swcc-iss-lbl">Issues Found (AA):</span>
                    <span id="mm-issue-count">0</span>
                </div>
                <div class="mm-summary-list" id="mm-summary-list">
                    <div class="swcc-scan-msg">Scanning...</div>
                </div>
            </div>

            <div class="mm-editor-title">Selected Element</div>
            <div id="swcc-sel-wrap" class="swcc-sel-wrap">
                <div id="swcc-sel-ok" class="swcc-sel-card swcc-sel-ok" hidden>
                    <span class="swcc-sel-icon" aria-hidden="true">✓</span>
                    <p class="swcc-sel-msg">No contrast issues to review.</p>
                    <p class="swcc-sel-sub" id="swcc-sel-ok-sub"></p>
                </div>
                <div id="swcc-sel-pick" class="swcc-sel-card swcc-sel-pick" hidden>
                    <p class="swcc-sel-msg">Select an issue to inspect it.</p>
                    <p class="swcc-sel-sub">Choose an item from the issue list or click a highlighted element on the page.</p>
                </div>
                <div id="swcc-sel-unav" class="swcc-sel-card swcc-sel-unav" hidden>
                    <p class="swcc-sel-msg">Contrast ratio unavailable.</p>
                    <p class="swcc-sel-sub">This element could not be evaluated automatically.</p>
                </div>
                <div id="swcc-sel-edit" class="swcc-sel-edit" hidden>
                    <div class="swcc-res-card mm-result">
                        <div class="swcc-ratio-lbl">Contrast Ratio: <span id="swcc-ratio"></span></div>
                        <div class="swcc-res-act">
                            <span id="swcc-res-badge" class="swcc-res-badge"></span>
                        </div>
                        <div id="swcc-res-tgt" class="swcc-res-tgt"></div>
                        <div id="swcc-res-more" class="swcc-res-more" hidden aria-hidden="true"></div>
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
            </div>
        </div>
        <div class="swcc-set-row">
            <label class="swcc-opc-lbl" for="swcc-opc-rng">Panel transparency:</label>
            <input type="range" id="swcc-opc-rng" class="swcc-opc-rng" min="40" max="100" step="5" value="100" aria-valuemin="40" aria-valuemax="100" aria-valuenow="100">
            <span id="swcc-opc-val" class="swcc-opc-val" aria-live="polite">100%</span>
        </div>
        <div class="mm-footer">Press <b>Esc</b> to close</div>
        <div class="swcc-resize" role="presentation" aria-hidden="true"></div>
    `;

    shadowRoot.appendChild(wrapper);
    document.body.appendChild(host);

    const panel = shadowRoot.querySelector('.mm-panel');
    const hdr = shadowRoot.querySelector('.mm-header');

    shadowRoot.getElementById('mm-close').addEventListener('click', () => togglePanel(false));
    shadowRoot.getElementById('mm-rescan').addEventListener('click', scanPage);
    shadowRoot.getElementById('swcc-std-aa').addEventListener('click', () => swcc_set('AA'));
    shadowRoot.getElementById('swcc-std-aaa').addEventListener('click', () => swcc_set('AAA'));
    shadowRoot.getElementById('swcc-opc-rng').addEventListener('input', (e) => swcc_setOpc(+e.target.value));
    ['fg-p', 'fg-t', 'bg-p', 'bg-t'].forEach(id => {
        shadowRoot.getElementById(id).addEventListener('input', onInput);
    });

    swcc_ui();
    swcc_setOpc(swcc_opc);
    swcc_nct = false;
    if (swcc_p_st && swcc_s_st && swcc_vwp().w > SWCC_NW1) swcc_app(panel, false);
    else swcc_rsp(panel);
    swcc_drg(panel, hdr);
    swcc_rsz(panel, shadowRoot.querySelector('.swcc-resize'));
    swcc_sel();
}

function swcc_vld(fg, bg, ratio) {
    if (!selectedElement) return false;
    if (typeof ratio !== 'number' || !isFinite(ratio) || ratio <= 0) return false;
    if (!fg || !bg || !/^#[0-9A-F]{6}$/i.test(fg) || !/^#[0-9A-F]{6}$/i.test(bg)) return false;
    return true;
}

function swcc_sel(fg, bg, ratio) {
    if (!shadowRoot) return;
    const ok = shadowRoot.getElementById('swcc-sel-ok');
    const pick = shadowRoot.getElementById('swcc-sel-pick');
    const unav = shadowRoot.getElementById('swcc-sel-unav');
    const edit = shadowRoot.getElementById('swcc-sel-edit');
    const okSub = shadowRoot.getElementById('swcc-sel-ok-sub');
    const listEl = shadowRoot.getElementById('mm-summary-list');
    const scanning = listEl && listEl.querySelector('.swcc-scan-msg');
    [ok, pick, unav, edit].forEach(el => { if (el) el.hidden = true; });
    if (selectedElement && swcc_vld(fg, bg, ratio)) {
        edit.hidden = false;
        return;
    }
    if (selectedElement && !swcc_vld(fg, bg, ratio)) {
        unav.hidden = false;
        return;
    }
    if (scanning) {
        pick.hidden = false;
        return;
    }
    if (failedElementsData.length === 0) {
        ok.hidden = false;
        if (okSub) okSub.textContent = 'All detected text passes the active ' + swcc_act + ' contrast standard.';
        return;
    }
    pick.hidden = false;
}

function updateSummaryUI() {
    if (!shadowRoot) return;

    const listContainer = shadowRoot.getElementById('mm-summary-list');
    const countLabel = shadowRoot.getElementById('mm-issue-count');
    const issLbl = shadowRoot.getElementById('swcc-iss-lbl');

    if (issLbl) issLbl.textContent = 'Issues Found (' + swcc_act + '):';
    countLabel.textContent = failedElementsData.length;
    listContainer.innerHTML = '';

    if (failedElementsData.length === 0) {
        const msg = swcc_act === 'AAA'
            ? 'Great! No AAA contrast issues found.'
            : 'Great! No AA contrast issues found.';
        listContainer.innerHTML = '<div class="swcc-clean-msg">' + msg + '</div>';
        swcc_sel();
        return;
    }

    failedElementsData.forEach((data) => {
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
    swcc_sel();
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
    if (!swcc_vld(fg, bg, ratio)) {
        swcc_sel(fg, bg, ratio);
        return;
    }
    swcc_sel(fg, bg, ratio);
    shadowRoot.getElementById('fg-p').value = fg;
    shadowRoot.getElementById('fg-t').value = fg;
    shadowRoot.getElementById('bg-p').value = bg;
    shadowRoot.getElementById('bg-t').value = bg;

    const large = swcc_lrg(selectedElement);
    const all = swcc_resAll(ratio, large);
    const pass = swcc_actOk(ratio, large, swcc_act);

    shadowRoot.getElementById('swcc-ratio').textContent = ratio.toFixed(2) + ':1';

    const badge = shadowRoot.getElementById('swcc-res-badge');
    badge.className = pass ? 'swcc-res-badge pass' : 'swcc-res-badge fail';
    badge.textContent = swcc_act + ': ' + (pass ? 'Pass' : 'Fail');

    shadowRoot.getElementById('swcc-res-tgt').textContent = swcc_tgtLbl(large, swcc_act);

    const more = shadowRoot.getElementById('swcc-res-more');
    if (more) {
        more.dataset.aaPass = all.aa.pass ? '1' : '0';
        more.dataset.aaaPass = all.aaa.pass ? '1' : '0';
        more.dataset.aaTgt = all.aa.tgt;
        more.dataset.aaaTgt = all.aaa.tgt;
    }
}

function togglePanel(forceState = null) {
    const host = document.getElementById('mm-wcag-host');
    const newState = forceState !== null ? forceState : !panelOpen;

    if (newState) {
        if (!host) createPanel();
        else document.getElementById('mm-wcag-host').style.display = 'block';

        panelOpen = true;
        chrome.storage.local.set({ mm_wcag_active: true });
        if (shadowRoot) {
            swcc_ui();
            swcc_setOpc(swcc_opc);
            const panel = shadowRoot.querySelector('.mm-panel');
            if (panel) {
                swcc_nct = false;
                if (swcc_p_st && swcc_s_st && swcc_vwp().w > SWCC_NW1) swcc_app(panel, false);
                else swcc_rsp(panel);
            }
        }
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
