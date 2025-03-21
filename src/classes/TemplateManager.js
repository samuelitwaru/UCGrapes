class TemplateManager {
  constructor(currentLanguage, editorManager) {
    this.currentLanguage = currentLanguage;
    this.editorManager = editorManager;
    this.defaultConstraints = {
      draggable: false,
      selectable: false,
      editable: false,
      highlightable: false,
      droppable: false,
      hoverable: false,
    };
    this.templateUpdate = new TemplateUpdate(this);
    this.screenWidth = window.innerWidth;
  }

  createTemplateHTML(isDefault = false) {
    let tileBgColor = "transparent";
    return `
            <div class="template-wrapper ${
              isDefault ? "default-template" : ""
            }"        
                  data-gjs-selectable="false"
                  data-gjs-type="tile-wrapper"
                  data-gjs-editable="false"
                  data-gjs-highlightable="false"
                  data-gjs-droppable="false"
                  data-gjs-resizable="false"
                  data-gjs-hoverable="false">
              <div class="template-block"
                style="background-color:${tileBgColor}; color:#333333; height: ${
      this.screenWidth <= 1440 ? "4.5rem" : "5rem"
    }"
                tile-bgcolor="${tileBgColor}"
                tile-bgcolor-name=""
                tile-color="#333333"

                ${defaultTileAttrs} 
                 data-gjs-draggable="false"
                 data-gjs-selectable="true"
                 data-gjs-editable="false"
                 data-gjs-highlightable="false"
                 data-gjs-droppable="false"
                 data-gjs-resizable="false"
                 data-gjs-hoverable="false">
                
                 <div class="tile-icon-section"
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-highlightable="false"
                  data-gjs-droppable="false"
                  data-gjs-resizable="false"
                  data-gjs-hoverable="false"
                  >
                    <span class="tile-close-icon top-right selected-tile-icon"
                      data-gjs-draggable="false"
                      data-gjs-selectable="false"
                      data-gjs-editable="false"
                      data-gjs-highlightable="false"
                      data-gjs-droppable="false"
                      data-gjs-resizable="false"
                      data-gjs-hoverable="false"
                      >&times;</span>
                    <span 
                      class="tile-icon"
                      is-hidden = "true"
                      data-gjs-draggable="false"
                      data-gjs-selectable="false"
                      data-gjs-editable="false"
                      data-gjs-droppable="false"
                      data-gjs-highlightable="false"
                      data-gjs-hoverable="false">
                    </span>
                </div>
                <div class="tile-title-section"
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-highlightable="false"
                  data-gjs-droppable="false"
                  data-gjs-resizable="false"
                  data-gjs-hoverable="false"
                  >
                    <span class="tile-close-icon top-right selected-tile-title"
                      data-gjs-draggable="false"
                      data-gjs-selectable="false"
                      data-gjs-editable="false"
                      data-gjs-highlightable="false"
                      data-gjs-droppable="false"
                      data-gjs-resizable="false"
                      data-gjs-hoverable="false"
                      >&times;</span>
                    <span 
                      class="tile-title"
                      is-hidden = "false"
                      data-gjs-draggable="false"
                      data-gjs-selectable="false"
                      data-gjs-editable="false"
                      data-gjs-droppable="false"
                      data-gjs-highlightable="false"
                      title="${this.currentLanguage.getTranslation(
                        "tile_title"
                      )}"
                      data-gjs-hoverable="false">${this.currentLanguage.getTranslation(
                        "tile_title"
                      )}</span>
                    </div>
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
                          data-gjs-droppable="false"
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
                      data-gjs-droppable="false"
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
                      data-gjs-droppable="false"
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

  generateTemplateRow(columns, rowIndex) {
    let tileBgColor = "transparent";
    let columnWidth = 100 / columns;
    if (columns === 1) {
      columnWidth = 100;
    } else if (columns === 2) {
      columnWidth = 49;
    } else if (columns === 3) {
      columnWidth = 32;
    }

    let wrappers = "";

    for (let i = 0; i < columns; i++) {
      // Only exclude delete button for first tile of first row
      const isFirstTileOfFirstRow = rowIndex === 0 && i === 0;
      const deleteButton = isFirstTileOfFirstRow
        ? ""
        : `
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
                            data-gjs-droppable="false"
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
                    </button>`;

      wrappers += `
                <div class="template-wrapper"
                          style="flex: 0 0 ${columnWidth}%);"
                          data-gjs-type="tile-wrapper"
                          data-gjs-selectable="false"
                          data-gjs-droppable="false">

                          <div class="template-block ${
                            isFirstTileOfFirstRow
                              ? "high-priority-template"
                              : ""
                          }"
                            tile-bgcolor="${tileBgColor}"
                            tile-bgcolor-name=""
                            style="background-color:${tileBgColor}; color:#333333; height: ${
        isFirstTileOfFirstRow
          ? this.screenWidth <= 1440
            ? "6.5rem"
            : "7rem"
          : this.screenWidth <= 1440
          ? "4.5rem"
          : "5rem"
      }"
                            ${defaultTileAttrs}
                            data-gjs-draggable="false"
                            data-gjs-selectable="true"
                            data-gjs-editable="false"
                            data-gjs-highlightable="false"
                            data-gjs-droppable="false"
                            data-gjs-resizable="false"
                            data-gjs-hoverable="false">
                            
                            <div class="tile-icon-section"
                              data-gjs-draggable="false"
                              data-gjs-selectable="false"
                              data-gjs-editable="false"
                              data-gjs-highlightable="false"
                              data-gjs-droppable="false"
                              data-gjs-resizable="false"
                              data-gjs-hoverable="false"
                              >
                                <span class="tile-close-icon top-right selected-tile-icon"
                                  data-gjs-draggable="false"
                                  data-gjs-selectable="false"
                                  data-gjs-editable="false"
                                  data-gjs-highlightable="false"
                                  data-gjs-droppable="false"
                                  data-gjs-resizable="false"
                                  data-gjs-hoverable="false"
                                  >&times;</span>
                                <span 
                                  class="tile-icon"
                                  is-hidden = "true"
                                  data-gjs-draggable="false"
                                  data-gjs-selectable="false"
                                  data-gjs-editable="false"
                                  data-gjs-droppable="false"
                                  data-gjs-highlightable="false"
                                  data-gjs-hoverable="false">
                                </span>
                            </div>
                            <div class="tile-title-section"
                              data-gjs-draggable="false"
                              data-gjs-selectable="false"
                              data-gjs-editable="false"
                              data-gjs-highlightable="false"
                              data-gjs-droppable="false"
                              data-gjs-resizable="false"
                              data-gjs-hoverable="false"
                              >
                                <span class="tile-close-icon top-right selected-tile-title"
                                  data-gjs-draggable="false"
                                  data-gjs-selectable="false"
                                  data-gjs-editable="false"
                                  data-gjs-highlightable="false"
                                  data-gjs-droppable="false"
                                  data-gjs-resizable="false"
                                  data-gjs-hoverable="false"
                                  >&times;</span>
                                <span 
                                  class="tile-title"
                                  is-hidden = "false"
                                  data-gjs-draggable="false"
                                  data-gjs-selectable="false"
                                  data-gjs-editable="false"
                                  data-gjs-droppable="false"
                                  data-gjs-highlightable="false"
                                  data-gjs-hoverable="false">${this.currentLanguage.getTranslation(
                                    "tile_title"
                                  )}</span>
                                </div>
                          </div>
                          ${deleteButton}
                          <button class="action-button add-button-bottom" title="Add template below"
                                  data-gjs-draggable="false"
                                  data-gjs-selectable="false"
                                  data-gjs-droppable="false"
                                  data-gjs-editable="false"
                                  data-gjs-highlightable="false"
                                  data-gjs-hoverable="false"
                                  >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                  data-gjs-draggable="false"
                                  data-gjs-selectable="false"
                                  data-gjs-editable="false"
                                  data-gjs-editable="false"
                                  data-gjs-highlightable="false"
                                  data-gjs-droppable="false"
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
                                  data-gjs-droppable="false"
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
    return `
                      <div class="container-row"
                          data-gjs-type="template-wrapper"
                          data-gjs-draggable="false"
                          data-gjs-selectable="false"
                          data-gjs-editable="false"
                          data-gjs-highlightable="true"
                          data-gjs-droppable="[data-gjs-type='tile-wrapper']"
                          data-gjs-hoverable="true">
                        ${wrappers}
                    </div>
              `;
  }

  addFreshTemplate(template) {
    const currentEditor = this.editorManager.currentEditor;

    const page = this.editorManager.getPage(currentEditor.pageId);
    if (
      page &&
      (page.PageIsContentPage ||
        page.PageName === "Location" ||
        page.PageName === "Reception" ||
        page.PageName === "Mailbox" ||
        page.PageName === "Calendar" ||
        page.PageIsDynamicForm)
    ) {
      const message = this.currentLanguage.getTranslation(
        "templates_only_added_to_menu_pages"
      );
      this.editorManager.toolsSection.ui.displayAlertMessage(message, "error");
      return;
    }

    currentEditor.editor.DomComponents.clear();
    let fullTemplate = "";

    template.forEach((columns, rowIndex) => {
      const templateRow = this.generateTemplateRow(columns, rowIndex);
      fullTemplate += templateRow;
    });

    currentEditor.editor.addComponents(`
      <div class="frame-container"
            id="frame-container"
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
            ${fullTemplate}
        </div>
      </div>
    `);

    const message = this.currentLanguage.getTranslation(
      "template_added_success_message"
    );
    const status = "success";
    this.editorManager.toolsSection.ui.displayAlertMessage(message, status);
  }

  deleteTemplate(templateComponent) {
    if (
      !templateComponent ||
      templateComponent.getClasses().includes("default-template")
    )
      return;

    const containerRow = templateComponent.parent();
    if (!containerRow) return;

    const tileComponent = templateComponent.find(".template-block")[0];
    const tileActionActionId =
      tileComponent.getAttributes()?.["tile-action-object-id"];

    if (tileActionActionId) {
      const editors = Object.entries(this.editorManager.editors);

      editors.forEach(([key, element]) => {
        if (element.pageId === tileActionActionId) {
          const frameId = key.replace("#", "");
          this.editorManager.removePageOnTileDelete(frameId);
        }
      });
    }

    templateComponent.remove();

    const templates = containerRow.components();
    const newWidth = 100 / templates.length;
    templates.forEach((template) => {
      if (template && template.setStyle) {
        template.addStyle({
          width: `${newWidth}%`,
        });
      }
    });

    this.editorManager.toolsSection.mappingComponent.init();
    this.templateUpdate.updateRightButtons(containerRow);
  }

  addTemplateRight(templateComponent, editorInstance) {
    const containerRow = templateComponent.parent();
    if (!containerRow || containerRow.components().length >= 3) return;
    const newComponents = editorInstance.addComponents(
      this.createTemplateHTML()
    );
    const newTemplate = newComponents[0];
    if (!newTemplate) return;

    const index = templateComponent.index();
    containerRow.append(newTemplate, {
      at: index + 1,
    });
    const templates = containerRow.components();

    const equalWidth = 100 / templates.length;
    templates.forEach((template) => {
      template.addStyle({
        flex: `0 0 calc(${equalWidth}% - 0.3.5rem)`,
      });
    });

    this.templateUpdate.updateRightButtons(containerRow);
  }

  addTemplateBottom(templateComponent, editorInstance) {
    const currentRow = templateComponent.parent();
    const containerColumn = currentRow?.parent();

    if (!containerColumn) return;

    const newRow = editorInstance.addComponents(`
            <div class="container-row"
                data-gjs-type="template-wrapper"
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="[data-gjs-type='tile-wrapper']"
                data-gjs-hoverable="false">
                ${this.createTemplateHTML()}
            </div>
            `)[0];

    const index = currentRow.index();
    containerColumn.append(newRow, {
      at: index + 1,
    });
  }

  initialContentPageTemplate(contentPageData) {
    const contentPage = this.addDefaultConstraintsToContentDesc(contentPageData.ProductServiceDescription);
    return `
        <div
            class="content-frame-container test"
            id="frame-container"
            data-gjs-draggable="false"
            data-gjs-selectable="false"
            data-gjs-editable="false"
            data-gjs-highlightable="false"
            data-gjs-droppable="false"
            data-gjs-hoverable="false"
        >
            <div
                class="container-column"
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="false"
                data-gjs-hoverable="false"
            >
                <div
                    class="container-row"
                    data-gjs-draggable="false"
                    data-gjs-selectable="false"
                    data-gjs-editable="false"
                    data-gjs-droppable="[data-gjs-type='tile-wrapper']"
                    data-gjs-highlightable="true"
                    data-gjs-hoverable="true"
                >
                    <div
                        class="template-wrapper"
                        data-gjs-draggable="false"
                        data-gjs-selectable="false"
                        data-gjs-editable="false"
                        data-gjs-droppable="false"
                        data-gjs-highlightable="true"
                        data-gjs-hoverable="true"
                        style="display: flex; width: 100%"
                    >
                        <div
                            data-gjs-draggable="false"
                            data-gjs-selectable="false"
                            data-gjs-editable="false"
                            data-gjs-highlightable="false"
                            data-gjs-droppable="[data-gjs-type='product-service-description'], [data-gjs-type='product-service-image']"
                            data-gjs-resizable="false"
                            data-gjs-hoverable="false"
                            style="flex: 1; padding: 0"
                            class="content-page-wrapper"
                        >
                            ${
                              contentPageData.ProductServiceImage
                                ? `
                                <div ${defaultConstraints} id="content-image">
                                  <button ${defaultConstraints} class="tb-edit-image-icon">
                                      <svg ${defaultConstraints} width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path ${defaultConstraints} fill-rule="evenodd" clip-rule="evenodd" d="M18.4324 4C18.2266 4 18.0227 4.04055 17.8325 4.11933C17.6423 4.19811 17.4695 4.31358 17.3239 4.45914L5.25659 16.5265L4.42524 19.5748L7.47353 18.7434L19.5409 6.67608C19.6864 6.53051 19.8019 6.3577 19.8807 6.16751C19.9595 5.97732 20 5.77348 20 5.56761C20 5.36175 19.9595 5.1579 19.8807 4.96771C19.8019 4.77752 19.6864 4.60471 19.5409 4.45914C19.3953 4.31358 19.2225 4.19811 19.0323 4.11933C18.8421 4.04055 18.6383 4 18.4324 4ZM17.0671 2.27157C17.5 2.09228 17.9639 2 18.4324 2C18.9009 2 19.3648 2.09228 19.7977 2.27157C20.2305 2.45086 20.6238 2.71365 20.9551 3.04493C21.2864 3.37621 21.5492 3.7695 21.7285 4.20235C21.9077 4.63519 22 5.09911 22 5.56761C22 6.03611 21.9077 6.50003 21.7285 6.93288C21.5492 7.36572 21.2864 7.75901 20.9551 8.09029L8.69996 20.3454C8.57691 20.4685 8.42387 20.5573 8.25597 20.6031L3.26314 21.9648C2.91693 22.0592 2.54667 21.9609 2.29292 21.7071C2.03917 21.4534 1.94084 21.0831 2.03526 20.7369L3.39694 15.7441C3.44273 15.5762 3.53154 15.4231 3.6546 15.3001L15.9097 3.04493C16.241 2.71365 16.6343 2.45086 17.0671 2.27157Z" fill="#5068a8"/>
                                      </svg>
                                    </button>
                                    <button ${defaultConstraints} class="tb-delete-image-icon">
                                      <svg fill="#5068a8" ${defaultConstraints} width="14px" height="14px" viewBox="0 0 36 36" version="1.1"  preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                          <title ${defaultConstraints}>trash-line</title>
                                          <path fill="#5068a8" ${defaultConstraints} class="clr-i-outline clr-i-outline-path-1" d="M27.14,34H8.86A2.93,2.93,0,0,1,6,31V11.23H8V31a.93.93,0,0,0,.86,1H27.14A.93.93,0,0,0,28,31V11.23h2V31A2.93,2.93,0,0,1,27.14,34Z"></path><path class="clr-i-outline clr-i-outline-path-2" d="M30.78,9H5A1,1,0,0,1,5,7H30.78a1,1,0,0,1,0,2Z"></path>
                                          <rect fill="#5068a8" ${defaultConstraints} class="clr-i-outline clr-i-outline-path-3" x="21" y="13" width="2" height="15"></rect>
                                          <rect fill="#5068a8" ${defaultConstraints} class="clr-i-outline clr-i-outline-path-4" x="13" y="13" width="2" height="15"></rect>
                                          <path fill="#5068a8" ${defaultConstraints} class="clr-i-outline clr-i-outline-path-5" d="M23,5.86H21.1V4H14.9V5.86H13V4a2,2,0,0,1,1.9-2h6.2A2,2,0,0,1,23,4Z"></path>
                                          <rect fill="#5068a8" ${defaultConstraints} x="0" y="0" width="36" height="36" fill-opacity="0"/>
                                      </svg>
                                    </button>
                                  <img
                                      id="product-service-image"
                                      data-gjs-draggable="true"
                                      data-gjs-selectable="false"
                                      data-gjs-editable="false"
                                      data-gjs-droppable="false"
                                      data-gjs-highlightable="false"
                                      data-gjs-hoverable="true"
                                      src="${contentPageData.ProductServiceImage}"
                                      data-gjs-type="product-service-image"
                                      alt="Full-width Image"
                                  />
                                </div>
                            `
                                : ""
                            }
                            ${
                              contentPageData.ProductServiceDescription
                                ? `
                                <div
                                    style="flex: 1; padding: 0; margin: 0; height: auto; white-space: normal;"
                                    class="content-page-block"
                                    data-gjs-draggable="true"
                                    data-gjs-selectable="false"
                                    data-gjs-editable="false"
                                    data-gjs-droppable="false"
                                    data-gjs-highlightable="false"
                                    data-gjs-hoverable="false"
                                    id="product-service-description"
                                    data-gjs-type="product-service-description"
                                >
                                  <button ${defaultConstraints} class="tb-edit-content-icon">
                                    <svg ${defaultConstraints} width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path ${defaultConstraints} fill-rule="evenodd" clip-rule="evenodd" d="M18.4324 4C18.2266 4 18.0227 4.04055 17.8325 4.11933C17.6423 4.19811 17.4695 4.31358 17.3239 4.45914L5.25659 16.5265L4.42524 19.5748L7.47353 18.7434L19.5409 6.67608C19.6864 6.53051 19.8019 6.3577 19.8807 6.16751C19.9595 5.97732 20 5.77348 20 5.56761C20 5.36175 19.9595 5.1579 19.8807 4.96771C19.8019 4.77752 19.6864 4.60471 19.5409 4.45914C19.3953 4.31358 19.2225 4.19811 19.0323 4.11933C18.8421 4.04055 18.6383 4 18.4324 4ZM17.0671 2.27157C17.5 2.09228 17.9639 2 18.4324 2C18.9009 2 19.3648 2.09228 19.7977 2.27157C20.2305 2.45086 20.6238 2.71365 20.9551 3.04493C21.2864 3.37621 21.5492 3.7695 21.7285 4.20235C21.9077 4.63519 22 5.09911 22 5.56761C22 6.03611 21.9077 6.50003 21.7285 6.93288C21.5492 7.36572 21.2864 7.75901 20.9551 8.09029L8.69996 20.3454C8.57691 20.4685 8.42387 20.5573 8.25597 20.6031L3.26314 21.9648C2.91693 22.0592 2.54667 21.9609 2.29292 21.7071C2.03917 21.4534 1.94084 21.0831 2.03526 20.7369L3.39694 15.7441C3.44273 15.5762 3.53154 15.4231 3.6546 15.3001L15.9097 3.04493C16.241 2.71365 16.6343 2.45086 17.0671 2.27157Z" fill="#5068a8"/>
                                    </svg>
                                  </button>
                                  <div ${defaultConstraints} id="contentDescription">${contentPage}</div>
                                </div>
                            `
                                : ""
                            }
                        </div>
                    </div>
                </div>
                <div 
                  class="cta-button-container"
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-highlightable="false"
                  data-gjs-droppable="[data-gjs-type='cta-buttons']"
                  data-gjs-resizable="false"
                  data-gjs-hoverable="false"
                ></div>
            </div>
        </div>
    `;

  }

  addDefaultConstraintsToContentDesc(htmlContent) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    function addAttributesToElements(element) {
      const parser = new DOMParser();
      const constraintsDoc = parser.parseFromString(
        `<div ${defaultConstraints.trim()}></div>`,
        "text/html"
      );
      const constraintsElement = constraintsDoc.body.firstChild;

      for (let attr of constraintsElement.attributes) {
        element.setAttribute(attr.name, attr.value);
      }

      for (let child of element.children) {
        addAttributesToElements(child);
      }
    }

    for (let child of tempDiv.children) {
      addAttributesToElements(child);
    }

    return tempDiv.innerHTML;
  }

  removeElementOnClick(targetSelector, sectionSelector) {
    const closeSection =
      this.editorManager.selectedComponent?.find(targetSelector)[0];
    if (closeSection) {
      const closeEl = closeSection.getEl();
      const selectedComponent = this.editorManager.selectedComponent;
      if (closeEl) {
        closeEl.onclick = () => {
          if (!this.checkIfTileHasTitleOrIcon(selectedComponent)) {
            const message = this.currentLanguage.getTranslation(
              "tile_must_have_title_or_icon"
            );
            this.editorManager.toolsSection.ui.displayAlertMessage(
              message,
              "error"
            );
            return;
          }
          if (sectionSelector === ".tile-title-section") {
            const component = selectedComponent.find(".tile-title")[0];
            component.components("");
            this.editorManager.toolsSection.setAttributeToSelected(
              "TileText",
              ""
            );
            $("#tile-title").val("");
            component.addStyle({ display: "none" });
            component.addAttributes({ title: "" });
            component.addAttributes({ "is-hidden": "true" });
          } else if (sectionSelector === ".tile-icon-section") {
            const component = selectedComponent.find(".tile-icon")[0];
            component.components("");
            this.editorManager.toolsSection.setAttributeToSelected(
              "tile-icon",
              ""
            );
            component.addStyle({ display: "none" });
            component.addAttributes({ "is-hidden": "true" });
          }
        };
      }
    }
  }

  checkIfTileHasTitleOrIcon(selectedComponent) {
    const isIconHidden =
      selectedComponent.find(".tile-icon")[0]?.getAttributes()?.[
        "is-hidden"
      ] === "false";
    const isTitleHidden =
      selectedComponent.find(".tile-title")[0]?.getAttributes()?.[
        "is-hidden"
      ] === "false";

    // Return true if both elements are hidden
    return isIconHidden && isTitleHidden;
  }
}
