class PageManager {
    constructor(toolBoxManager) {
      this.toolBoxManager = toolBoxManager;
    }
  
    loadPageTemplates() {
      const pageTemplates = document.getElementById("page-templates");
      this.toolBoxManager.templates.forEach((template, index) => {
        const blockElement = document.createElement("div");
  
        blockElement.className = "page-template-wrapper";
        // Create the number element
        const numberElement = document.createElement("div");
        numberElement.className = "page-template-block-number";
        numberElement.textContent = index + 1; // Set the number
        const templateBlock = document.createElement("div");
        templateBlock.className = "page-template-block";
        templateBlock.title = this.toolBoxManager.currentLanguage.getTranslation(
          "click_to_load_template"
        ); //
        templateBlock.innerHTML = `<div>${template.media}</div>`;
  
        blockElement.addEventListener("click", () => {
          const popup = this.toolBoxManager.popupManager.popupModal();
          document.body.appendChild(popup);
          popup.style.display = "flex";
  
          const closeButton = popup.querySelector(".close");
          closeButton.onclick = () => {
            popup.style.display = "none";
            document.body.removeChild(popup);
          };
  
          const cancelBtn = popup.querySelector("#close_popup");
          cancelBtn.onclick = () => {
            popup.style.display = "none";
            document.body.removeChild(popup);
          };
  
          const acceptBtn = popup.querySelector("#accept_popup");
          acceptBtn.onclick = () => {
            popup.style.display = "none";
            document.body.removeChild(popup);
            this.toolBoxManager.editorManager.templateManager.addFreshTemplate(
              template.content
            );
          };
        });
  
        // Append number and template block to the wrapper
        blockElement.appendChild(numberElement);
        blockElement.appendChild(templateBlock);
        pageTemplates.appendChild(blockElement);
      });
    }
  }
