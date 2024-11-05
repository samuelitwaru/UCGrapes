const appBuilderPlugin = (editor) => {
  editor.DomComponents.addType("button-component", {
    model: {
      defaults: {
        tagName: "button",
        traits: [
          {
            type: "text",
            label: "Text",
            name: "content",
            changeProp: 1,
          },
          {
            type: "select",
            label: "Width",
            name: "width",
            options: [
              { value: "auto", name: "Auto" },
              { value: "100%", name: "Full Width" },
            ],
            changeProp: 1,
          },
          {
            type: "select",
            label: "Size",
            name: "size",
            options: [
              { value: "xs", name: "Extra Small" },
              { value: "sm", name: "Small" },
              { value: "md", name: "Medium" },
              { value: "lg", name: "Large" },
            ],
            changeProp: 1,
          },
          {
            type: "select",
            label: "Style",
            name: "buttonStyle",
            options: [
              { value: "rectangle", name: "Rectangle" },
              { value: "rounded", name: "Rounded" },
              { value: "pill", name: "Pill" },
            ],
            changeProp: 1,
          },
          {
            type: "color",
            label: "Text Color",
            name: "textColor",
            changeProp: 1,
          },
          {
            type: "color",
            label: "Background Color",
            name: "backgroundColor",
            changeProp: 1,
          },
        ],
        content: "Click Me",
        attributes: { type: "button" },
        style: {
          padding: "10px 20px",
          "font-size": "16px",
          border: "none",
          cursor: "pointer",
          "Bg-color": "#007bff",
          color: "#ffffff",
        },
      },
      init() {
        this.on("change:backgroundColor", this.updateStyles);
        this.on("change:textColor", this.updateStyles);
        this.on("change:content", this.updateContent);
        this.on("change:width", this.updateStyles);
        this.on("change:size", this.updateStyles);
        this.on("change:buttonStyle", this.updateStyles);
      },
      updateStyles() {
        const backgroundColor = this.get("backgroundColor") || "#007bff";
        const textColor = this.get("textColor") || "#ffffff";
        const width = this.get("width") || "auto";
        const size = this.get("size") || "md";
        const buttonStyle = this.get("buttonStyle") || "rectangle";

        let padding, fontSize, borderRadius;

        switch (size) {
          case "xs":
            padding = "5px 10px";
            fontSize = "12px";
            break;
          case "sm":
            padding = "8px 15px";
            fontSize = "14px";
            break;
          case "md":
            padding = "10px 20px";
            fontSize = "16px";
            break;
          case "lg":
            padding = "12px 25px";
            fontSize = "18px";
            break;
        }

        switch (buttonStyle) {
          case "rectangle":
            borderRadius = "0";
            break;
          case "rounded":
            borderRadius = "8px";
            break;
          case "pill":
            borderRadius = "50px";
            break;
        }

        this.setStyle({
          padding,
          "font-size": fontSize,
          "border-radius": borderRadius,
          width,
          "Bg-color": backgroundColor,
          color: textColor,
        });
      },
      updateContent() {
        const content = this.get("content");
        this.set("content", content);
      },
    },
    view: {
      onRender() {
        console.dir(this)
        this.model.updateStyles();
        this.updateContent();
      },
      updateContent() {
        this.el.innerHTML = this.model.get("content");
      },
    },
  });

  editor.DomComponents.addType("call-to-action", {
    model: {
      defaults: {
        tagName: "div",
        traits: [
          {
            type: "text",
            label: "Label",
            name: "labelText",
            changeProp: 1,
          },
          {
            type: "text",
            label: "Link URL",
            name: "linkUrl",
            changeProp: 1,
          },
          {
            type: "select",
            label: "Icon",
            name: "iconClass",
            options: [
              { value: "fas fa-envelope", name: "Email" },
              { value: "fas fa-sms", name: "SMS" },
              { value: "fas fa-phone", name: "Call" },
            ],
            changeProp: 1,
          },
          {
            type: "color",
            label: "BG Color",
            name: "backgroundColor",
            changeProp: 1,
          },
          {
            type: "color",
            label: "Icon Color",
            name: "iconColor",
            changeProp: 1,
          },
          {
            type: "color",
            label: "Label Color",
            name: "labelColor",
            changeProp: 1,
          },
        ],
        attributes: { class: "call-to-action-block" },
        components: [
          {
            tagName: "a",
            attributes: {
              href: "mailto:info@example.com",
              style: "text-decoration: none;",
            },
            components: [
              {
                tagName: "div",
                attributes: { class: "icon-wrapper" },
                style: {
                  "Bg-color": "#FFA500",
                  "border-radius": "50%",
                  width: "70px",
                  height: "70px",
                  margin: "0 auto",
                  display: "flex",
                  "justify-content": "center",
                  "align-items": "center",
                },
                components: [
                  {
                    tagName: "i",
                    attributes: { class: "fas fa-envelope" },
                    style: {
                      "font-size": "40px",
                      color: "white",
                      "line-height": "1",
                    },
                  },
                ],
              },
              {
                tagName: "p",
                attributes: { class: "cta-label" },
                content: "EMAIL",
                style: {
                  margin: "10px 0 0",
                  "font-weight": "bold",
                  color: "#000",
                },
              },
            ],
          },
        ],
        style: {
          "text-align": "center",
          padding: "0px",
        },
        droppable: false,
        draggable: true,
        selectable: true,
        style: {
          "text-align": "center",
          padding: "50px",
          "user-select": "none",
        },
      },
      init() {
        this.on("change:backgroundColor", this.updateStyles);
        this.on("change:iconColor", this.updateStyles);
        this.on("change:labelColor", this.updateStyles);
        this.on("change:iconClass", this.updateIcon);
        this.on("change:labelText", this.updateLabel);
        this.on("change:linkUrl", this.updateLink);

        this.components().each((component) => {
          this.disableComponent(component);
        });
      },
      disableComponent(component) {
        component.set({
          selectable: false,
          draggable: false,
          droppable: false,
          hoverable: false,
          layerable: false,
          editable: false,
        });

        if (component.components) {
          component.components().each((nestedComponent) => {
            this.disableComponent(nestedComponent);
          });
        }

        if (component.get("tagName") === "i") {
          component.set({
            highlightable: false,
            resizable: false,
            attributes: {
              ...component.get("attributes"),
            },
          });
        }
      },
      updateStyles() {
        const backgroundColor = this.get("backgroundColor") || "#FFA500";
        const iconColor = this.get("iconColor") || "white";
        const labelColor = this.get("labelColor") || "#000";

        const components = this.components();
        if (components && components.length > 0) {
          const link = components.at(0);
          if (link) {
            const iconWrapper = link.components().at(0);
            const label = link.components().at(1);

            if (iconWrapper) {
              iconWrapper.setStyle({ "Bg-color": backgroundColor });
              const icon = iconWrapper.components().at(0);
              if (icon) {
                icon.setStyle({ color: iconColor });
              }
            }

            if (label) {
              label.setStyle({ color: labelColor });
            }
          }
        }
      },
      updateIcon() {
        const iconClass = this.get("iconClass") || "fas fa-envelope";
        const components = this.components();
        if (components && components.length > 0) {
          const link = components.at(0);
          if (link) {
            const iconWrapper = link.components().at(0);
            if (iconWrapper) {
              const icon = iconWrapper.components().at(0);
              if (icon) {
                icon.set("attributes", {
                  ...icon.get("attributes"),
                  class: iconClass,
                });
              }
            }
          }
        }
      },
      updateLabel() {
        const labelText = this.get("labelText") || "EMAIL";
        const components = this.components();
        if (components && components.length > 0) {
          const link = components.at(0);
          if (link) {
            const label = link.components().at(1);
            if (label) {
              label.set("content", labelText);
            }
          }
        }
      },
      updateLink() {
        const linkUrl = this.get("linkUrl") || "mailto:info@example.com";
        const components = this.components();
        if (components && components.length > 0) {
          const link = components.at(0);
          if (link) {
            link.set("attributes", {
              ...link.get("attributes"),
              href: linkUrl,
            });
          }
        }
      },
    },
    view: {
      onRender() {
        setTimeout(() => {
          this.model.updateStyles();
          this.model.updateIcon();
          this.model.updateLabel();
          this.model.updateLink();
        }, 100);
      },
      events: {
        mousedown: "preventDefaultEvent",
        dblclick: "preventDefaultEvent",
      },
      preventDefaultEvent(e) {
        e.stopPropagation();
      },
    },
    isComponent: (el) =>
      el.classList && el.classList.contains("call-to-action-block"),
  });

  editor.DomComponents.addType("heading-component", {
    isComponent: (el) => el.tagName && el.tagName.toLowerCase() === "h3",
    model: {
      defaults: {
        tagName: "h3",
        traits: [
          {
            type: "text",
            name: "text",
            label: "Heading Text",
          },
          {
            type: "color",
            name: "color",
            label: "Text Color",
          },
          {
            type: "select",
            name: "font-family",
            label: "Font Family",
            options: [
              { value: "Arial, sans-serif", name: "Arial" },
              { value: "Helvetica, sans-serif", name: "Helvetica" },
              { value: "Georgia, serif", name: "Georgia" },
              { value: "Times New Roman, serif", name: "Times New Roman" },
              { value: "Courier New, monospace", name: "Courier New" },
            ],
          },
          {
            type: "number",
            name: "font-size",
            label: "Font Size",
            units: ["px", "em", "rem"],
          },
          {
            type: "select",
            name: "font-weight",
            label: "Font Weight",
            options: [
              { value: "300", name: "Light" },
              { value: "400", name: "Normal" },
              { value: "600", name: "Semi Bold" },
              { value: "700", name: "Bold" },
            ],
          },
          {
            type: "select",
            name: "text-align",
            label: "Text Align",
            options: [
              { value: "left", name: "Left" },
              { value: "center", name: "Center" },
              { value: "right", name: "Right" },
              { value: "justify", name: "Justify" },
            ],
          },
        ],
      },
      init() {
        this.on("change:traits", this.handleTraitChange);
        this.on("change:attributes", this.handleAttributeChange);
        this.listenTo(this.get("traits"), "change", this.handleTraitChange);
        this.handleTraitChange();
      },
      handleTraitChange() {
        this.updateContent();
        this.updateStyles();
      },
      handleAttributeChange() {
        this.updateStyles();
      },
      updateContent() {
        const text = this.getTrait("text").get("value") || "Heading Text";
        this.set("content", text);
      },
      updateStyles() {
        const color = this.getTrait("color").get("value") || "#000000";
        const fontFamily =
          this.getTrait("font-family").get("value") || "Arial, sans-serif";
        const fontSize = this.getTrait("font-size").get("value") || "20px";
        const fontWeight = this.getTrait("font-weight").get("value") || "400";
        const textAlign = this.getTrait("text-align").get("value") || "left";
        const currentStyle = this.getStyle();
        const padding = currentStyle.padding || "10px";

        this.setStyle({
          color: color,
          "font-family": fontFamily,
          "font-size": fontSize,
          "font-weight": fontWeight,
          "text-align": textAlign,
          padding: padding,
        });
      },
      getTrait(name) {
        return this.get("traits").where({ name: name })[0];
      },
    },
    view: {
      onRender({ el, model }) {
        const currentStyle = model.getStyle();
        el.style.padding = currentStyle.padding || "10px";
        el.style.margin = "0";
        model.updateStyles();
        model.updateContent();
      },
      events: {
        "change:traits": "onTraitChange",
      },
      onTraitChange() {
        this.model.handleTraitChange();
      },
    },
  });

  editor.DomComponents.addType("appbar-component", {
    isComponent: (el) =>
      el.tagName && el.tagName.toLowerCase() === "div" && el.classList.contains("appbar"),
    model: {
      defaults: {
        tagName: "div",
        attributes: { class: "appbar" },
        components: [
          {
            tagName: "button",
            attributes: { class: "back-button", style: "background: none; border: none; font-size: 24px; margin-right: 10px; padding: 0px; cursor: pointer; color: rgb(255, 255, 255);" },
            components: [
              {
                tagName: "i",
                attributes: { class: "fas fa-arrow-left" },
                selectable: false,
                hoverable: false,
                draggable: false,
              },
            ],
            selectable: false,
            hoverable: false,
            draggable: false,
          },
          {
            tagName: "h1",
            attributes: { class: "appbar-title" },
            components: "My Appbar",
            selectable: false,
            hoverable: false,
            draggable: false,
          },
        ],
        style: {
          "Bg-color": "#2196F3",
          color: "#FFFFFF",
        },
        traits: [
          {
            type: "checkbox",
            name: "enableBackButton",
            label: "Enable Back Button",
            changeProp: 1,
            default: true,
          },
          {
            type: "select",
            name: "Bg-color",
            label: "Background Color",
            options: [
              { value: "#2196F3", name: "Blue" },
              { value: "#F44336", name: "Red" },
              { value: "#4CAF50", name: "Green" },
              { value: "#FFEB3B", name: "Yellow" },
              { value: "#FFFFFF", name: "White" },
              { value: "#000000", name: "Black" },
            ],
            changeProp: 1,
          },
          {
            type: "select",
            name: "color",
            label: "Text Color",
            options: [
              { value: "#FFFFFF", name: "White" },
              { value: "#000000", name: "Black" },
              { value: "#FFEB3B", name: "Yellow" },
              { value: "#4CAF50", name: "Green" },
              { value: "#F44336", name: "Red" },
              { value: "#2196F3", name: "Blue" },
            ],
            changeProp: 1,
          },
          {
            type: "select",
            name: "icon-color",
            label: "Icon Color",
            options: [
              { value: "#FFFFFF", name: "White" },
              { value: "#000000", name: "Black" },
              { value: "#FFEB3B", name: "Yellow" },
              { value: "#4CAF50", name: "Green" },
              { value: "#F44336", name: "Red" },
              { value: "#2196F3", name: "Blue" },
            ],
            changeProp: 1,
          },
          {
            type: "text",
            name: "title",
            label: "Title",
            changeProp: 1,
          },
        ],
      },
      init() {
        this.on(
          "change:Bg-color change:color change:icon-color change:title change:enableBackButton",
          this.handleTraitChange
        );
        this.handleTraitChange();
      },
      handleTraitChange() {
        this.trigger("change:style");
      },
    },
    view: {
      onRender({ el, model }) {
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.padding = "10px 16px";
        el.style.height = "56px";
        el.style.boxSizing = "border-box";
  
        this.listenTo(model, "change:style", this.updateStyles);
        this.updateStyles();
      },
      updateStyles() {
        const model = this.model;
        const el = this.el;
  
        const backgroundColor = model.get("Bg-color") || "#2196F3";
        const color = model.get("color") || "#FFFFFF";
        const iconColor = model.get("icon-color") || "#FFFFFF";
        const title = model.get("title") || "My Appbar";
        const enableBackButton = model.get("enableBackButton");
  
        el.style.backgroundColor = backgroundColor;
        el.style.color = color;
  
        const backButton = el.querySelector(".back-button");
        if (backButton) {
          if (enableBackButton) {
            backButton.style.display = "flex";
            backButton.style.color = iconColor;
          } else {
            backButton.style.display = "none";
          }
        }
  
        const titleEl = el.querySelector(".appbar-title");
        if (titleEl) {
          titleEl.textContent = title;
          titleEl.style.color = color;
          titleEl.style.marginLeft = enableBackButton ? "32px" : "0";
        }
      },
    },
  });
  

  editor.DomComponents.addType("paragraph-component", {
    isComponent: (el) => el.tagName && el.tagName.toLowerCase() === "p",
    model: {
      defaults: {
        tagName: "p",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        traits: [
          {
            type: "textarea",
            name: "content",
            label: "Paragraph Text",
            placeholder: "Your paragraph text goes here",
            changeProp: 1,
            attributes: { style: "width: 100%;" },
          },
          {
            type: "color",
            name: "color",
            label: "Text Color",
            changeProp: 1,
          },
          {
            type: "select",
            name: "font-family",
            label: "Font Family",
            options: [
              { value: "Arial, sans-serif", name: "Arial" },
              { value: "Helvetica, sans-serif", name: "Helvetica" },
              { value: "Georgia, serif", name: "Georgia" },
              { value: "Times New Roman, serif", name: "Times New Roman" },
              { value: "Courier New, monospace", name: "Courier New" },
            ],
            changeProp: 1,
          },
          {
            type: "number",
            name: "font-size",
            label: "Font Size",
            units: ["px", "em", "rem"],
            default: "16px",
            changeProp: 1,
          },
        ],
        style: {
          padding: "10px",
        },
        droppable: false,
      },
      init() {
        this.on("change:traits", this.handleTraitChange);
        this.on("change:attributes", this.handleAttributeChange);
        this.on(
          "change:content change:color change:font-family change:font-size",
          this.updateStyles
        );
      },
      handleTraitChange() {
        this.updateContent();
        this.updateStyles();
      },
      handleAttributeChange() {
        this.updateStyles();
      },
      updateContent() {
        const content =
          this.getTrait("content").get("value") ||
          "Your paragraph text goes here";
        this.set("content", content);
      },
      updateStyles() {
        const color = this.getTrait("color").get("value") || "#000000";
        const fontFamily =
          this.getTrait("font-family").get("value") || "Arial, sans-serif";
        const fontSize = this.getTrait("font-size").get("value") || "16px";

        this.setStyle({
          color: color,
          "font-family": fontFamily,
          "font-size": fontSize,
          padding: "10px",
        });
      },
      getTrait(name) {
        return this.get("traits").where({ name })[0];
      },
    },
    view: {
      onRender({ el, model }) {
        model.updateStyles();
        model.updateContent();
      },
      events: {
        dblclick: "onActive",
      },
      onActive(e) {
        this.model.trigger("active");
      },
    },
  });

  const services = [
    { name: "Laundry", icon: "fa fa-tshirt" },
    { name: "Bakery", icon: "fa fa-bread-slice" },
    { name: "Repair", icon: "fa fa-tools" },
    { name: "Cleaning", icon: "fa fa-broom" },
    { name: "Delivery", icon: "fa fa-truck" },
  ];

  services.forEach((service) => {
    editor.Components.addType(`${service.name.toLowerCase()}-tile`, {
      isComponent: (el) =>
        el.tagName === "DIV" && el.classList.contains(`${service.name.toLowerCase()}-tile`),
        model: {
          defaults: {
            tagName: "div",
            selectable: true,
            classes: [`${service.name.toLowerCase()}-tile`, "card"],
            attributes: { style: "width: 100%; border-radius: 10px; background-color: #FF6600" },
            traits: [
              {
                type: "text",
                label: "Label",
                name: "title",
                changeProp: 1,
              },
              {
                type: "select",
                label: "Icon",
                name: "iconClass",
                changeProp: 1,
                options: [
                  { value: "fas fa-home", name: "Home" },
                  { value: "fas fa-user", name: "User" },
                  { value: "fas fa-cog", name: "Settings" },
                  { value: "fas fa-envelope", name: "Envelope" },
                  { value: "fas fa-bell", name: "Bell" },
                ],
              },
              {
                type: "select",
                label: "Tile Width",
                name: "tileWidth",
                changeProp: 1,
                options: [
                  { value: "32%", name: "One-Third Width (33%)" },
                  { value: "49%", name: "Half Width (50%)" },
                  { value: "66%", name: "Two-Thirds Width (66%)" },
                  { value: "99%", name: "Full Width (100%)" },
                ],
              },
              {
                type: "select",
                label: "Background Color",
                name: "tileBgColor",
                changeProp: 1,
                options: [
                  { value: "#FFFFFF", name: "White" },
                  { value: "#F0F0F0", name: "Light Gray" },
                  { value: "#D3D3D3", name: "Gray" },
                  { value: "#000000", name: "Black" },
                  { value: "#FF5733", name: "Orange" },
                  { value: "#5D6D7E", name: "Blue Gray" },
                  { value: "#3498DB", name: "Blue" },
                  { value: "#E74C3C", name: "Red" },
                  { value: "#2ECC71", name: "Green" },
                  { value: "#9B59B6", name: "Purple" },
                  { value: "#F1C40F", name: "Yellow" },
                  { value: "#1ABC9C", name: "Turquoise" },
                ],
              },
              {
                type: "select",
                label: "Label Color",
                name: "labelColor",
                changeProp: 1,
                options: [
                  { value: "#000000", name: "Black" },
                  { value: "#FFFFFF", name: "White" },
                  { value: "#FF5733", name: "Orange" },
                  { value: "#3498DB", name: "Blue" },
                  { value: "#E74C3C", name: "Red" },
                  { value: "#2ECC71", name: "Green" },
                  { value: "#9B59B6", name: "Purple" },
                  { value: "#F1C40F", name: "Yellow" },
                  { value: "#1ABC9C", name: "Turquoise" },
                  { value: "#7D3C98", name: "Violet" },
                  { value: "#F39C12", name: "Amber" },
                  { value: "#D35400", name: "Pumpkin" },
                  { value: "#C0392B", name: "Crimson" },
                  { value: "#2980B9", name: "Sky Blue" },
                  { value: "#27AE60", name: "Emerald" },
                  { value: "#8E44AD", name: "Lavender" },
                  { value: "#BDC3C7", name: "Silver" },
                  { value: "#34495E", name: "Navy" },
                  { value: "#2C3E50", name: "Midnight Blue" },
                ],
              },
              {
                type: "select",
                label: "Icon Color",
                name: "iconColor",
                changeProp: 1,
                options: [
                  { value: "#000000", name: "Black" },
                  { value: "#FFFFFF", name: "White" },
                  { value: "#FF5733", name: "Orange" },
                  { value: "#3498DB", name: "Blue" },
                  { value: "#E74C3C", name: "Red" },
                  { value: "#2ECC71", name: "Green" },
                ],
              },
            ],
            components: `
              <div class="card-content" style="display: flex; flex-direction: column; height: 100%;" data-gjs-selectable="false" data-gjs-hoverable="false" data-gjs-draggable="false" data-gjs-droppable="false">
              <div class="card-icon" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 10px;" data-gjs-selectable="false" data-gjs-hoverable="false" data-gjs-draggable="false" data-gjs-droppable="false">
                <i class="${service.icon}" style="font-size: 40px;" data-gjs-selectable="false" data-gjs-hoverable="false" data-gjs-draggable="false" data-gjs-droppable="false"></i>
              </div>
              <div class="card-body" style="padding: 10px; text-align: center;" data-gjs-selectable="false" data-gjs-hoverable="false" data-gjs-draggable="false" data-gjs-droppable="false">
                <h5 class="card-title" style="margin: 0; color: white; font-size: 16px;" data-gjs-selectable="false" data-gjs-hoverable="false" data-gjs-draggable="false" data-gjs-droppable="false">${service.name}</h5>
              </div>
            </div>
            `,
            droppable: false,
          },
      
          init() {
            this.on("change:title", this.updateTitle);
            this.on("change:iconClass", this.updateIconClass);
            this.on("change:tileWidth", this.updateTileWidth);
            this.on("change:tileBgColor", this.updateTileBgColor);
            this.on("change:labelColor", this.updateLabelColor);
            this.on("change:iconColor", this.updateIconColor);
          },
      
          updateTitle() {
            const title = this.get("title") || service.name;
            const titleEl = this.view.el.querySelector(".card-title");
            if (titleEl) titleEl.textContent = title;
          },
      
          updateIconClass() {
            const iconClass = this.get("iconClass") || service.icon;
            const iconEl = this.view.el.querySelector(".card-icon i");
            if (iconEl) iconEl.setAttribute("class", iconClass);
          },
      
          updateTileWidth() {
            const tileWidth = this.get("tileWidth") || "100%";
            this.view.el.style.width = tileWidth;
          },
      
          updateTileBgColor() {
            const bgColor = this.get("tileBgColor") || "#FFFFFF";
            this.view.el.style.backgroundColor = bgColor;
          },
      
          updateLabelColor() {
            const labelColor = this.get("labelColor") || "#000000";
            const labelEl = this.view.el.querySelector(".card-title");
            if (labelEl) labelEl.style.color = labelColor;
          },
      
          updateIconColor() {
            const iconColor = this.get("iconColor") || "#000000";
            const iconEl = this.view.el.querySelector(".card-icon i");
            if (iconEl) iconEl.style.color = iconColor
          },
        },
      
        view: {
          onRender() {
            this.model.updateTitle();
            this.model.updateIconClass();
            this.model.updateTileWidth();
            this.model.updateTileBgColor();
            this.model.updateLabelColor();
            this.model.updateIconColor();
          },
        },
      });
    
    editor.BlockManager.add(`${service.name.toLowerCase()}-tile`, {
      label: `${service.name}`,
      category: "Services",
      content: {
        type: `${service.name.toLowerCase()}-tile`,
        activeOnRender: true,
      },
      attributes: { class: `${service.icon}` },
    });
  });
  
  editor.DomComponents.addType("container-component", {
    model: {
      defaults: {
        tagName: "div",
        traits: [
          {
            type: "text",
            label: "ID",
            name: "id",
            changeProp: 1,
          },
          {
            type: "text",
            label: "Class",
            name: "class",
            changeProp: 1,
          },
        ],
        attributes: { class: "container" },
        style: {
          padding: "5px",
          width: "100%",
          height: "100%",
          display: "flex",
          "min-height": "100px",
          "flex-wrap": "wrap",
          "box-sizing": "border-box",
          gap: "5px", 
        },
      },
      init() {
        this.on("change:id", this.updateId);
        this.on("change:class", this.updateClass);
      },
      updateId() {
        const id = this.get("id") || "";
        this.setAttributes({ id });
      },
      updateClass() {
        const className = this.get("class") || "container";
        this.setAttributes({ class: className });
      },
    },
    view: {
      onRender() {
        this.model.updateId();
        this.model.updateClass();
      },
    },
  });

  editor.BlockManager.add("container-block", {
    label: "Container",
    category: "Layout",
    content: { type: "container-component" },
    attributes: { class: "fa fa-square" },
  });

  editor.BlockManager.add("paragraph-block", {
    label: "Paragraph",
    content: { type: "paragraph-component" },
    category: "Basic",
    attributes: { class: "fa fa-paragraph" },
  });

  editor.BlockManager.add("appbar-block", {
    label: "Appbar",
    content: { type: "appbar-component" },
    category: "Basic",
    attributes: { class: "fa fa-bars" },
  });

  editor.BlockManager.add("heading-block", {
    label: "Heading",
    content: { type: "heading-component", content: "Insert heading text" },
    category: "Basic",
    attributes: { class: "fa fa-heading" },
  });

  editor.BlockManager.add("button-block", {
    label: "Button",
    content: { type: "button-component" },
    category: "Basic",
    attributes: { class: "fa fa-tablet-button" },
  });

  editor.BlockManager.add("call-to-action", {
    label: "CTA Button",
    category: "Basic",
    content: { type: "call-to-action" },
    attributes: { 
      src: "https://cdn-icons-png.flaticon.com/512/2815/2815428.png" // Replace with your actual image URL
    },
    media: `<img src="https://cdn-icons-png.flaticon.com/512/2815/2815428.png" style="width: 24px; height: 24px;" />`,
  });
 

};

grapesjs.plugins.add("app-builder-plugin", appBuilderPlugin);
