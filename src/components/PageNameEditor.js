class PageNameEditor {
    constructor(editorManager, page) {
        this.editorManager = editorManager;
        this.dataManager = editorManager.dataManager;
        this.page = page;
        this.pageName = page.PageName;
        this.pageId = page.PageId;
        const pageNameContainer = document.getElementById("page-name-editor");
        if (pageNameContainer) {
            pageNameContainer.appendChild(this.render());
        }
    }

    render(){
        const pageName = this.pageName;
        const header = document.createElement("h1");
        header.classList.add("title");
        header.setAttribute("title", pageName);
        //header.setAttribute("contenteditable", "true");
        header.style.textTransform = "uppercase";
        header.innerHTML = pageName.length > 20 ? pageName.substring(0, 16) + "..." : pageName;
        header.addEventListener("dblclick", (e) => {
            this.toggleEditMode();
        });
        return header;
    }

    toggleEditMode() {
        const header = document.querySelector("#page-name-editor h1");
        const input = document.querySelector("#page-name-editor input");
        console.log("header", header);
        console.log("input", input);
        if (header) {
            const input = this.createInput(this.pageName);
            header.replaceWith(input);
            input.focus();
        }
        if (input) {
            const header = this.render();
            input.replaceWith(header);
        }
    }

    createInput(pageName) {
        const input = document.createElement("input");
        input.style.textTransform = "uppercase";
        input.classList.add("page-name-editor", "tb-form-control");
        input.type = "text";
        input.value = pageName;
        input.classList.add("page-name-editor", "tb-form-control");

        // add on leave event
        input.addEventListener("blur", (e) => {
            const value = e.target.value;
            if(value.length > 0){
                this.updatePageName(value);
            }
        });
        input.setAttribute("placeholder", "Page Name");
        return input;
    }

    updatePageName(name) {
        const input = document.querySelector(`#update-page-popup #pageName`);
        const errorLabel = document.querySelector(
          `#update-page-popup #error_pageName`
        );

        if (name) {
          const reservedNames = [
            "Home",
            "Reception",
            "Location",
            "Calendar",
            "My Activity",
            "Web Link",
            "Dynamic Forms"
          ];
          if (reservedNames.includes(name)) {
            errorLabel.innerHTML = "This name is reserved";
            errorLabel.style.display = "block";
            return;
          }
          const page = this.page;
          page.PageName = name;
          this.dataManager.updatePage(page).then((res) => {
            if (res.result) {
                this.pageName = name;
                this.editorManager.toolsSection.ui.displayAlertMessage(res.result, "success");
                this.toggleEditMode();
            }
          });
        } else {
          errorLabel.innerHTML = "This field is required";
          errorLabel.style.display = "block";
        }
    }
}