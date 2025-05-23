import { i18n } from "../../i18n/i18n";
import { ToolBoxService } from "../../services/ToolBoxService";
import { Modal } from "../components/Modal";
import { formatDistanceToNow } from 'date-fns';
import { VersionSelectionView } from "./VersionSelectionView";
import { AppVersionManager } from "../../controls/versions/AppVersionManager";
import { TrashItem, TrashItems } from "../../types";

export class TrashView {
    constructor() {}

    async openTrashModal() {
        try {
            const div = await this.createModalContent();
            
            const modal = new Modal({
                title: i18n.t("navbar.trash.modal_title"),
                width: "800px",
                body: div,
            });

            modal.open();

        } catch (error) {
            console.error('Error opening trash modal:', error);
        }
    }

    private async createModalContent(): Promise<HTMLDivElement> {
        const container = document.createElement('div');
        container.className = 'trash-container';

        const content = document.createElement('div');
        content.className = 'trash-content';
        container.appendChild(content);

        const header = this.createHeader();
        content.appendChild(header);

        const tabs = this.createTabs();
        content.appendChild(tabs);

        const contentArea = document.createElement('div');
        contentArea.className = 'content';
        content.appendChild(contentArea);

        const pageTab = await this.createPageTabContent();
        pageTab.classList.add('active');
        contentArea.appendChild(pageTab);

        const versionTab = await this.createVersionTabContent();
        contentArea.appendChild(versionTab);

        this.setupEventListeners(container);

        return container;
    }

    private createHeader(): HTMLDivElement {
        const header = document.createElement('div');
        header.className = 'trash-header';

        const searchBar = document.createElement('div');
        searchBar.className = 'trash-search-bar';
        
        const searchIcon = document.createElement('i');
        searchIcon.className = 'material-icons';
        searchIcon.innerHTML = `
        <svg width="20px" height="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                viewBox="0 0 32 32" enable-background="new 0 0 32 32" xml:space="preserve">
            <circle fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" cx="19.5" cy="12.5" r="8.5"/>
            <line fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" x1="4" y1="28" x2="14" y2="18"/>
        </svg>
        `;
        searchBar.appendChild(searchIcon);

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search in trash';
        searchBar.appendChild(searchInput);

        header.appendChild(searchBar);

        const actionButtons = document.createElement('div');
        actionButtons.className = 'trash-action-buttons';
        actionButtons.id = 'trash-action-buttons';

        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'btn btn-outline';
        restoreBtn.id = 'restore-btn';
        
        const restoreIcon = document.createElement('i');
        restoreIcon.className = 'material-icons';
        restoreIcon.innerHTML = '<svg width="20px" height="20px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M 15 4 C 14.478 4 13.9405 4.1845 13.5625 4.5625 C 13.1855 4.9395 13 5.478 13 6 L 13 7 L 7 7 L 7 9 L 8 9 L 8 25 C 8 26.645 9.355 28 11 28 L 23 28 C 24.645 28 26 26.645 26 25 L 26 9 L 27 9 L 27 7 L 21 7 L 21 6 C 21 5.478 20.8155 4.9405 20.4375 4.5625 C 20.0605 4.1855 19.522 4 19 4 L 15 4 z M 15 6 L 19 6 L 19 7 L 15 7 L 15 6 z M 10 9 L 24 9 L 24 25 C 24 25.555 23.555 26 23 26 L 11 26 C 10.445 26 10 25.555 10 25 L 10 9 z M 17 12 L 13 16 L 16 16 L 16 23 L 18 23 L 18 16 L 21 16 L 17 12 z"/></svg>';
        restoreIcon.style.fontSize = '18px';
        restoreBtn.appendChild(restoreIcon);
        
        restoreBtn.appendChild(document.createTextNode(' Restore'));
        actionButtons.appendChild(restoreBtn);

        const deleteForeverBtn = document.createElement('button');
        deleteForeverBtn.className = 'btn btn-danger';
        deleteForeverBtn.id = 'delete-forever-btn';
        
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'material-icons';
        deleteIcon.innerHTML = `<svg width="20px" height="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 473 473" style="enable-background:new 0 0 473 473;" xml:space="preserve" fill="#fff">
            <g>
                <path d="M324.285,215.015V128h20V38h-98.384V0H132.669v38H34.285v90h20v305h161.523c23.578,24.635,56.766,40,93.477,40
                    c71.368,0,129.43-58.062,129.43-129.43C438.715,277.276,388.612,222.474,324.285,215.015z M294.285,215.015
                    c-18.052,2.093-34.982,7.911-50,16.669V128h50V215.015z M162.669,30h53.232v8h-53.232V30z M64.285,68h250v30h-250V68z M84.285,128
                    h50v275h-50V128z M164.285,403V128h50v127.768c-21.356,23.089-34.429,53.946-34.429,87.802c0,21.411,5.231,41.622,14.475,59.43
                    H164.285z M309.285,443c-54.826,0-99.429-44.604-99.429-99.43s44.604-99.429,99.429-99.429s99.43,44.604,99.43,99.429
                    S364.111,443,309.285,443z"/>
                <polygon points="342.248,289.395 309.285,322.358 276.323,289.395 255.11,310.608 288.073,343.571 255.11,376.533 276.323,397.746 
                    309.285,364.783 342.248,397.746 363.461,376.533 330.498,343.571 363.461,310.608 	"/>
            </g>
            </svg>`;
        deleteForeverBtn.appendChild(deleteIcon);
        
        deleteForeverBtn.appendChild(document.createTextNode(' Delete forever'));
        actionButtons.appendChild(deleteForeverBtn);

        header.appendChild(actionButtons);

        const emptyTrashBtn = document.createElement('button');
        emptyTrashBtn.className = 'btn btn-danger';
        emptyTrashBtn.id = 'empty-trash-btn';
        
        const emptyIcon = document.createElement('i');
        emptyIcon.className = 'material-icons';
        emptyIcon.innerHTML = `
        <svg fill="#fff" width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M12,13.5857864 L14.2928932,11.2928932 L15.7071068,12.7071068 L13.4142136,15 L15.7071068,17.2928932 L14.2928932,18.7071068 L12,16.4142136 L9.70710678,18.7071068 L8.29289322,17.2928932 L10.5857864,15 L8.29289322,12.7071068 L9.70710678,11.2928932 L12,13.5857864 Z M7,4 L7,3 C7,1.8954305 7.8954305,1 9,1 L15,1 C16.1045695,1 17,1.8954305 17,3 L17,4 L20,4 C21.1045695,4 22,4.8954305 22,6 L22,8 C22,9.1045695 21.1045695,10 20,10 L19.9198662,10 L19,21 C19,22.1045695 18.1045695,23 17,23 L7,23 C5.8954305,23 5,22.1045695 5.00345424,21.0830455 L4.07986712,10 L4,10 C2.8954305,10 2,9.1045695 2,8 L2,6 C2,4.8954305 2.8954305,4 4,4 L7,4 Z M7,6 L4,6 L4,8 L20,8 L20,6 L17,6 L7,6 Z M6.08648886,10 L7,21 L17,21 L17.0034542,20.9169545 L17.9132005,10 L6.08648886,10 Z M15,4 L15,3 L9,3 L9,4 L15,4 Z"/>
        </svg>
        `;
        emptyTrashBtn.appendChild(emptyIcon);
        
        emptyTrashBtn.appendChild(document.createTextNode(' Empty Trash now'));
        header.appendChild(emptyTrashBtn);

        return header;
    }

    private createTabs(): HTMLDivElement {
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'trash-tabs';

        const pageTab = document.createElement('div');
        pageTab.className = 'trash-tab active';
        pageTab.dataset.tab = 'trash-page';
        pageTab.textContent = 'Pages';
        tabsContainer.appendChild(pageTab);

        const versionTab = document.createElement('div');
        versionTab.className = 'trash-tab';
        versionTab.dataset.tab = 'trash-version';
        versionTab.textContent = 'Versions';
        tabsContainer.appendChild(versionTab);

        return tabsContainer;
    }

    private async createPageTabContent(): Promise<HTMLDivElement> {
        const pageTab = document.createElement('div');
        pageTab.className = 'trash-tab-content';
        pageTab.id = 'trash-page-tab';
        const trashItems: TrashItems = await this.getTrashItems();
        if (trashItems && trashItems.TrashItems.length && Array.isArray(trashItems.TrashItems)) {
            const pages = trashItems.TrashItems.filter(item => item.Type === 'Page');
            
            if (pages.length) {
                pages.forEach(item => {
                    pageTab.appendChild(this.createListItem(item));
                });
            } else {
                pageTab.appendChild(this.createEmptyTrashContent());
            }
            
        }else {
            pageTab.appendChild(this.createEmptyTrashContent());
        }

        return pageTab;
    }

    private async createVersionTabContent(): Promise<HTMLDivElement> {
        const versionTab = document.createElement('div');
        versionTab.className = 'trash-tab-content';
        versionTab.id = 'trash-version-tab';

        const trashItems: TrashItems = await this.getTrashItems();
        if (trashItems && trashItems.TrashItems.length && Array.isArray(trashItems.TrashItems)) {
            const versions = trashItems.TrashItems.filter(item => item.Type === 'Version');

            if (versions.length) {
                versions.forEach(item => {
                    versionTab.appendChild(this.createListItem(item));
                });
            } else {
                versionTab.appendChild(this.createEmptyTrashContent());
            }
            
        } else {
            versionTab.appendChild(this.createEmptyTrashContent());
        }

        return versionTab;
    }

    private createListItem(item: TrashItem): HTMLDivElement {
        let itemTitle: string = "Title";
        let itemDeletedDateTime: string = formatDistanceToNow(new Date(), { addSuffix: true });

        if (item.Type === 'Page') {
            itemTitle = item.Page.PageName;
            itemDeletedDateTime = formatDistanceToNow(new Date(item.DeletedAt), { addSuffix: true });
        } else if(item.Type === 'Version') {
            itemTitle = item.Version.AppVersionName;
            itemDeletedDateTime = formatDistanceToNow(new Date(item.DeletedAt), { addSuffix: true });
        }

        const trashItem = document.createElement('div');
        trashItem.className = 'trash-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'trash-checkbox';
        trashItem.appendChild(checkbox);

        const sender = document.createElement('div');
        sender.className = 'trash-sender';
        sender.textContent = itemTitle;
        trashItem.appendChild(sender);

        const content = document.createElement('div');
        content.className = 'trash-content';

        trashItem.appendChild(content);

        const time = document.createElement('div');
        time.className = 'trash-time';
        time.textContent = itemDeletedDateTime;
        trashItem.appendChild(time);

        trashItem.id = item.TrashId;
        trashItem.setAttribute('data-type', item.Type);
        return trashItem;
    }

    private createEmptyTrashContent(): HTMLDivElement {
       
        const emptyTrash = document.createElement('div');
        emptyTrash.className = 'empty-trash';

        const icon = document.createElement('i');
        icon.className = 'material-icons';
        icon.innerHTML = `
            <svg fill="#cdcecf" height="50" width="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M12,13.5857864 L14.2928932,11.2928932 L15.7071068,12.7071068 L13.4142136,15 L15.7071068,17.2928932 L14.2928932,18.7071068 L12,16.4142136 L9.70710678,18.7071068 L8.29289322,17.2928932 L10.5857864,15 L8.29289322,12.7071068 L9.70710678,11.2928932 L12,13.5857864 Z M7,4 L7,3 C7,1.8954305 7.8954305,1 9,1 L15,1 C16.1045695,1 17,1.8954305 17,3 L17,4 L20,4 C21.1045695,4 22,4.8954305 22,6 L22,8 C22,9.1045695 21.1045695,10 20,10 L19.9198662,10 L19,21 C19,22.1045695 18.1045695,23 17,23 L7,23 C5.8954305,23 5,22.1045695 5.00345424,21.0830455 L4.07986712,10 L4,10 C2.8954305,10 2,9.1045695 2,8 L2,6 C2,4.8954305 2.8954305,4 4,4 L7,4 Z M7,6 L4,6 L4,8 L20,8 L20,6 L17,6 L7,6 Z M6.08648886,10 L7,21 L17,21 L17.0034542,20.9169545 L17.9132005,10 L6.08648886,10 Z M15,4 L15,3 L9,3 L9,4 L15,4 Z"/>
            </svg>
        `;
        emptyTrash.appendChild(icon);

        const text1 = document.createElement('p');
        text1.textContent = 'No items in trash';
        emptyTrash.appendChild(text1);

        const text2 = document.createElement('p');
        text2.textContent = 'Items in trash will be automatically deleted after 30 days';
        emptyTrash.appendChild(text2);

        return emptyTrash;
    }

    private setupEventListeners(container: HTMLDivElement): void {
        this.setupTabSwitching(container);
        
        const actionButtons = container.querySelector('#trash-action-buttons');
        const restoreBtn = container.querySelector('#restore-btn');
        const deleteForeverBtn = container.querySelector('#delete-forever-btn');
        const emptyTrashBtn = container.querySelector('#empty-trash-btn');
        
        this.setupItemSelection(container, actionButtons, emptyTrashBtn);
        
        if (restoreBtn) {
            this.setupRestoreButton(container, restoreBtn, actionButtons, emptyTrashBtn);
        }
        
        if (deleteForeverBtn) {
            this.setupDeleteForeverButton(container, deleteForeverBtn, actionButtons, emptyTrashBtn);
        }
        
        if (emptyTrashBtn) {
            this.setupEmptyTrashButton(container, emptyTrashBtn);
        }
    }
    
    private setupTabSwitching(container: HTMLDivElement): void {
        const tabs = container.querySelectorAll('.trash-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.trash-tab').forEach(t => t.classList.remove('active'));
                container.querySelectorAll('.trash-tab-content').forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                
                const tabId = tab.getAttribute('data-tab');
                if (tabId) {
                    const tabContent = container.querySelector(`#${tabId}-tab`);
                    if (tabContent) {
                        tabContent.classList.add('active');
                    }
                }
            });
        });
    }
    
    private setupItemSelection(
        container: HTMLDivElement, 
        actionButtons: Element | null, 
        emptyTrashBtn: Element | null
    ): void {
        const trashItems = container.querySelectorAll('.trash-item');
        
        trashItems.forEach(item => {
            const checkbox = item.querySelector('.trash-checkbox') as HTMLInputElement;
            
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
                this.updateActionButtonsVisibility(container, actionButtons, emptyTrashBtn);
            });
            
            item.addEventListener('click', (e) => {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        });
    }
    
    private updateActionButtonsVisibility(
        container: HTMLDivElement,
        actionButtons: Element | null, 
        emptyTrashBtn: Element | null
    ): void {
        const checkedItems = container.querySelectorAll('.trash-checkbox:checked');
        if (actionButtons && emptyTrashBtn) {
            if (checkedItems.length > 0) {
                actionButtons.classList.add('visible');
                (emptyTrashBtn as HTMLElement).style.display = 'none';
            } else {
                actionButtons.classList.remove('visible');
                (emptyTrashBtn as HTMLElement).style.display = 'flex';
            }
        }
    }
    
    private setupRestoreButton(
        container: HTMLDivElement,
        restoreBtn: Element,
        actionButtons: Element | null,
        emptyTrashBtn: Element | null
    ): void {
        restoreBtn.addEventListener('click', () => {
            const checkedItems = container.querySelectorAll('.trash-checkbox:checked');
            if (checkedItems.length > 0) {
                if (confirm(`Restore ${checkedItems.length} selected item(s)?`)) {
                    this.removeSelectedItems(checkedItems, "restore");
                    this.updateActionButtonsVisibility(container, actionButtons, emptyTrashBtn);
                    const versionManager = new AppVersionManager();
                     versionManager.refreshVersion();
                }
            }
        });
    }
    
    private setupDeleteForeverButton(
        container: HTMLDivElement,
        deleteForeverBtn: Element,
        actionButtons: Element | null,
        emptyTrashBtn: Element | null
    ): void {
        deleteForeverBtn.addEventListener('click', () => {
            const checkedItems = container.querySelectorAll('.trash-checkbox:checked');
            if (checkedItems.length > 0) {
                if (confirm(`Permanently delete ${checkedItems.length} selected item(s)? This action cannot be undone.`)) {
                    this.removeSelectedItems(checkedItems, "delete");
                    this.updateActionButtonsVisibility(container, actionButtons, emptyTrashBtn);
                }
            }
        });
    }
    
    private removeSelectedItems(checkedItems: NodeListOf<Element>, mode: string): void {
        checkedItems.forEach(checkbox => {
            const item = checkbox.closest('.trash-item');
            if (item) {
                const toolboxService = new ToolBoxService();
                const type = item.getAttribute('data-type');
                const id = item.getAttribute('id');
                if (type && id && mode === "delete") {
                    const res = toolboxService.deleteTrashForver(type, id);
                    item.remove();
                } else if (type && id && mode === "restore") {
                    const res = toolboxService.restoreTrash(type, id);
                    item.remove();
                    const versionSelectList = new VersionSelectionView();
                    versionSelectList.refreshVersionList();
                    this.createModalContent();
                }
            }

            this.refreshTabContent();
        });
    }
    
    private refreshTabContent() {
        const activeTab = document.querySelector('.trash-tab.active');
        if (activeTab) {
            const tabId = activeTab.getAttribute('data-tab');
            if (tabId) {
                const activeContent = document.querySelector(`#${tabId}-tab`);
                if (activeContent) {
                    const remainingItems = activeContent.querySelectorAll('.trash-item');
                    if (remainingItems.length === 0) {
                        activeContent.innerHTML = '';
                        activeContent.appendChild(this.createEmptyTrashContent());
                    }
                }
            }
        }
    }

    private setupEmptyTrashButton(container: HTMLDivElement, emptyTrashBtn: Element): void {
        emptyTrashBtn.addEventListener('click', () => {
            const activeTab = container.querySelector('.trash-tab.active');
            if (activeTab) {
                const tabId = activeTab.getAttribute('data-tab');
                if (tabId) {
                    const activeContent = container.querySelector(`#${tabId}-tab`);
                    if (confirm('Are you sure you want to permanently delete all items in trash?')) {
                        if (activeContent) {
                            const tabItems = activeContent.querySelectorAll('.trash-checkbox');
                            if (tabItems) {
                                this.removeSelectedItems(tabItems, "delete");
                                activeContent.innerHTML = '';                                
                                activeContent.appendChild(this.createEmptyTrashContent());
                            }                         
                        }
                    }
                }
            }
        });
    }

    private getTrashItems() {
        const toolboxService = new ToolBoxService();
        const res = toolboxService.getTrashItems();
        return res;
    }
}