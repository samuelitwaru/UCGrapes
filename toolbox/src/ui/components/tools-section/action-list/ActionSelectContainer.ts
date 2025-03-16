import { ActionListDropDown } from "./ActionListDropDown";

export class ActionSelectContainer {
    container: HTMLElement;

    constructor() {
        this.container = document.createElement('div');
        this.init();
    }

    init() {
        this.container.className = "sidebar-section custom-select-container";
        this.container.id = "select-container"

        const div = document.createElement('div');
        div.className = "tb-dropdown";
        
        const dropDownHeader = document.createElement('div');
        dropDownHeader.className = "tb-dropdown-header";
        dropDownHeader.innerHTML = `
            <span id="sidebar_select_action_label">Select Action</span>
            <i class="fa fa-angle-down"></i>
        `;

        const actionListDropDown = new ActionListDropDown();

        dropDownHeader.addEventListener('click', (e) => {
            e.preventDefault();
            const icon = dropDownHeader.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-angle-up');
                icon.classList.toggle('fa-angle-down');
            }

            const dropdown = actionListDropDown.container;
            dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
        })
        
        div.appendChild(dropDownHeader);
        actionListDropDown.render(div);
        
        this.container.appendChild(div);

    }

    render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}