class CreateNewPage {
    constructor() {

    }

    setupEventListeners() {
        const createPageButton = document.getElementById("page-submit") as HTMLButtonElement
        const pageInput = document.getElementById("page-title") as HTMLInputElement
    
        // createPageButton.removeEventListener("click", this.boundCreatePage);
    
        pageInput.addEventListener("input", () => {
          createPageButton.disabled = !pageInput.value.trim()
        });
    
        // createPageButton.addEventListener("click", this.boundCreatePage);
      }
}