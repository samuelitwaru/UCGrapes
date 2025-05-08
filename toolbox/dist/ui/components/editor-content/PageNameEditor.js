export class PageNameEditor {
    constructor(page) {
        this.page = page;
        this.render();
    }
    render() {
        return this.createInput();
    }
    toggleEditMode() {
        const header = document.querySelector("#page-name-editor h1");
    }
    createInput() {
        const pageName = this.page.PageName;
        const input = document.createElement("input");
        input.style.textTransform = "uppercase";
        input.classList.add("page-name-editor", "tb-form-control");
        input.type = "text";
        input.value = pageName;
        input.classList.add("page-name-editor", "tb-form-control");
        // add on leave event
        input.addEventListener("blur", (e) => {
            const value = input.value;
            if (value.length > 0) {
                // this.updatePageName(value);
            }
        });
        input.setAttribute("placeholder", "Page Name");
        return input;
    }
}
//# sourceMappingURL=PageNameEditor.js.map