class ActionListComponent {
  editorManager = null;
  dataManager = null;
  toolBoxManager = null;
  selectedObject = null;
  selectedId = null;
  pageOptions = [];

  constructor(editorManager, dataManager, currentLanguage, toolBoxManager) {
    this.editorManager = editorManager;
    this.dataManager = dataManager;
    this.currentLanguage = currentLanguage;
    this.toolBoxManager = toolBoxManager;

    this.categoryData = [
      {
        name: "Page",
        label: this.currentLanguage.getTranslation("category_page"),
        options: [],
      },
      {
        name: "Service/Product Page",
        label: this.currentLanguage.getTranslation("category_services_or_page"),
        options: [],
      },
      {
        name: "Predefined Page",
        label: this.currentLanguage.getTranslation("category_predefined_page"),
        options: [],
      },
    ];
    this.init();
  }

  init() {
    this.dataManager
      .getPages()
      .then((res) => {
        if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
          return;
        }
        this.pageOptions = res.SDT_PageCollection.filter(
          (page) => !page.PageIsContentPage && !page.PageIsPredefined
        );
        this.predefinedPageOptions = res.SDT_PageCollection.filter(
          (page) => page.PageIsPredefined && page.PageName != "Home"
        );

        this.dataManager.getServices().then((res) => {
          this.servicePageOptions = this.dataManager.services.map((service) => {
            return {
              PageId: service.ProductServiceId,
              PageName: service.ProductServiceName,
            };
          });
        });

        this.categoryData.forEach((category) => {
          if (category.name === "Page") {
            category.options = this.pageOptions;
          } else if (category.name == "Service/Product Page") {
            category.options = this.servicePageOptions;
          } else if (category.name == "Predefined Page") {
            category.options = this.predefinedPageOptions;
          }
        });

        this.populateDropdownMenu();
      })
      .catch((error) => {
        console.error("Error fetching pages:", error);
      });
  }

  mapPageNamesToOptions(pages) {
    const pageOptions = pages.map((page) => ({
      PageName: page.Name,
      PageId: page.Id,
    }));
    return pageOptions;
  }

  populateDropdownMenu() {
    const dropdownMenu = document.getElementById("dropdownMenu");
    dropdownMenu.innerHTML = "";
    this.categoryData.forEach((category) => {
      const categoryElement = this.createCategoryElement(category);
      dropdownMenu.appendChild(categoryElement);
    });

    this.setupDropdownHeader();
    this.setupOutsideClickListener();
    this.setupCategoryToggle();
    this.setupItemClickListener();
    this.setupSearchInputListener();
  }

  createCategoryElement(category) {
    const categoryElement = document.createElement("details");
    categoryElement.classList.add("category");
    categoryElement.setAttribute("data-category", category.label);

    const summaryElement = document.createElement("summary");
    summaryElement.innerHTML = `${category.label} <i class="fa fa-angle-right"></i>`;
    categoryElement.appendChild(summaryElement);

    const searchBox = document.createElement("div");
    searchBox.classList.add("search-container");
    searchBox.innerHTML = `<i class="fas fa-search search-icon"></i><input type="text" placeholder="Search" class="search-input" />`;
    categoryElement.appendChild(searchBox);

    const categoryContent = document.createElement("ul");
    categoryContent.classList.add("category-content");

    category.options.forEach((option) => {
      const optionElement = document.createElement("li");
      optionElement.textContent = option.PageName;
      optionElement.id = option.PageId;
      optionElement.dataset.category = category.name
      categoryContent.appendChild(optionElement);
    });

    const noRecordsMessage = document.createElement("li");
    noRecordsMessage.textContent = "No records found";
    noRecordsMessage.classList.add("no-records-message");
    noRecordsMessage.style.display = "none";
    categoryContent.appendChild(noRecordsMessage);

    categoryElement.appendChild(categoryContent);
    return categoryElement;
  }

  setupDropdownHeader() {
    const dropdownHeader = document.getElementById("selectedOption");
    const dropdownMenu = document.getElementById("dropdownMenu");
    
    if (!this.added) {
      dropdownHeader.removeEventListener("click", (e) => {});
      dropdownHeader.addEventListener("click", (e) => {
        this.init();
        dropdownMenu.style.display =
          dropdownMenu.style.display === "block" ? "none" : "block";
        dropdownHeader.querySelector("i").classList.toggle("fa-angle-up");
        dropdownHeader.querySelector("i").classList.toggle("fa-angle-down");        
      });
    }

    this.added = true;
  }

  setupOutsideClickListener() {
    const dropdownHeader = document.getElementById("selectedOption");
    const dropdownMenu = document.getElementById("dropdownMenu");

    document.addEventListener("click", (event) => {
      if (
        !dropdownHeader.contains(event.target) &&
        !dropdownMenu.contains(event.target)
      ) {
        dropdownMenu.style.display = "none";
        dropdownHeader.querySelector("i")?.classList.remove("fa-angle-up");
        dropdownHeader.querySelector("i")?.classList.add("fa-angle-down");
      }
    });
  }

  setupCategoryToggle() {
    const categories = document.querySelectorAll(".category");

    categories.forEach((category) => {
      category.addEventListener("toggle", () => {
        this.selectedObject = category.dataset.category;
        const searchBox = category.querySelector(".search-container");
        const icon = category.querySelector("summary i");
        const isOpen = category.open;

        if (isOpen) {
          categories.forEach((otherCategory) => {
        if (otherCategory !== category) {
          otherCategory.open = false;
          otherCategory.querySelector(".search-container").style.display =
            "none";
          otherCategory
            .querySelector("summary i")
            .classList.replace("fa-angle-down", "fa-angle-right");
        }
          });
          searchBox.style.display = "block";
          icon.classList.replace("fa-angle-right", "fa-angle-down");
        } else {
          searchBox.style.display = "none";
          icon.classList.replace("fa-angle-down", "fa-angle-right");
        }
      });
    });
  }

  setupItemClickListener() {
    const dropdownHeader = document.getElementById("selectedOption");
    const dropdownMenu = document.getElementById("dropdownMenu");

    document.querySelectorAll(".category-content li").forEach((item) => {
      item.addEventListener("click", () => {
        this.selectedObject = item.dataset.category
        dropdownHeader.textContent = `${
          item.closest(".category").dataset.category
        }, ${item.textContent}`;
        const category = item.dataset.category
        const editor = this.editorManager.getCurrentEditor();
        const editorId = editor.getConfig().container;
        const editorContainerId = `${editorId}-frame`;
        if (editor.getSelected()) {
          const titleComponent = editor.getSelected().find(".tile-title")[0];
          const currentPageId = localStorage.getItem("pageId");
          const tileTitle = truncateText(item.textContent.toUpperCase(), 12);
          if (currentPageId !== undefined) {
            this.toolBoxManager.setAttributeToSelected(
              "tile-action-object-id",
              item.id
            );
            this.toolBoxManager.setAttributeToSelected(
              "tile-action-object",
              `${category}, ${item.textContent}`
            );

            if (category == "Service/Product Page") {
              this.createContentPage(item.id, editorContainerId);
            }else{
              $(editorContainerId).nextAll().remove();
              this.editorManager.createChildEditor((this.editorManager.getPage(item.id)))
            }
          }

          if (titleComponent) {
            titleComponent.components(tileTitle);

            const sidebarInputTitle = document.getElementById("tile-title");
            if (sidebarInputTitle) {
              sidebarInputTitle.textContent = tileTitle;
            }
          }
        }
        dropdownHeader.innerHTML += ' <i class="fa fa-angle-down"></i>';
        dropdownMenu.style.display = "none";
      });
    });
  }

  setupSearchInputListener() {
    document.querySelectorAll(".search-input").forEach((input) => {
      input.addEventListener("input", function () {
        const filter = this.value.toLowerCase();
        const items = this.closest(".category").querySelectorAll(
          ".category-content li:not(.no-records-message)"
        );
        let hasVisibleItems = false;

        items.forEach((item) => {
          if (item.textContent.toLowerCase().includes(filter)) {
            item.style.display = "block";
            hasVisibleItems = true;
          } else {
            item.style.display = "none";
          }
        });

        const noRecordsMessage = this.closest(".category").querySelector(
          ".no-records-message"
        );
        noRecordsMessage.style.display = hasVisibleItems ? "none" : "block";
      });
    });
  }

  createContentPage(pageId, editorContainerId) {
    this.dataManager.createContentPage(pageId)
    .then((res) => {
      if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
        return;
      }
      this.dataManager.getPages().then(res=>{
        $(editorContainerId).nextAll().remove();
        this.editorManager.createChildEditor(this.editorManager.getPage(pageId))
      })
    });
  }
}
