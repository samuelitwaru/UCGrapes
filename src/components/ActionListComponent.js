class ActionListComponent {
  constructor(editorManager, dataManager, currentLanguage, toolBoxManager) {
    this.editorManager = editorManager;
    this.dataManager = dataManager;
    this.currentLanguage = currentLanguage;
    this.toolBoxManager = toolBoxManager;
    this.selectedObject = null;
    this.selectedId = null;
    this.pageOptions = [];
    this.added = false;
    this.formErrors = 0;

    this.categoryData = [
      {
        name: "Page",
        displayName: "Page",
        label: this.currentLanguage.getTranslation("category_page"),
        options: [],
        canAdd: true,
        addAction: () => this.showModal(this.createNewPageModal()),
      },
      {
        name: "Service/Product Page",
        displayName: "Service Page",
        label: this.currentLanguage.getTranslation("category_services_or_page"),
        options: [],
        canAdd: true,
        addAction: () => this.toolBoxManager.newServiceEvent(),
      },
      {
        name: "Dynamic Forms",
        displayName: "Dynamic Forms",
        label: this.currentLanguage.getTranslation("category_dynamic_form"),
        options: [],
      },
      {
        name: "Predefined Page",
        displayName: "Module",
        label: this.currentLanguage.getTranslation("category_predefined_page"),
        options: [],
      },
      {
        name: "Web Link",
        displayName: "Web Link",
        label: this.currentLanguage.getTranslation("category_link"),
        options: [],
        isWebLink: true,
        addAction: () =>
          this.showModal(this.createWebLinkModal("Add Web Link")),
      },
    ];

    this.init();
  }

  async init() {
    try {
      await this.dataManager.getPages();
      await this.populateCategories();
      this.populateDropdownMenu();
    } catch (error) {
      console.error("Error initializing ActionListComponent:", error);
    }
  }

  async populateCategories() {
    try {
      this.pageOptions = this.filterPages(
        (page) =>
          !page.PageIsContentPage &&
          !page.PageIsPredefined &&
          !page.PageIsDynamicForm &&
          !page.PageIsWebLinkPage
      );

      this.predefinedPageOptions = this.filterPages(
        (page) => page.PageIsPredefined && page.PageName != "Home"
      );

      this.servicePageOptions = (this.dataManager.services || []).map(
        (service) => ({
          PageId: service.ProductServiceId,
          PageName: service.ProductServiceName,
          PageTileName:
            service.ProductServiceTileName || service.ProductServiceName,
        })
      );

      this.dynamicForms = (this.dataManager.forms || []).map((form) => ({
        PageId: form.FormId,
        PageName: form.ReferenceName,
        PageTileName: form.ReferenceName,
        FormUrl: form.FormUrl,
      }));

      const categoryMap = {
        Page: this.pageOptions,
        "Service/Product Page": this.servicePageOptions,
        "Dynamic Forms": this.dynamicForms,
        "Predefined Page": this.predefinedPageOptions,
      };

      this.categoryData.forEach((category) => {
        category.options = categoryMap[category.name] || [];
      });
    } catch (error) {
      console.error("Error populating categories:", error);
    }
  }

  filterPages(filterFn) {
    if (!this.dataManager.pages?.SDT_PageCollection) {
      console.warn("Page collection is not available");
      return [];
    }
    return this.dataManager.pages.SDT_PageCollection.filter((page) => {
      if (page) {
        page.PageTileName = page.PageName;
        return filterFn(page);
      }
      return false;
    });
  }

  createWebLinkModal(title) {
    return this.createModal(title, true);
  }

  createNewPageModal() {
    return this.createModal("Create new page", false);
  }

  createModal(title, isWebLink = false) {
    const selectedTile = this.editorManager.getCurrentEditor().getSelected();
    let label = selectedTile.getAttributes()?.["tile-action-object"];
    label = label.replace("Web Link, ", "");

    const url = selectedTile.getAttributes()?.["tile-action-object-url"];

    const fields = isWebLink
      ? [
          {
            id: "link_url",
            label: "Link Url",
            placeholder: "https://www.example.com",
            value: isWebLink ? url || "" : "",
          },
          {
            id: "link_label",
            label: "Link Label",
            placeholder: "Open Website",
            value: isWebLink ? (url !== undefined ? label : "") : "", // Fixed here
          },
        ]
      : [
          {
            id: "page_title",
            label: "Page Title",
            placeholder: "New page title",
            value: "",
          },
        ];

    const popup = document.createElement("div");
    popup.className = "popup-modal-link";
    popup.innerHTML = `
      <div class="popup">
        <div class="popup-header">
          <span>${title}</span>
          <button class="close">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 21 21">
              <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"/>
            </svg>
          </button>
        </div>
        <hr>
        <div class="popup-body" id="confirmation_modal_message">
          ${fields
            .map(
              (field) => `
            <div class="form-field"style="${
              field !== fields[0] ? "margin-top: 10px" : ""
            }">
              <label for="${field.id}">${field.label}</label>
              <input required class="tb-form-control" type="text" id="${
                field.id
              }" placeholder="${field.placeholder}" value="${field.value}"/>
              <span class="error-message" style="color: red; font-size: 12px; display: none; margin-top: 5px; font-weight: 300">Error message</span>
            </div>
          `
            )
            .join("")}
        </div>
        <div class="popup-footer">
          <button id="submit_link" submit class="tb-btn tb-btn-primary">Save</button>
          <button id="close_web_url_popup" class="tb-btn tb-btn-outline">Cancel</button>
        </div>
      </div>
    `;

    return popup;
  }

  showModal(popup) {
    try {
      document.body.appendChild(popup);
      popup.style.display = "flex";

      const closeButton = popup.querySelector("#close_web_url_popup");
      const closeX = popup.querySelector(".close");
      const saveButton = popup.querySelector("#submit_link");

      const removePopup = (e) => {
        e.preventDefault();
        e.stopPropagation();
        popup.remove();
      };

      closeButton?.addEventListener("click", removePopup);
      closeX?.addEventListener("click", removePopup);
      saveButton?.addEventListener("click", () => this.handleModalSave(popup));
    } catch (error) {
      console.error("Error showing modal:", error);
    }
  }

  handleModalSave(popup) {
    try {
      // Run validation first
      if (!this.validateModalForm()) {
        return; // Stop if validation fails
      }

      const isWebLink = popup.querySelector("#link_url") !== null;
      const dropdownHeader = document.getElementById("selectedOption");
      const dropdownMenu = document.getElementById("dropdownMenu");

      if (isWebLink) {
        const linkUrl = document.getElementById("link_url")?.value.trim();
        const linkLabel = document.getElementById("link_label")?.value.trim();

        this.createWebLinkPage(linkUrl, linkLabel);
      } else {
        const pageTitle = document.getElementById("page_title")?.value.trim();
        this.updateSelectedComponent(pageTitle);
      }

      // If dropdown elements exist, update UI
      if (dropdownHeader && dropdownMenu) {
        dropdownHeader.innerHTML += ' <i class="fa fa-angle-down"></i>';
        dropdownMenu.style.display = "none";
      }

      // Close the popup after successful save
      popup.remove();
    } catch (error) {
      console.error("Error handling modal save:", error);
    }
  }

  validateModalForm() {
    this.formErrors = 0; // Reset error count

    document
      .querySelectorAll(".popup-body .tb-form-control")
      .forEach((field) => {
        const errorField = field.nextElementSibling;
        errorField.style.display = "none"; // Hide previous error messages
        errorField.textContent = "";

        // Check for required fields
        if (field.value.trim() === "") {
          errorField.textContent = "This field is required";
          errorField.style.display = "block";
          this.formErrors++;
        }

        // Validate Link URL
        if (field.id === "link_url" && field.value.trim() !== "") {
          const urlPattern = /^https:\/\/.+/; // Must start with https://
          if (!urlPattern.test(field.value.trim())) {
            errorField.textContent = "Enter a valid URL starting with https://";
            errorField.style.display = "block";
            this.formErrors++;
          }
        }

        // Validate Page Title
        if (field.id === "page_title" && field.value.trim() === "") {
          errorField.textContent = "Enter a valid page title";
          errorField.style.display = "block";
          this.formErrors++;
        }

        if (field.id === "page_title" && field.value.length < 3) {
          errorField.textContent = "Page title must be at least 3 characters long";
          errorField.style.display = "block";
          this.formErrors++;
        }
      });

    return this.formErrors === 0;
  }

  async createWebLinkPage(linkUrl, linkLabel) {
    const editor = this.editorManager.getCurrentEditor();
    try {
      const res = await this.dataManager.getPages();
      if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
        return;
      }
      if (editor.getSelected()) {
        const titleComponent = editor.getSelected().find(".tile-title")[0];

        // const tileTitle = truncateText(linkLabel, 12);
        const tileTitle = linkLabel;

        const page = res.SDT_PageCollection.find(
          (page) => page.PageName === "Web Link"
        );
        if (!page) {
          console.warn("Web Link page not found");
          return;
        }

        const editorId = editor.getConfig().container;
        const editorContainerId = `${editorId}-frame`;

        this.toolBoxManager.setAttributeToSelected(
          "tile-action-object-id",
          `${page.PageId}`
        );

        this.toolBoxManager.setAttributeToSelected(
          "tile-action-object-url",
          linkUrl
        );

        this.toolBoxManager.setAttributeToSelected(
          "tile-action-object",
          `Web Link, ${linkLabel}`
        );

        $(editorContainerId).nextAll().remove();
        this.editorManager.createChildEditor(page, linkUrl, linkLabel);

        if (titleComponent) {
          titleComponent.addAttributes({ title: linkLabel });
          titleComponent.components(tileTitle);
          titleComponent.addStyle({ display: "block" });

          const sidebarInputTitle = document.getElementById("tile-title");
          if (sidebarInputTitle) {
            sidebarInputTitle.value = tileTitle;
            sidebarInputTitle.title = tileTitle;
          }
        }
      }
    } catch (error) {
      console.error("Error creating web link page:", error);
    }
  }

  async updateSelectedComponent(title, url = null) {
    try {
      const editor = this.editorManager.getCurrentEditor();
      const selected = editor.getSelected();
      if (!selected) return;

      const titleComponent = selected.find(".tile-title")[0];
      // const tileTitle = this.truncateText(title, 12);
      const tileTitle = title;
      const editorId = editor.getConfig().container;
      const editorContainerId = `${editorId}-frame`;
      await this.dataManager
        .createNewPage(title, this.toolBoxManager.currentTheme)
        .then((res) => {
          if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
            return;
          }

          const result = JSON.parse(res.result);
          const pageId = result.Trn_PageId;
          const pageName = result.Trn_PageName;

          this.dataManager.getPages().then((res) => {
            this.toolBoxManager.actionList.init();

            this.toolBoxManager.setAttributeToSelected(
              "tile-action-object-id",
              pageId
            );

            this.toolBoxManager.setAttributeToSelected(
              "tile-action-object",
              `Page, ${pageName}`
            );

            $(editorContainerId).nextAll().remove();
            this.editorManager.createChildEditor(
              this.editorManager.getPage(pageId)
            );

            // this.toolBoxManager.ui.displayMessage(
            //   `${this.currentLanguage.getTranslation("page_created")}`,
            //   "success"
            // );
          });
        });

      if (titleComponent) {
        titleComponent.addAttributes({ title: title });
        titleComponent.components(tileTitle);
        titleComponent.addStyle({ display: "block" });

        const sidebarInputTitle = document.getElementById("tile-title");
        if (sidebarInputTitle) {
          sidebarInputTitle.value = tileTitle;
          sidebarInputTitle.title = tileTitle;
        }
      }
      // dropdownHeader.innerHTML += ' <i class="fa fa-angle-down"></i>';
      // dropdownMenu.style.display = "none";
    } catch (error) {
      console.error("Error updating selected component:", error);
    }
  }

  truncateText(text, maxLength) {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength - 3) + "..."
      : text;
  }

  populateDropdownMenu() {
    try {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (!dropdownMenu) return;

      dropdownMenu.innerHTML = "";
      this.categoryData.forEach((category) => {
        const categoryElement = this.createCategoryElement(category);
        dropdownMenu.appendChild(categoryElement);
      });

      this.setupEventListeners();
    } catch (error) {
      console.error("Error populating dropdown menu:", error);
    }
  }

  createCategoryElement(category) {
    const categoryElement = document.createElement("details");
    categoryElement.classList.add("category");
    categoryElement.setAttribute("data-category", category.label);

    const summaryElement = document.createElement("summary");
    summaryElement.innerHTML = `${category.displayName}${
      category.isWebLink ? "" : ' <i class="fa fa-angle-right"></i>'
    }`;
    categoryElement.appendChild(summaryElement);

    if (!category.isWebLink) {
      this.appendSearchBox(categoryElement, category);
      this.appendCategoryContent(categoryElement, category);
    } else {
      categoryElement.addEventListener("click", (e) => {
        e.preventDefault();
        category.addAction();
      });
    }

    return categoryElement;
  }

  appendSearchBox(categoryElement, category) {
    const searchBox = document.createElement("div");
    searchBox.classList.add("search-container");
    searchBox.innerHTML = `
      <i class="fas fa-search search-icon"></i>
      <input type="text" placeholder="Search" class="search-input" />
    `;

    if (category.canAdd) {
      const addButton = document.createElement("button");
      addButton.innerHTML = '<i class="fa fa-plus"></i>';
      addButton.title = `Add New ${category.name}`;
      addButton.classList.add("add-new-service");
      addButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        category.addAction();
      });
      searchBox.appendChild(addButton);
    }

    categoryElement.appendChild(searchBox);
  }

  appendCategoryContent(categoryElement, category) {
    const categoryContent = document.createElement("ul");
    categoryContent.classList.add("category-content");

    category.options.forEach((option) => {
      if (!option) return;

      const optionElement = document.createElement("li");
      optionElement.textContent = option.PageName;
      optionElement.id = option.PageId;

      if (category.name === "Dynamic Forms") {
        optionElement.dataset.objectUrl = option.FormUrl;
      }

      optionElement.dataset.category = category.name;
      optionElement.dataset.tileName = option.PageTileName;
      categoryContent.appendChild(optionElement);
    });

    const noRecordsMessage = document.createElement("li");
    noRecordsMessage.textContent = "No records found";
    noRecordsMessage.classList.add("no-records-message");
    noRecordsMessage.style.display = "none";
    categoryContent.appendChild(noRecordsMessage);

    categoryElement.appendChild(categoryContent);
  }

  setupEventListeners() {
    this.setupDropdownHeader();
    this.setupOutsideClickListener();
    this.setupCategoryToggle();
    this.setupItemClickListener();
    this.setupSearchInputListener();
  }

  setupDropdownHeader() {
    const dropdownHeader = document.getElementById("selectedOption");
    const dropdownMenu = document.getElementById("dropdownMenu");

    if (!dropdownHeader || !dropdownMenu) return;

    if (!this.added) {
      dropdownHeader.addEventListener("click", () => {
        this.init();
        dropdownMenu.style.display =
          dropdownMenu.style.display === "block" ? "none" : "block";
        const icon = dropdownHeader.querySelector("i");
        if (icon) {
          icon.classList.toggle("fa-angle-up");
          icon.classList.toggle("fa-angle-down");
        }
      });
    }

    this.added = true;
  }

  setupOutsideClickListener() {
    const dropdownHeader = document.getElementById("selectedOption");
    const dropdownMenu = document.getElementById("dropdownMenu");

    if (!dropdownHeader || !dropdownMenu) return;

    document.addEventListener("click", (event) => {
      if (
        !dropdownHeader.contains(event.target) &&
        !dropdownMenu.contains(event.target)
      ) {
        dropdownMenu.style.display = "none";
        const icon = dropdownHeader.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-angle-up");
          icon.classList.add("fa-angle-down");
        }
        document.querySelectorAll(".category").forEach((details) => {
          details.open = false;
        });
      }
    });
  }

  setupCategoryToggle() {
    document.querySelectorAll(".category").forEach((category) => {
      if (
        category.dataset.category !==
        this.currentLanguage.getTranslation("category_link")
      ) {
        category.addEventListener("toggle", () => {
          this.selectedObject = category.dataset.category;
          const searchBox = category.querySelector(".search-container");
          const icon = category.querySelector("summary i");
          const isOpen = category.open;

          document.querySelectorAll(".category").forEach((otherCategory) => {
            if (otherCategory !== category) {
              otherCategory.open = false;
              const otherSearchBox =
                otherCategory.querySelector(".search-container");
              if (otherSearchBox) {
                otherSearchBox.style.display = "none";
              }
              const otherIcon = otherCategory.querySelector("summary i");
              if (otherIcon) {
                otherIcon.classList.replace("fa-angle-down", "fa-angle-right");
              }
            }
          });

          if (searchBox && icon) {
            searchBox.style.display = isOpen ? "flex" : "none";
            icon.classList.replace(
              isOpen ? "fa-angle-right" : "fa-angle-down",
              isOpen ? "fa-angle-down" : "fa-angle-right"
            );
          }
        });
      }
    });
  }

  setupItemClickListener() {
    try {
      const dropdownHeader = document.getElementById("selectedOption");
      const dropdownMenu = document.getElementById("dropdownMenu");

      if (!dropdownHeader || !dropdownMenu) return;

      document.querySelectorAll(".category-content li").forEach((item) => {
        if (item.classList.contains("no-records-message")) return;

        item.addEventListener("click", async () => {
          try {
            const category = item.dataset.category;
            const categoryElement = item.closest(".category");

            if (!category || !categoryElement) return;

            this.selectedObject = category;
            dropdownHeader.textContent = `${categoryElement.dataset.category}, ${item.textContent}`;

            const editor = this.editorManager.getCurrentEditor();
            if (!editor) return;

            const editorId = editor.getConfig().container;
            const editorContainerId = `${editorId}-frame`;
            const selected = editor.getSelected();

            if (selected && editorContainerId) {
              await this.handleItemSelection(item, category, editorContainerId);
            }

            dropdownHeader.innerHTML += ' <i class="fa fa-angle-down"></i>';
            dropdownMenu.style.display = "none";
          } catch (error) {
            console.error("Error in item click handler:", error);
          }
        });
      });
    } catch (error) {
      console.error("Error setting up item click listener:", error);
    }
  }

  async handleItemSelection(item, category, editorContainerId) {
    try {
      const selected = this.editorManager.getCurrentEditor().getSelected();
      const titleComponent = selected.find(".tile-title")[0];
      // const tileTitle = this.truncateText(item.dataset.tileName, 12);
      const tileTitle = item.dataset.tileName;

      if (selected) {
        this.toolBoxManager.setAttributeToSelected(
          "tile-action-object-id",
          item.id
        );

        if (item.dataset.objectUrl) {
          this.toolBoxManager.setAttributeToSelected(
            "tile-action-object-url",
            item.dataset.objectUrl
          );
        }

        this.toolBoxManager.setAttributeToSelected(
          "tile-action-object",
          `${category}, ${item.textContent}`
        );

        await this.handlePageCreation(
          category,
          item.id,
          editorContainerId,
          item.textContent
        );
      }

      if (titleComponent) {
        titleComponent.addAttributes({ title: item.dataset.tileName });
        titleComponent.components(tileTitle);
        titleComponent.addStyle({ display: "block" });

        const sidebarInputTitle = document.getElementById("tile-title");
        if (sidebarInputTitle) {
          sidebarInputTitle.value = tileTitle;
          sidebarInputTitle.title = tileTitle;
        }
      }
    } catch (error) {
      console.error("Error handling item selection:", error);
    }
  }

  async handlePageCreation(category, itemId, editorContainerId, itemText) {
    try {
      $(editorContainerId).nextAll().remove();
      switch (category) {
        case "Service/Product Page":
          await this.createContentPage(itemId, editorContainerId);
          break;
        case "Dynamic Forms":
          await this.createDynamicFormPage(itemId, itemText, editorContainerId);
          break;
        default:
          this.editorManager.createChildEditor(
            this.editorManager.getPage(itemId)
          );
      }
    } catch (error) {
      console.error("Error handling page creation:", error);
    }
  }

  async createContentPage(pageId, editorContainerId) {
    try {
      const res = await this.dataManager.createContentPage(pageId);
      if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
        return;
      }

      await this.dataManager.getPages();
      $(editorContainerId).nextAll().remove();
      this.editorManager.createChildEditor(this.editorManager.getPage(pageId));
    } catch (error) {
      console.error("Error creating content page:", error);
    }
  }

  async createDynamicFormPage(formId, formName, editorContainerId) {
    try {
      const res = await this.dataManager.createDynamicFormPage(
        formId,
        formName
      );
      if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
        return;
      }

      await this.dataManager.getPages();
      $(editorContainerId).nextAll().remove();
      this.editorManager.createChildEditor(this.editorManager.getPage(formId));
    } catch (error) {
      console.error("Error creating dynamic form page:", error);
    }
  }

  setupSearchInputListener() {
    document.querySelectorAll(".search-input").forEach((input) => {
      input.addEventListener("input", function () {
        const filter = this.value.toLowerCase();
        const category = this.closest(".category");
        if (!category) return;

        const items = category.querySelectorAll(
          ".category-content li:not(.no-records-message)"
        );
        const noRecordsMessage = category.querySelector(".no-records-message");

        let hasVisibleItems = false;

        items.forEach((item) => {
          const isVisible = item.textContent.toLowerCase().includes(filter);
          item.style.display = isVisible ? "block" : "none";
          if (isVisible) hasVisibleItems = true;
        });

        if (noRecordsMessage) {
          noRecordsMessage.style.display = hasVisibleItems ? "none" : "block";
        }
      });
    });
  }
}
