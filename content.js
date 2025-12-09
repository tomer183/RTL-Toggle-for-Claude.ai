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
  button.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  button.style.backdropFilter = "blur(4px)";
  button.style.transition = "all 0.3s ease";
  button.style.cursor = "pointer";
  button.style.border = "none";
  button.style.borderRadius = "6px";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.width = "32px";
  button.style.height = "32px";

  // Create inner div structure
  const innerDiv = document.createElement("div");
  innerDiv.style.display = "flex";
  innerDiv.style.alignItems = "center";
  innerDiv.style.justifyContent = "center";
  innerDiv.style.width = "20px";
  innerDiv.style.height = "20px";

  // Create SVG icon - RTL/LTR text representation
  innerDiv.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="white">
    <!-- LTR side (left-aligned lines) -->
    <rect x="2" y="4" width="8" height="1.5" rx="0.5"/>
    <rect x="2" y="8" width="6" height="1.5" rx="0.5"/>
    <rect x="2" y="12" width="7" height="1.5" rx="0.5"/>
    <!-- RTL side (right-aligned lines) -->
    <rect x="14" y="4" width="8" height="1.5" rx="0.5"/>
    <rect x="16" y="8" width="6" height="1.5" rx="0.5"/>
    <rect x="15" y="12" width="7" height="1.5" rx="0.5"/>
    <!-- Swap arrows in middle -->
    <path d="M10 17L7 15V19L10 17Z"/>
    <path d="M14 17L17 15V19L14 17Z"/>
  </svg>`;

  button.appendChild(innerDiv);

  // Get current direction state
  let isRTL;
  if (isPreElement) {
    // For pre elements, check CSS direction style
    const computedStyle = window.getComputedStyle(targetElement);
    isRTL = computedStyle.direction === "rtl";
  } else {
    isRTL = targetElement.dir === "rtl";
  }

  // Function to update button position based on direction
  const updateButtonPosition = (rtl) => {
    if (rtl) {
      button.style.right = "-52px";
      button.style.left = "auto";
    } else {
      button.style.left = "-52px";
      button.style.right = "auto";
    }
  };

  // Set initial position
  updateButtonPosition(isRTL);

  // Toggle direction on click
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    isRTL = !isRTL;

    if (isPreElement) {
      // For pre elements, only change CSS direction style (not dir attribute)
      targetElement.style.direction = isRTL ? "rtl" : "ltr";
      targetElement.style.textAlign = isRTL ? "right" : "left";

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
    } else {
      // For other elements, use dir attribute
      targetElement.dir = isRTL ? "rtl" : "ltr";
    }

    // Update button position
    updateButtonPosition(isRTL);

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

// Run initially when page loads
injectStyles();
highlightRenderCountElements();
addRTLToggleToElements();
addRTLToggleToPreElements();
keepActionBarsLTR();

// Watch for dynamically added elements
const observer = new MutationObserver(() => {
  highlightRenderCountElements();
  addRTLToggleToElements();
  addRTLToggleToPreElements();
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
  keepActionBarsLTR();
}, 1000);
