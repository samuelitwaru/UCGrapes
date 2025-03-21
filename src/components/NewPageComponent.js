class NewPageComponent  {
    constructor(editorManager) {
        this.editorManager = editorManager;
        this.dataManager = editorManager.dataManager;
    }
    createNewPageMenu() {
        // Create the menu container
        const menu = document.createElement('div');
        menu.classList.add('tb-menu');

        // Create first child div
        const addMenuPage = document.createElement('div');
        addMenuPage.textContent = 'Add menu page';
        addMenuPage.addEventListener('click', () => {
            this.createNewPage('Untitled', false);
        });

        // Create second child div
        const addNewPage = document.createElement('div');
        addNewPage.textContent = 'Add content page';
        addNewPage.addEventListener('click', () => {
            this.editorManager.toolsSection.newServiceEvent()
            // this.createNewPage('Untitled', true);
        });

        // Append child divs to menu
        menu.appendChild(addMenuPage);
        menu.appendChild(addNewPage);
        const container = document.getElementById(`new-page-menu`);
        container.appendChild(menu);
    }

    async createNewPage(title, isServicePage = false) {
        const editor = this.editorManager.getCurrentEditor();
        const selected = editor.getSelected();
        if (!selected) return;

        const titleComponent = selected.find(".tile-title")[0];
        // const tileTitle = this.truncateText(title, 12);
        const tileTitle = title;
        const editorId = editor.getConfig().container;
        const editorContainerId = `${editorId}-frame`;
        let res;
        if (isServicePage) {
            res = await this.dataManager.createContentPage('039fbad2-7a24-4111-8394-638e8e44a680')
        }else {
            res = await this.dataManager.createNewPage(title, this.editorManager.toolsSection.currentTheme)
        }
        
        if (this.editorManager.toolsSection.checkIfNotAuthenticated(res)) {
            return;
        }

        const result = JSON.parse(res.result);
        const pageId = result.Trn_PageId;
        const pageName = result.Trn_PageName;

        this.dataManager.getPages().then((res) => {
        this.editorManager.toolsSection.actionList.init();

        this.editorManager.toolsSection.setAttributeToSelected(
            "tile-action-object-id",
            pageId
        );

        this.editorManager.toolsSection.setAttributeToSelected(
            "tile-action-object",
            `Page, ${pageName}`
        );

        $(editorContainerId).nextAll().remove();
        this.editorManager.createChildEditor(
            this.editorManager.getPage(pageId)
        );
        });

        if (titleComponent) {
            titleComponent.addAttributes({ title: title });
            titleComponent.components(tileTitle);
            titleComponent.addStyle({ display: "block" });

            const sidebarInputTitle = document.getElementById("tile-title");
            if (sidebarInputTitle) {
                sidebarInputTitle.value = tileTitle;
                sidebarInputTitle.title = tileTitle;
            }
        }
        
    }
}