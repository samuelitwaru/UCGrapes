class ActionList {
  editorManager = null;
  dataManager = null;
  toolBoxManager = null;
  selectedObject = null;
  selectedId = null;
  pageOptions = []
  
  constructor(editorManager, dataManager, toolBoxManager) {
    this.editorManager = editorManager;
    this.dataManager = dataManager;
    this.toolBoxManager = toolBoxManager;
    this.categoryData = [
        {
          name: "Page",
          options: [],
        },
        {
          name: "Service/Product Page",
          options: this.dataManager.services.map(service => {
            return {PageId:service.ProductServiceId, PageName:service.ProductServiceName}
          })
        },
        {
          name: "Dynamic Form",
          options: [{PageId:"2354481d-5df0-4154-92b8-2fc0aaf9b3e7", PageName:"Form 1"}],
        },
        {
          name: "Call to Action",
          options: [{PageId:"2354481d-5df0-4154-92b8-2fc0aaf9b3e7", PageName:"Call To Action"}],
        },
      ];
    this.init()
  }

  init() {
    this.dataManager
      .getPagesService()
      .then((pages) => {
        this.pageOptions = this.mapPageNamesToOptions(pages);
        this.categoryData.forEach((category) => {
          if (category.name === "Page") {
            category.options = this.pageOptions;
          }
        });

        this.populateDropdownMenu();
        console.log("Updated category data:", this.categoryData);
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
    console.log("Pages", pageOptions);
    return pageOptions;
  };

  populateDropdownMenu(){
    let self = this
    const dropdownMenu = document.getElementById("dropdownMenu");
    dropdownMenu.innerHTML = "";

    this.categoryData.forEach((category) => {
      const categoryElement = document.createElement("details");
      categoryElement.classList.add("category");
      categoryElement.setAttribute("data-category", category.name);

      const summaryElement = document.createElement("summary");
      summaryElement.innerHTML = `${category.name} <i class="fa fa-angle-right"></i>`;
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
        categoryContent.appendChild(optionElement);
      });

      categoryElement.appendChild(categoryContent);

      const noRecordsMessage = document.createElement("li");
      noRecordsMessage.textContent = "No records found";
      noRecordsMessage.classList.add("no-records-message");
      noRecordsMessage.style.display = "none";
      categoryContent.appendChild(noRecordsMessage);

      dropdownMenu.appendChild(categoryElement);
    });

    const dropdownHeader = document.getElementById("selectedOption");
    const categories = document.querySelectorAll(".category");

    // Toggle dropdown menu visibility
    dropdownHeader.addEventListener("click", () => {
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
      dropdownHeader.querySelector("i").classList.toggle("fa-angle-up");
      dropdownHeader.querySelector("i").classList.toggle("fa-angle-down");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
      if (
        !dropdownHeader.contains(event.target) &&
        !dropdownMenu.contains(event.target)
      ) {
        dropdownMenu.style.display = "none";
        dropdownHeader.querySelector("i").classList.remove("fa-angle-up");
        dropdownHeader.querySelector("i").classList.add("fa-angle-down");
      }
    });

    // Toggle display of the search box based on category open state and handle icons
    categories.forEach((category) => {
      category.addEventListener("toggle", function () {
        self.selectedObject = category.dataset.category
        self.toolBoxManager.setAttributeToSelected("tile-action-object", category.dataset.category)
        const searchBox = this.querySelector(".search-container");
        const icon = this.querySelector("summary i");
        const isOpen = this.open;

        // Close other categories if this one is opened
        if (isOpen) {
          categories.forEach((otherCategory) => {
            if (otherCategory !== this) {
              otherCategory.open = false; // Close other categories
              otherCategory.querySelector(".search-container").style.display =
                "none"; // Hide other search boxes
              otherCategory
                .querySelector("summary i")
                .classList.replace("fa-angle-down", "fa-angle-right");
            }
          });
          searchBox.style.display = "block"; // Show the search box for this category
          icon.classList.replace("fa-angle-right", "fa-angle-down"); // Change icon direction
        } else {
          searchBox.style.display = "none"; // Hide search box if closed
          icon.classList.replace("fa-angle-down", "fa-angle-right"); // Change icon direction
        }
      });
    });

    // Handle selecting an option and displaying it in the header
    document.querySelectorAll(".category-content li").forEach((item) => {
      item.addEventListener("click", function () {
        dropdownHeader.textContent = `${
          this.closest(".category").dataset.category
        }, ${this.textContent}`;

        // add value to the tile
        if (self.editorManager.editor.getSelected()) {
          const titleComponent = self.editorManager.editor
            .getSelected()
            .find(".tile-title")[0];

          // add apage to a selected tile
          const currentPageId = localStorage.getItem("pageId");
          if (currentPageId !== undefined) {
            self.toolBoxManager.setAttributeToSelected("tile-action-object-id", this.id)
          }
          
          if (titleComponent) {
            titleComponent.components(this.textContent);

            const sidebarInputTitle = document.getElementById("tile-title");
            if (sidebarInputTitle) {
              sidebarInputTitle.textContent = this.textContent;
            }
          }
        }
        dropdownHeader.innerHTML += ' <i class="fa fa-angle-down"></i>';
        dropdownMenu.style.display = "none"; // Close the dropdown menu
      });
    });

    // Add search functionality to each search input
    document.querySelectorAll(".search-input").forEach((input) => {
      input.addEventListener("input", function () {
        const filter = this.value.toLowerCase();
        const items = this.closest(".category").querySelectorAll(
          ".category-content li:not(.no-records-message)"
        );
        let hasVisibleItems = false; // Track if there are visible items

        items.forEach((item) => {
          if (item.textContent.toLowerCase().includes(filter)) {
            item.style.display = "block";
            hasVisibleItems = true; // At least one item is visible
          } else {
            item.style.display = "none";
          }
        });

        // Show or hide the no records message
        const noRecordsMessage = this.closest(".category").querySelector(
          ".no-records-message"
        );
        noRecordsMessage.style.display = hasVisibleItems ? "none" : "block";
      });
    });
  };
}
