import { ActionListDropDown } from "./ActionListDropDown";

export class ActionSelectContainer {
    container: HTMLElement;
    private actionListDropDown: any;
    private dropDownHeader: any;

    constructor() {
        this.container = document.createElement('div');
        this.init();
        
        // Add document click listener to close dropdown when clicking outside
        document.addEventListener('click', this.handleOutsideClick.bind(this));
    }

    init() {
        this.container.className = "sidebar-section custom-select-container";
        this.container.id = "select-container"

        const div = document.createElement('div');
        div.className = "tb-dropdown";
        
        this.dropDownHeader = document.createElement('div');
        this.dropDownHeader.className = "tb-dropdown-header";
        this.dropDownHeader.innerHTML = `
            <span id="sidebar_select_action_label">Select Action</span>
            <i class="fa fa-angle-down"></i>
        `;

        this.actionListDropDown = new ActionListDropDown();

        this.dropDownHeader.addEventListener('click', (e: any) => {
            e.stopPropagation(); // Stop event from bubbling up
            e.preventDefault();
            this.toggleDropdown();
        });
        
        div.appendChild(this.dropDownHeader);
        this.actionListDropDown.render(div);
        
        this.container.appendChild(div);
    }

    toggleDropdown() {
        const icon = this.dropDownHeader.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-angle-up');
            icon.classList.toggle('fa-angle-down');
        }

        const dropdown = this.actionListDropDown.container;
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    }

    closeDropdown() {
        const icon = this.dropDownHeader.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-angle-up');
            icon.classList.add('fa-angle-down');
        }

        const dropdown = this.actionListDropDown.container;
        dropdown.style.display = "none";
    }

    private handleOutsideClick(event: MouseEvent) {
        // Check if the dropdown is open and the click is outside the container
        if (this.actionListDropDown.container.style.display === "block" && 
            !this.container.contains(event.target as Node)) {
            this.closeDropdown();
        }
    }

    // Remember to clean up when component is destroyed
    destroy() {
        document.removeEventListener('click', this.handleOutsideClick.bind(this));
    }

    render(container: HTMLElement) {
        const existingElement = container.querySelector("#select-container");
        if (existingElement) {
            container.replaceChild(this.container, existingElement);
            return;
        }
        container.insertBefore(this.container, container.children[3]);
    }
}