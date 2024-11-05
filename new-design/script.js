// Update editor height based on available space
function updateEditorHeight() {
    const mobileFrame = document.querySelector(".mobile-frame");
    const header = mobileFrame.querySelector(".header");
    const gjs = document.getElementById("gjs");

    const remainingHeight = mobileFrame.clientHeight - header.clientHeight;
    gjs.style.height = `${remainingHeight}px`;
    editor.refresh();
  }

  // Call the function initially and on window resize
  updateEditorHeight();
  window.addEventListener("resize", updateEditorHeight);

  // Handle tab switching
  document.addEventListener("DOMContentLoaded", function () {
    const tabContainer = document.querySelector(".tab-container");
    const tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");

    function setActiveTab(targetId) {
      tabs.forEach((tab) => {
        const selected = tab.dataset.target === targetId;
        tab.classList.toggle("active", selected);
        tab.setAttribute("aria-selected", selected);
      });

      tabContents.forEach((content) => {
        const isActive = content.id === targetId;
        content.classList.toggle("active", isActive);
        content.hidden = !isActive;
      });

      // Save active tab to localStorage
      localStorage.setItem("activeTab", targetId);
    }

    tabContainer.addEventListener("click", (event) => {
      const tab = event.target.closest(".tab");
      if (tab) {
        setActiveTab(tab.dataset.target);
      }
    });

    // Restore active tab from localStorage
    const activeTab = localStorage.getItem("activeTab") || "tools";
    setActiveTab(activeTab);

    const themesButton = document.getElementById("themes-button");
    const themesDropdown = document.getElementById("themes-dropdown");

    themesButton.addEventListener("click", function (event) {
      event.stopPropagation();
      themesDropdown.style.display =
        themesDropdown.style.display === "block" ? "none" : "block";
    });

    // Close the dropdown when clicking outside of it
    window.addEventListener("click", function (event) {
      if (
        !themesButton.contains(event.target) &&
        !themesDropdown.contains(event.target)
      ) {
        themesDropdown.style.display = "none";
      }
    });
  });

  // Show properties in Properties tab
  editor.on("component:selected", (model) => {
    setActiveTab("properties");
  });

  function setActiveTab(targetId) {
    const tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach((tab) => {
      const selected = tab.dataset.target === targetId;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-selected", selected);
    });

    tabContents.forEach((content) => {
      const isActive = content.id === targetId;
      content.classList.toggle("active", isActive);
      content.hidden = !isActive;
    });

    // Save active tab to localStorage
    localStorage.setItem("activeTab", targetId);
  }