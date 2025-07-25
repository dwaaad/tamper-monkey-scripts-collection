// ==UserScript==
// @name         Github - Inactive Development Warning
// @namespace    https://openuserjs.org/users/zachhardesty7
// @author       Zach Hardesty <zachhardesty7@users.noreply.github.com> (https://github.com/zachhardesty7)
// @description  display big banner if project's last commit over 6 months ago and giant banner if over 1 year ago
// @copyright    2019-2025, Zach Hardesty (https://zachhardesty.com/)
// @license      GPL-3.0-only; http://www.gnu.org/licenses/gpl-3.0.txt
// @version      1.4.0

// @homepageURL  https://github.com/zachhardesty7/tamper-monkey-scripts-collection/raw/master/github-inactive-dev-warning.user.js
// @homepage     https://github.com/zachhardesty7/tamper-monkey-scripts-collection/raw/master/github-inactive-dev-warning.user.js
// @homepageURL  https://openuserjs.org/scripts/zachhardesty7/Github_-_Inactive_Development_Warning
// @homepage     https://openuserjs.org/scripts/zachhardesty7/Github_-_Inactive_Development_Warning
// @supportURL   https://github.com/zachhardesty7/tamper-monkey-scripts-collection/issues

// @updateURL    https://openuserjs.org/meta/zachhardesty7/Github_-_Inactive_Development_Warning.meta.js
// @downloadURL  https://openuserjs.org/src/scripts/zachhardesty7/Github_-_Inactive_Development_Warning.user.js

// @match        https://github.com/*/*
// @require      https://github.com/zachhardesty7/tamper-monkey-scripts-collection/raw/refs/tags/onElementReady@0.10.0/utils/onElementReady.js
// ==/UserScript==

/* global onElementReady */

onElementReady(
  "[data-testid='latest-commit-details'] relative-time",
  { findOnce: false },
  (el) => {
    if (document.querySelector("#zh-inactive-dev-warning")) return;

    const date = new Date(el.getAttribute("datetime") || "");
    const daysSinceLastCommit = (Date.now() - date.getTime()) / 1000 / 60 / 60 / 24;
    if (daysSinceLastCommit > 365) {
      renderWarning();
    } else if (daysSinceLastCommit > 182.5) {
      renderCaution();
    }
  }
);

function displayMessage(el) {
  const container = document.querySelector("#js-repo-pjax-container");
  if (container) {
    const existingBanner = document.querySelector("#zh-inactive-dev-warning");
    if (existingBanner) existingBanner.remove();
    container.insertAdjacentElement("beforebegin", el);
  }
}

function getThemeSettings() {
  const colorMode = document.documentElement.getAttribute('data-color-mode');
  const darkTheme = document.documentElement.getAttribute('data-dark-theme');
  const isLight = colorMode === 'light' ||
                 (colorMode === 'auto' && !window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isLight) {
    return {
      bg: '#fef7c5',
      text: '#1e2227',
      border: '#edd789',
      close: '#58626d',
      closeHover: '#1e2227',
      warningColor: '#996606' // Light theme warning color
    };
  } else if (darkTheme === 'dark') {
    return {
      bg: '#262014',
      text: '#f0f0f0',
      border: '#614612',
      close: '#9097a0',
      closeHover: '#d0d6df',
      warningColor: '#d19826' // Dark theme warning color
    };
  } else { // soft_dark or default
    return {
      bg: '#36342c',
      text: '#f0f0f0',
      border: '#665122',
      close: '#9097a0',
      closeHover: '#d0d6df',
      warningColor: '#c58f29' // Soft dark theme warning color
    };
  }
}

function createCloseButton(theme) {
  const closeBtn = document.createElement("button");
  closeBtn.setAttribute("style", `
    background: transparent;
    border: transparent;
    color: ${theme.close};
    width: 24px;
    height: 24px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    cursor: pointer;
    padding: 0;
    transition: color 0.1s ease-in-out;
    font-size: 18px;
    flex-shrink: 0;
  `);
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelector("#zh-inactive-dev-warning")?.remove();
  });
  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.color = theme.closeHover;
  });
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.color = theme.close;
  });
  return closeBtn;
}

function createWarningIcon(theme) {
  const icon = document.createElement("div");
  icon.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="${theme.warningColor}" style="vertical-align: middle;">
      <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path>
    </svg>
  `;
  return icon;
}

function renderWarning() {
  const theme = getThemeSettings();
  const banner = document.createElement("div");
  banner.id = "zh-inactive-dev-warning";
  banner.setAttribute("style", `
    background-color: ${theme.bg};
    color: ${theme.text};
    height: 50px;
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    border-top: 1px solid ${theme.border};
    border-bottom: 1px solid ${theme.border};
    padding: 0 16px;
    position: relative;
  `);

  const message = document.createElement("div");
  message.style.flex = "1";
  message.style.textAlign = "center";
  message.style.display = "flex";
  message.style.alignItems = "center";
  message.style.justifyContent = "center";
  message.style.gap = "8px";

  message.appendChild(createWarningIcon(theme));

  const text = document.createElement("span");
  text.textContent = "repo hasn't been updated in 1+ year(s)";
  message.appendChild(text);

  message.appendChild(createWarningIcon(theme));

  banner.appendChild(message);
  banner.appendChild(createCloseButton(theme));

  displayMessage(banner);
}

function renderCaution() {
  const theme = getThemeSettings();
  const banner = document.createElement("div");
  banner.id = "zh-inactive-dev-warning";
  banner.setAttribute("style", `
    background-color: ${theme.bg};
    color: ${theme.text};
    height: 50px;
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    border-top: 1px solid ${theme.border};
    border-bottom: 1px solid ${theme.border};
    padding: 0 16px;
    position: relative;
  `);

  const message = document.createElement("div");
  message.style.flex = "1";
  message.style.textAlign = "center";
  message.style.display = "flex";
  message.style.alignItems = "center";
  message.style.justifyContent = "center";
  message.style.gap = "8px";

  message.appendChild(createWarningIcon(theme));

  const text = document.createElement("span");
  text.textContent = "repo hasn't been updated in 6+ months";
  message.appendChild(text);

  message.appendChild(createWarningIcon(theme));

  banner.appendChild(message);
  banner.appendChild(createCloseButton(theme));

  displayMessage(banner);
}