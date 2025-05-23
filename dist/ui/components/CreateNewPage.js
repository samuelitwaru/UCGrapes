"use strict";
class CreateNewPage {
    constructor() {
    }
    setupEventListeners() {
        const createPageButton = document.getElementById("page-submit");
        const pageInput = document.getElementById("page-title");
        // createPageButton.removeEventListener("click", this.boundCreatePage);
        pageInput.addEventListener("input", () => {
            createPageButton.disabled = !pageInput.value.trim();
        });
        // createPageButton.addEventListener("click", this.boundCreatePage);
    }
}
//# sourceMappingURL=CreateNewPage.js.map