
export class PageNameEditor {
    page: any;
    constructor(page:any) {
        this.page = page
        this.render()
    }

    render(){
        return this.createInput()
    }

    toggleEditMode() {
        const header = document.querySelector("#page-name-editor h1");
        
    }

    createInput() {
        const pageName = this.page.PageName
        const input = document.createElement("input");
        input.style.textTransform = "uppercase";
        input.classList.add("page-name-editor", "tb-form-control");
        input.type = "text";
        input.value = pageName;
        input.classList.add("page-name-editor", "tb-form-control");

        // add on leave event
        input.addEventListener("blur", (e) => {
            const value = input.value;
            if(value.length > 0){
                // this.updatePageName(value);
            }
        });
        input.setAttribute("placeholder", "Page Name");
        return input;
    }

    // updatePageName(name) {
    //     const input = document.querySelector(`#update-page-popup #pageName`);
    //     const errorLabel = document.querySelector(
    //       `#update-page-popup #error_pageName`
    //     );

    //     if (name) {
    //       const reservedNames = [
    //         "Home",
    //         "Reception",
    //         "Location",
    //         "Calendar",
    //         "My Activity",
    //         "Web Link",
    //         "Dynamic Forms"
    //       ];
    //       if (reservedNames.includes(name)) {
    //         errorLabel.innerHTML = "This name is reserved";
    //         errorLabel.style.display = "block";
    //         return;
    //       }
    //       const page = this.page;
    //       page.PageName = name;
    //       this.dataManager.updatePage(page).then((res) => {
    //         if (res.result) {
    //             this.pageName = name;
    //             this.editorManager.toolsSection.ui.displayAlertMessage(res.result, "success");
    //             this.toggleEditMode();
    //         }
    //       });
    //     } else {
    //       errorLabel.innerHTML = "This field is required";
    //       errorLabel.style.display = "block";
    //     }
    // }
}