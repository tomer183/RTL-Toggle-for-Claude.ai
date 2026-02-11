// Function to add yellow border to elements with data-test-render-count
function highlightRenderCountElements() {
  const elements = document.querySelectorAll("[data-test-render-count]");
  elements.forEach((element) => {
    if (!element.dataset.highlightedByExtension) {
      element.dataset.highlightedByExtension = "true";
    }
  });
}

// Function to ensure action bars stay LTR
function keepActionBarsLTR() {
  // Find all action bar containers
  const actionBars = document.querySelectorAll(
    ".flex.items-stretch.justify-between"
  );
  actionBars.forEach((actionBar) => {
    // Check if it's actually an action bar by looking for the copy button
    if (actionBar.querySelector('[data-testid="action-bar-copy"]')) {
      actionBar.dir = "ltr";

      // Only apply data-keep-ltr to w-fit divs within the action bar
      const wFitDivs = actionBar.querySelectorAll(".w-fit");
      wFitDivs.forEach((wFitDiv) => {
        if (!wFitDiv.hasAttribute("data-keep-ltr")) {
          wFitDiv.setAttribute("data-keep-ltr", "true");
          wFitDiv.dir = "ltr";
        }
      });
    }
  });
}

// Directional symbol pairs to mirror when toggling RTL/LTR
// Each pair: [ltrSymbol, rtlSymbol] — they swap with each other
const DIRECTIONAL_SYMBOL_PAIRS = [
  ["\u2192", "\u2190"],   // → ←
  ["\u27F6", "\u27F5"],   // ⟶ ⟵
  ["\u25B6", "\u25C0"],   // ▶ ◀
  ["\u00BB", "\u00AB"],   // » «
  ["\u21D2", "\u21D0"],   // ⇒ ⇐
  ["\u25BA", "\u25C4"],   // ► ◄
];

// Mirror directional symbols in text nodes within an element
function mirrorDirectionalSymbols(element) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        // Skip code, buttons, action bars, toggle buttons
        if (
          parent.closest("code") ||
          parent.closest("button") ||
          parent.closest('[data-keep-ltr]') ||
          parent.closest('[data-rtl-toggle]')
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }

  textNodes.forEach((textNode) => {
    let text = textNode.textContent;

    // Quick check — skip if no directional symbols present
    let hasMatch = false;
    for (const [a, b] of DIRECTIONAL_SYMBOL_PAIRS) {
      if (text.includes(a) || text.includes(b)) {
        hasMatch = true;
        break;
      }
    }
    if (!hasMatch) return;

    // Use placeholders to avoid double-swaps (→ becoming ← then back to →)
    DIRECTIONAL_SYMBOL_PAIRS.forEach(([a, b], i) => {
      text = text.replaceAll(a, `\uFFF0${i}A\uFFF0`);
      text = text.replaceAll(b, `\uFFF0${i}B\uFFF0`);
    });
    DIRECTIONAL_SYMBOL_PAIRS.forEach(([a, b], i) => {
      text = text.replaceAll(`\uFFF0${i}A\uFFF0`, b);
      text = text.replaceAll(`\uFFF0${i}B\uFFF0`, a);
    });

    textNode.textContent = text;
  });
}

// Inject styles for RTL toggle buttons
function injectStyles() {
  if (document.getElementById("rtl-toggle-styles")) return;

  const style = document.createElement("style");
  style.id = "rtl-toggle-styles";
  style.textContent = `
    .rtl-toggle-btn svg {
      overflow: visible;
    }
  `;
  document.head.appendChild(style);
}

// Function to create RTL/LTR toggle button
function createRTLToggleButton(targetElement, isPreElement = false) {
  const button = document.createElement("button");
  button.className = "rtl-toggle-btn";
  button.type = "button";
  button.title = "Toggle RTL/LTR";
  button.setAttribute("data-rtl-toggle", "true");
  if (isPreElement) {
    button.setAttribute("data-rtl-toggle-pre", "true");
  }

  // Additional styling for positioning
  button.style.position = "absolute";
  button.style.top = "8px";
  button.style.zIndex = "1000";
  button.style.background = "linear-gradient(135deg, #00D68F 0%, #0095FF 100%)";
  button.style.transition = "all 0.3s ease";
  button.style.cursor = "pointer";
  button.style.border = "none";
  button.style.borderRadius = "6px";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.width = "28px";
  button.style.height = "28px";
  button.style.padding = "5px";

  // Create SVG icon - RTL paragraph lines (right-aligned like MS Word)
  // Will be mirrored when LTR
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "18");
  svg.setAttribute("height", "18");
  svg.setAttribute("viewBox", "0 0 128 128");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = `
    <rect x="24" y="20" width="80" height="12" rx="3" fill="white"/>
    <rect x="40" y="44" width="64" height="12" rx="3" fill="white"/>
    <rect x="32" y="68" width="72" height="12" rx="3" fill="white"/>
    <rect x="48" y="92" width="56" height="12" rx="3" fill="white"/>
  `;

  button.appendChild(svg);

  // Get current direction state
  let isRTL;
  if (isPreElement) {
    // For pre elements, check CSS direction style
    const computedStyle = window.getComputedStyle(targetElement);
    isRTL = computedStyle.direction === "rtl";
  } else {
    isRTL = targetElement.dir === "rtl";
  }

  // Function to update button position and icon based on direction
  const updateButtonState = (rtl) => {
    if (rtl) {
      button.style.right = "-52px";
      button.style.left = "auto";
      svg.style.transform = "scaleX(1)"; // RTL - lines aligned right
    } else {
      button.style.left = "-52px";
      button.style.right = "auto";
      svg.style.transform = "scaleX(-1)"; // LTR - mirror to align lines left
    }
  };

  // Set initial position and icon state
  updateButtonState(isRTL);

  // Toggle direction on click
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    isRTL = !isRTL;

    if (isPreElement) {
      // For pre elements, only change CSS direction style (not dir attribute)
      targetElement.style.direction = isRTL ? "rtl" : "ltr";
      targetElement.style.textAlign = isRTL ? "right" : "left";

      // Also update thead elements - swap text-left/text-right classes
      const theadElements = targetElement.querySelectorAll("thead");
      theadElements.forEach((thead) => {
        if (isRTL) {
          thead.classList.remove("text-left");
          thead.classList.add("text-right");
        } else {
          thead.classList.remove("text-right");
          thead.classList.add("text-left");
        }
      });

      // Also update any table headers (th) inside the pre element
      const tableHeaders = targetElement.querySelectorAll("th");
      tableHeaders.forEach((th) => {
        th.style.textAlign = isRTL ? "right" : "left";
      });

      // Also update table cells (td) inside the pre element
      const tableCells = targetElement.querySelectorAll("td");
      tableCells.forEach((td) => {
        td.style.textAlign = isRTL ? "right" : "left";
      });

      // Mirror directional symbols (→ ← etc.)
      mirrorDirectionalSymbols(targetElement);
    } else {
      // For other elements, use dir attribute
      targetElement.dir = isRTL ? "rtl" : "ltr";

      // Also update thead elements - swap text-left/text-right classes
      const theadElements = targetElement.querySelectorAll("thead");
      theadElements.forEach((thead) => {
        if (isRTL) {
          thead.classList.remove("text-left");
          thead.classList.add("text-right");
        } else {
          thead.classList.remove("text-right");
          thead.classList.add("text-left");
        }
      });

      // Mirror directional symbols (→ ← etc.)
      mirrorDirectionalSymbols(targetElement);
    }

    // Update button position and icon state
    updateButtonState(isRTL);

    // Immediately ensure action bars within this element stay LTR
    keepActionBarsLTR();

    console.log(
      `Direction changed to: ${isRTL ? "RTL" : "LTR"} for element:`,
      targetElement
    );
  });

  return button;
}

// Function to add RTL/LTR toggle button to data-test-render-count elements
function addRTLToggleToElements() {
  const elements = document.querySelectorAll("[data-test-render-count]");

  elements.forEach((element) => {
    // Skip if element has class "group"
    if (element.classList.contains("group")) {
      console.log('Skipping element with class "group":', element);
      return;
    }

    // Check if button already exists (excluding pre element buttons)
    if (!element.querySelector('[data-rtl-toggle="true"]:not([data-rtl-toggle-pre="true"])')) {
      // Make element position relative if it's not already positioned
      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.position === "static") {
        element.style.position = "relative";
      }

      // Ensure overflow is visible so button can be seen outside
      element.style.overflow = "visible";

      // Also ensure parent has overflow visible
      if (element.parentElement) {
        element.parentElement.style.overflow = "visible";
      }

      // Create and add the toggle button
      const toggleButton = createRTLToggleButton(element);
      element.appendChild(toggleButton);

      console.log("RTL/LTR toggle button added to element:", element);
    }
  });
}

// Function to add RTL/LTR toggle button to pre elements
function addRTLToggleToPreElements() {
  const preElements = document.querySelectorAll("pre");

  preElements.forEach((preElement) => {
    // Check if button already exists for this pre element
    if (preElement.querySelector('[data-rtl-toggle-pre="true"]')) {
      return;
    }

    // Make pre element position relative if it's not already positioned
    const computedStyle = window.getComputedStyle(preElement);
    if (computedStyle.position === "static") {
      preElement.style.position = "relative";
    }

    // Ensure overflow is visible so button can be seen outside
    preElement.style.overflow = "visible";

    // Also ensure parent has overflow visible
    if (preElement.parentElement) {
      preElement.parentElement.style.overflow = "visible";
    }

    // Create and add the toggle button for pre element
    const toggleButton = createRTLToggleButton(preElement, true);
    preElement.appendChild(toggleButton);

    console.log("RTL/LTR toggle button added to pre element:", preElement);
  });
}

// Function to add RTL/LTR toggle button to the chat input
function addRTLToggleToChatInput() {
  const chatInput = document.querySelector('[data-testid="chat-input"]');
  if (!chatInput) return;

  // Use the parent as the button container (can't put button inside contenteditable)
  const container = chatInput.parentElement;
  if (!container) return;

  // Check if button already exists
  if (container.querySelector('[data-rtl-toggle-input="true"]')) return;

  const button = document.createElement("button");
  button.className = "rtl-toggle-btn";
  button.type = "button";
  button.title = "Toggle RTL/LTR";
  button.setAttribute("data-rtl-toggle", "true");
  button.setAttribute("data-rtl-toggle-input", "true");

  button.style.position = "absolute";
  button.style.top = "8px";
  button.style.zIndex = "1000";
  button.style.background = "linear-gradient(135deg, #00D68F 0%, #0095FF 100%)";
  button.style.transition = "all 0.3s ease";
  button.style.cursor = "pointer";
  button.style.border = "none";
  button.style.borderRadius = "6px";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.width = "28px";
  button.style.height = "28px";
  button.style.padding = "5px";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "18");
  svg.setAttribute("height", "18");
  svg.setAttribute("viewBox", "0 0 128 128");
  svg.setAttribute("aria-hidden", "true");

  const rects = [
    { x: 24, y: 20, width: 80 },
    { x: 40, y: 44, width: 64 },
    { x: 32, y: 68, width: 72 },
    { x: 48, y: 92, width: 56 },
  ];
  rects.forEach(({ x, y, width }) => {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", width);
    rect.setAttribute("height", "12");
    rect.setAttribute("rx", "3");
    rect.setAttribute("fill", "white");
    svg.appendChild(rect);
  });

  button.appendChild(svg);

  let isRTL = chatInput.dir === "rtl";

  const updateButtonState = (rtl) => {
    if (rtl) {
      button.style.right = "-40px";
      button.style.left = "auto";
      svg.style.transform = "scaleX(1)";
    } else {
      button.style.left = "-40px";
      button.style.right = "auto";
      svg.style.transform = "scaleX(-1)";
    }
  };

  updateButtonState(isRTL);

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    isRTL = !isRTL;
    chatInput.dir = isRTL ? "rtl" : "ltr";
    updateButtonState(isRTL);
    chatInput.focus();
    console.log(`Chat input direction changed to: ${isRTL ? "RTL" : "LTR"}`);
  });

  // Ensure parent is positioned for absolute button
  const computedStyle = window.getComputedStyle(container);
  if (computedStyle.position === "static") {
    container.style.position = "relative";
  }
  container.style.overflow = "visible";

  container.appendChild(button);
  console.log("RTL/LTR toggle button added to chat input");
}

// Run initially when page loads
injectStyles();
highlightRenderCountElements();
addRTLToggleToElements();
addRTLToggleToPreElements();
addRTLToggleToChatInput();
keepActionBarsLTR();

// Watch for dynamically added elements
const observer = new MutationObserver(() => {
  highlightRenderCountElements();
  addRTLToggleToElements();
  addRTLToggleToPreElements();
  addRTLToggleToChatInput();
  keepActionBarsLTR();
});

// Start observing the document body for changes
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["data-test-render-count"],
});

// Also run periodically as a fallback
setInterval(() => {
  highlightRenderCountElements();
  addRTLToggleToElements();
  addRTLToggleToPreElements();
  addRTLToggleToChatInput();
  keepActionBarsLTR();
}, 1000);
