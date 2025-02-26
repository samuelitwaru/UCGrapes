class TemplateUpdate {
  constructor(templateManager) {
    this.templateManager = templateManager;
  }

  updateRightButtons(containerRow) {
    if (!containerRow) return;

    const templates = containerRow.components();
    if (!templates.length) return;

    const count = templates.length;
    const styleConfig = this.getStyleConfig(count);
    if (!styleConfig) return;

    const screenWidth = window.innerWidth;
    const isTemplateOne = count === 1;

    this.updateTitleElements(containerRow, count, screenWidth, styleConfig);
    this.updateTemplateElements(
      containerRow,
      templates,
      count,
      screenWidth,
      isTemplateOne,
      styleConfig
    );
  }

  getStyleConfig(count) {
    const styleConfigs = {
      1: {
        title: { "letter-spacing": "1.1px", "font-size": "16px" },
        template: { "justify-content": "start", "align-items": "start" },
        rightButton: { display: "flex" },
        titleSection: { "text-align": "left" },
        attributes: { "tile-align": "left"}
      },
      2: {
        title: { "letter-spacing": "0.9px", "font-size": "14px" },
        template: { "justify-content": "start", "align-items": "start" },
        rightButton: { display: "flex" },
        titleSection: { "text-align": "left" },
        attributes: { "tile-align": "left"}
      },
      3: {
        title: { "letter-spacing": "0.9px", "font-size": "12px" },
        template: { "justify-content": "center", "align-items": "center" },
        rightButton: { display: "none" },
        titleSection: { "text-align": "center" },
        attributes: { "tile-align": "center"}
      },
    };

    return styleConfigs[count] || null;
  }

  updateTitleElements(containerRow, count, screenWidth, styleConfig) {
    // Update titles
    const titles = containerRow.find(".tile-title");
    titles.forEach((title) => {
      title.parent().addStyle({
        ...styleConfig.title,
        textAlign: count === 3 ? "center" : "left",
      });
      let tileTitle =
        title.getEl().getAttribute("title") || title.getEl().innerText;

      if (count === 3) {
        // Format title for three templates
        let words = tileTitle.split(" ");
        if (words.length > 2) {
          tileTitle = words.slice(0, 2).join(" ");
        }

        if (tileTitle.length > 13) {
          tileTitle = tileTitle.substring(0, 13).trim() + "..";
        }

        let truncatedWords = tileTitle.split(" ");
        if (truncatedWords.length > 1) {
          tileTitle =
            truncatedWords.slice(0, 1).join(" ") + "<br>" + truncatedWords[1];
        }

        title.parent().addStyle({ textAlign: "center" });
      } else {
        tileTitle = tileTitle.replace("<br>", "");

        // Handle title length based on template count and screen width
        if (count === 2) {
          if (tileTitle.length > (screenWidth <= 1440 ? 11 : 13)) {
            tileTitle =
              tileTitle.substring(0, screenWidth <= 1440 ? 11 : 13).trim() +
              "...";
          }
        }

        if (count === 1) {
          if (tileTitle.length > (screenWidth <= 1440 ? 20 : 24)) {
            tileTitle =
              tileTitle.substring(0, screenWidth <= 1440 ? 20 : 24).trim() +
              "...";
          }
        }
      }

      title.components(tileTitle);
    });

    // Update title sections
    const titleSections = containerRow.find(".tile-title-section");
    if (titleSections.length) {
      titleSections.forEach((section) =>
        section.addStyle(styleConfig.titleSection)
      );
    }
  }

  updateTemplateElements(
    containerRow,
    templates,
    count,
    screenWidth,
    isTemplateOne,
    styleConfig
  ) {
    // Update template blocks
    const templateBlocks = containerRow.find(".template-block");
    templateBlocks.forEach((template) => {
      const isPriority = template
        .getClasses()
        ?.includes("high-priority-template");

      const templateHeight =
        screenWidth <= 1440
          ? isPriority && isTemplateOne
            ? "6.0rem"
            : "4.5em"
          : isPriority && isTemplateOne
          ? "7rem"
          : "5.5rem";

      const templateStyles = {
        ...styleConfig.template,
        height: templateHeight,
        "text-transform":
          isPriority && isTemplateOne ? "uppercase" : "capitalize",
      };

      template.addStyle(templateStyles);
      template.addAttributes(styleConfig.attributes);
    });

    // Update right buttons and template attributes
    templates.forEach((template) => {
      if (!template?.view?.el) return;

      const rightButton = template.find(".add-button-right")[0];
      if (rightButton) rightButton.addStyle(styleConfig.rightButton);
    });
  }
}
