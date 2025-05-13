export class PageSelector {
    pageTypeSelector: HTMLSelectElement 
    selectionSection: HTMLDivElement

    constructor () {
        this.pageTypeSelector = this.createPageTypeSelector()
        this.selectionSection = this.createSelectionSection()
    }

    render(parent:HTMLDivElement) {
        // Create the main container div
        const pageSelector = document.createElement("div");
        pageSelector.classList.add("page-selector");

        // Create the header div
        const header = document.createElement("div");
        header.classList.add("header");

        // Create the h1 element
        const heading = document.createElement("h1");
        heading.textContent = "New Page";
        header.appendChild(heading);
        pageSelector.appendChild(header);

        // Append to the body or another container
        parent.appendChild(pageSelector)
    }

    createPageTypeSelector() {
        const select = document.createElement('select')
        return select
    }

    createSelectionSection (){
        const div = document.createElement('div')
        div.id = "selection-section"
        return div
    }
}