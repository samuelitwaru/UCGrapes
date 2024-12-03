let isResizing = false;
let currentResizer;
let initialWidth;
let initialX;
let currentTemplateComponent;
let nextTemplateComponent;
let selectedTemplateWrapper;
let selectedComponent;

// Initialize editor with necessary configurations
editor.on("load", () => {
  // Add initial template
  addInitialTemplate();

  // Set up event delegation for template actions
  const wrapper = editor.getWrapper();
  wrapper.view.el.addEventListener("click", (e) => {
    const button = e.target.closest(".action-button");
    if (!button) return;

    const templateWrapper = button.closest(".template-wrapper");
    if (!templateWrapper) return;

    const templateComponent = editor.Components.getById(templateWrapper.id);
    if (!templateComponent) return;

    if (button.classList.contains("delete-button")) {
      deleteTemplate(templateComponent);
    } else if (button.classList.contains("add-button-bottom")) {
      addTemplateBottom(templateComponent);
    } else if (button.classList.contains("add-button-right")) {
      addTemplateRight(templateComponent);
    }
  });

  const frameEl = editor.Canvas.getFrameEl();
  frameEl.contentDocument.addEventListener("mousedown", initResize);
  frameEl.contentDocument.addEventListener("mousemove", resize);
  frameEl.contentDocument.addEventListener("mouseup", stopResize);
  // Also add listeners to the main document for when mouse moves outside iframe
  document.addEventListener("mousemove", resize);
  document.addEventListener("mouseup", stopResize);

  // disable selection and droppable on wrapper
  wrapper.set({
    selectable: false,
    droppable: false,
    resizable: {
      handles: "e",
    },
  });
});

function initResize(e) {
  const resizer = e.target.closest(".resize-handle");
  if (!resizer) return;

  const templateWrapper = resizer.closest(".template-wrapper");
  const containerRow = templateWrapper.parentElement;

  if (!containerRow) return;

  const templates = Array.from(containerRow.children).filter((child) =>
    child.classList.contains("template-wrapper")
  );

  // Don't initiate resize if there are 3 templates
  if (templates.length === 3) return;

  isResizing = true;
  currentResizer = resizer;

  initialWidth = templateWrapper.offsetWidth;
  initialX = e.clientX;

  document.body.style.cursor = "col-resize";
}

function resize(e) {
  if (!isResizing) return;

  const templateWrapper = currentResizer.closest(".template-wrapper");
  const containerRow = templateWrapper.parentElement;

  if (!containerRow) return;

  const templates = Array.from(containerRow.children).filter((child) =>
    child.classList.contains("template-wrapper")
  );

  // Don't allow resizing if there are 3 templates in the row
  if (templates.length === 3) {
    stopResize();
    return;
  }

  const currentIndex = templates.indexOf(templateWrapper);
  const nextTemplate = templates[currentIndex + 1];

  // if (!nextTemplate) return;

  const deltaX = e.clientX - initialX;
  const containerWidth = containerRow.getBoundingClientRect().width;

  // Get the gap in pixels
  const gap = parseFloat(getComputedStyle(containerRow).gap);

  // Calculate the available width for both templates, excluding the gap
  const availableWidth = containerWidth - gap;

  // Calculate new widths as percentages based on the available width
  let newWidthPercent = ((initialWidth + deltaX) / availableWidth) * 100;
  let nextTemplateNewWidth = 100 - newWidthPercent;

  // Minimum width check (30%)
  const minWidth = 33.33;
  // Maximum width check (100%)
  const maxWidth = 100;

  // Constrain widths between min and max
  if (newWidthPercent < minWidth) {
    newWidthPercent = minWidth;
    nextTemplateNewWidth = 100 - minWidth;
  } else if (newWidthPercent > maxWidth) {
    newWidthPercent = maxWidth;
    nextTemplateNewWidth = 100 - maxWidth;
  }
  // Apply new widths
  templateWrapper.style.flex = `0 0 calc(${newWidthPercent}% - 0.25rem)`;
  nextTemplate.style.flex = `0 0 calc(${nextTemplateNewWidth}% - 0.5rem)`;

  // Force DOM reflow
  templateWrapper.getBoundingClientRect();
  nextTemplate.getBoundingClientRect();
}

function stopResize() {
  isResizing = false;
  document.body.style.cursor = "default";
}

function addInitialTemplate() {
  const defaultComponent = editor.addComponents(`
    <div class="frame-container"
         data-gjs-type="template-wrapper"
         data-gjs-draggable="false"
         data-gjs-selectable="false"
         data-gjs-editable="false"
         data-gjs-highlightable="false"
         data-gjs-droppable="false"
         data-gjs-hoverable="false">
      <div class="container-column"
           data-gjs-type="template-wrapper"
           data-gjs-draggable="false"
           data-gjs-selectable="false"
           data-gjs-editable="false"
           data-gjs-highlightable="false"
           data-gjs-droppable="false"
           data-gjs-hoverable="false">
        <div class="container-row"
             data-gjs-type="template-wrapper"
             data-gjs-draggable="false"
             data-gjs-selectable="false"
             data-gjs-editable="false"
             data-gjs-highlightable="true"
             data-gjs-hoverable="true">
          ${createTemplateHTML(true)}
        </div>
      </div>
    </div>
  `)[0];
}

function createTemplateHTML(isDefault = false) {
  return `
      <div class="template-wrapper ${isDefault ? "default-template" : ""}"
            data-gjs-type="template-wrapper"
            data-gjs-droppable="false">
        <div class="template-block"
             data-gjs-draggable="false"
             data-gjs-selectable="false"
             data-gjs-editable="false"
             data-gjs-highlightable="false"
             data-gjs-droppable="false"
             data-gjs-resizable="false"
             data-gjs-hoverable="false">
            <span 
              id="tile-icon" 
              class="tile-icon"
              data-gjs-draggable="false"
              data-gjs-selectable="false"
              data-gjs-editable="false"
              data-gjs-highlightable="false"
              data-gjs-hoverable="false">
              
            </span>
            <span 
              id="tile-title" 
              class="tile-title"
              data-gjs-draggable="false"
              data-gjs-selectable="false"
              data-gjs-editable="false"
              data-gjs-highlightable="false"
              data-gjs-hoverable="false"></span>
        </div>
        ${
          !isDefault
            ? `
          <button class="action-button delete-button" title="Delete template"
                    data-gjs-draggable="false"
                    data-gjs-selectable="false"
                    data-gjs-editable="false"
                    data-gjs-droppable="false"
                    data-gjs-highlightable="false"
                    data-gjs-hoverable="false">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    data-gjs-draggable="false"
                    data-gjs-selectable="false"
                    data-gjs-editable="false"
                    data-gjs-editable="false"
                    data-gjs-highlightable="false"
                    data-gjs-hoverable="false">
              <line x1="5" y1="12" x2="19" y2="12" 
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="false"
                data-gjs-hoverable="false"/>
            </svg>
          </button>
        `
            : ""
        }
        <button class="action-button add-button-bottom" title="Add template below"
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-droppable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-hoverable="false">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-hoverable="false">
            <line x1="12" y1="5" x2="12" y2="19" 
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="false"
                data-gjs-hoverable="false"/>
            <line x1="5" y1="12" x2="19" y2="12" 
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="false"
                data-gjs-hoverable="false"/>
          </svg>
        </button>
        <button class="action-button add-button-right" title="Add template right"
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-droppable="false"
                data-gjs-highlightable="false"
                data-gjs-hoverable="false">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-hoverable="false">
            <line x1="12" y1="5" x2="12" y2="19" 
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="false"
                data-gjs-hoverable="false"/>
            <line x1="5" y1="12" x2="19" y2="12" 
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="false"
                data-gjs-hoverable="false"/>
          </svg>
        </button>
        <div class="resize-handle"
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="false"
                data-gjs-hoverable="false">
        </div>
      </div>
    `;
}

function addTemplateRight(templateComponent) {
  const containerRow = templateComponent.parent();
  if (!containerRow || containerRow.components().length >= 3) return;

  const newComponents = editor.addComponents(createTemplateHTML());
  const newTemplate = newComponents[0];
  if (!newTemplate) return;

  containerRow.append(newTemplate);
  const templates = containerRow.components();

  // Always use flex for consistency
  const equalWidth = 100 / templates.length;
  console.log(equalWidth);
  templates.forEach((template) => {
    template.setStyle({
      flex: `0 0 calc(${equalWidth}% - 0.25rem)`,
      width: "auto", // Remove any existing width
    });
  });

  updateRightButtons(containerRow);
}

function addTemplateBottom(templateComponent) {
  const currentRow = templateComponent.parent();
  const containerColumn = currentRow?.parent();

  if (!containerColumn) return;

  const newRow = editor.addComponents(`
    <div class="container-row"
         data-gjs-type="template-wrapper"
         data-gjs-draggable="false"
         data-gjs-selectable="false"
         data-gjs-editable="false"
         data-gjs-highlightable="false"
         data-gjs-hoverable="false">
      ${createTemplateHTML()}
    </div>
  `)[0];

  containerColumn.append(newRow);
}

function deleteTemplate(templateComponent) {
  if (
    !templateComponent ||
    templateComponent.getClasses().includes("default-template")
  )
    return;

  const containerRow = templateComponent.parent();
  if (!containerRow) return;

  templateComponent.remove();

  if (containerRow.components().length === 0) {
    containerRow.remove();
  } else {
    // Adjust widths of remaining templates
    const templates = containerRow.components();
    const newWidth = 100 / templates.length;
    templates.forEach((template) => {
      if (template && template.setStyle) {
        template.setStyle({ width: `${newWidth}%` });
      }
      
    });

    updateRightButtons(containerRow);
  }
}

function updateRightButtons(containerRow) {
  if (!containerRow) return;

  const templates = containerRow.components();
  templates.forEach((template) => {
    if (!template || !template.view || !template.view.el) return;

    const rightButton = template.view.el.querySelector(".add-button-right");
    if (!rightButton) return;

    if (templates.length >= 3) {
      rightButton.setAttribute("disabled", "true");
    } else {
      rightButton.removeAttribute("disabled");
    }
  });
}

// Time update function
function updateTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeString = `${hours}:${minutes} ${ampm}`;
  document.getElementById("current-time").textContent = timeString;
}

updateTime();
setInterval(updateTime, 60000);

//  Themes
const themeSelect = document.getElementById("theme-select");

themes.forEach((theme) => {
  const option = document.createElement("option");
  option.value = theme.name;
  option.textContent = theme.name;
  themeSelect.appendChild(option);

  themeSelect.onChange
});

// Load the stored theme from localStorage (if available)
const storedThemeName = localStorage.getItem("selectedTheme");
if (storedThemeName) {
  const storedTheme = themes.find((theme) => theme.name === storedThemeName);

  // Apply the stored theme
  if (storedTheme) {
    themeSelect.value = storedThemeName; // Set the selected option in the dropdown
    updateThemeColorPalette(storedTheme.colors);
    applyTheme(storedTheme);
    updateColorPalette();
  }
}

// Event listener for the theme selection change
themeSelect.addEventListener("change", function () {
  const selectedTheme = themes.find((theme) => theme.name === this.value);

  if (selectedTheme) {
    updateThemeColorPalette(selectedTheme.colors);
    applyTheme(selectedTheme);
    updateColorPalette();
  }

  // Store the selected theme in localStorage
  localStorage.setItem("selectedTheme", selectedTheme.name);
});

// Function to update color palette
function updateThemeColorPalette(colors) {
  const colorBoxes = document.querySelectorAll(
    "#theme-color-palette .color-box"
  );
  const colorValues = Object.values(colors); // Get all color values from the theme object

  // Update each color-box with the respective color
  colorBoxes.forEach((box, index) => {
    if (colorValues[index]) {
      box.style.backgroundColor = colorValues[index];
      box.onclick = () => {
        selectedComponent.addStyle({
          "background-color": colorValues[index],
        });
      };
    } else {
      box.style.backgroundColor = "#ffffff"; // Set default color if not enough colors
    }
  });
}

function updateColorPalette() {
  const textColorBoxes = document.querySelectorAll(
    "#text-color-palette .color-box"
  );

  const iconColorBoxes = document.querySelectorAll(
    "#icon-color-palette .color-box"
  );

  const colorValues = {
    primaryColor: "#ffffff",
    secondaryColor: "#333333",
  };

  // Assuming textColorBoxes and iconColorBoxes are defined as NodeList or Array of elements

  textColorBoxes.forEach((box, index) => {
    const colorKey = Object.keys(colorValues)[index]; // Get the color key
    if (colorKey) {
      box.style.backgroundColor = colorValues[colorKey];
      box.onclick = () => {
        selectedComponent.addStyle({
          color: colorValues[colorKey],
        });
      };
    } else {
      box.style.backgroundColor = "#ffffff"; // Set default color if not enough colors
    }
  });

  iconColorBoxes.forEach((box, index) => {
    const colorKey = Object.keys(colorValues)[index]; // Get the color key
    if (colorKey) {
      box.style.backgroundColor = colorValues[colorKey];
      box.onclick = () => {
        const svgIcon = selectedTemplateWrapper.querySelector(
          ".tile-icon svg path"
        );

        if (svgIcon) {
          svgIcon.setAttribute("fill", colorValues[colorKey]); // Use the correct color key
        } else {
          console.log("SVG icon not found.");
        }
      };
    } else {
      box.style.backgroundColor = "#ffffff"; // Set default color if not enough colors
    }
  });
}

function applyTheme(theme) {
  const root = document.documentElement;
  const iframe = document.querySelector("#gjs iframe");

  // Set CSS variables from the selected theme
  root.style.setProperty("--primary-color", theme.colors.primaryColor);
  root.style.setProperty("--secondary-color", theme.colors.secondaryColor);
  root.style.setProperty("--background-color", theme.colors.backgroundColor);
  root.style.setProperty("--text-color", theme.colors.textColor);
  root.style.setProperty("--button-bg-color", theme.colors.buttonBgColor);
  root.style.setProperty("--button-text-color", theme.colors.buttonTextColor); // New
  root.style.setProperty("--card-bg-color", theme.colors.cardBgColor); // New
  root.style.setProperty("--card-text-color", theme.colors.cardTextColor); // New
  root.style.setProperty("--accent-color", theme.colors.accentColor);
  root.style.setProperty("--font-family", theme.fontFamily);

  console.log(root.style);

  // Apply theme to iframe (canvas editor)
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  iframeDoc.body.style.setProperty("--primary-color", theme.colors.primaryColor);
  iframeDoc.body.style.setProperty("--secondary-color", theme.colors.secondaryColor);
  iframeDoc.body.style.setProperty("--background-color", theme.colors.backgroundColor);
  iframeDoc.body.style.setProperty("--text-color", theme.colors.textColor);
  iframeDoc.body.style.setProperty("--button-bg-color",theme.colors.buttonBgColor);
  iframeDoc.body.style.setProperty("--button-text-color",theme.colors.buttonTextColor); // New
  iframeDoc.body.style.setProperty("--card-bg-color", theme.colors.cardBgColor); // New
  iframeDoc.body.style.setProperty("--card-text-color",theme.colors.cardTextColor); // New
  iframeDoc.body.style.setProperty("--accent-color", theme.colors.accentColor);
  iframeDoc.body.style.setProperty("--font-family", theme.fontFamily);
}

const inputTitle = document.getElementById("tile-title");
inputTitle.addEventListener("input", function () {
  if (selectedTemplateWrapper) {
    const tileTitle = selectedTemplateWrapper.querySelector(".tile-title");
    if (tileTitle) {
      tileTitle.textContent = inputTitle.value;
      console.log(inputTitle.value); //
    }
  }
});

// listing icons
const icons = document.getElementById("icons-list");

iconsData.forEach((icon) => {
  console.log(icon);
  const iconItem = document.createElement("div");
  iconItem.classList.add("icon");
  iconItem.innerHTML = `
    ${icon.svg}
    <span class="icon-title">${icon.name}</span>
  `;

  iconItem.onclick = () => {
    if (selectedTemplateWrapper) {
      // Find the .template-block inside the selected template wrapper
      const templateBlock = selectedTemplateWrapper.querySelector(
        ".template-block"
      );

      if (templateBlock) {
        // Insert the icon SVG into the tile-icon div
        const tileIcon = templateBlock.querySelector(".tile-icon");
        if (tileIcon) {
          tileIcon.innerHTML = icon.svg;
        }

        // Insert the icon name into the tile-title span
        const tileTitle = templateBlock.querySelector(".tile-title");
        if (tileTitle) {
          tileTitle.textContent = icon.name;
        }

        const sidebarInputTitle = document.getElementById("tile-title");
        if (sidebarInputTitle) {
          sidebarInputTitle.value = icon.name;
        }
      } else {
        console.log(
          "No .template-block found inside the selected template wrapper."
        );
      }
    } else {
      console.log("No selected template wrapper found.");
    }
  };
  icons.appendChild(iconItem);
});

/// stylle manager
// Listen for the component:selected event
editor.on("component:selected", (component) => {
  // Log the selected component
  selectedTemplateWrapper = component.getEl();

  selectedComponent = component;

});
