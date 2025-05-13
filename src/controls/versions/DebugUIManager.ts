import { i18n } from "../../i18n/i18n";
import { DebugResults } from "../../interfaces/DebugResults";
import { truncateString } from "../../utils/helpers";
import { AppVersionManager } from "./AppVersionManager";

export class DebugUIManager {
    container: HTMLElement;
    debugResults: DebugResults;
    activeFilter: string | null = null;

    constructor(debugResults: DebugResults) {
        this.debugResults = debugResults;
        this.container = document.createElement('div');
        this.container.classList.add('tb_debug_dashboard');
    }

    // Method to create the summary of debug results (Total URLs, Success, Fail)
    private debugSummary() {
        const debugSummary = document.createElement('div');
        debugSummary.classList.add('tb_debug_summary');
        // Total URLs Section
        const totalUrls = this.createSummaryItem(this.debugResults.Summary.TotalUrls, `${i18n.t("navbar.debug.total_urls")}`, true);

        // Successful URLs Section
        const totalSuccess = this.createSummaryItem(this.debugResults.Summary.SuccessCount, `${i18n.t("navbar.debug.total_successful")}`);

        // Failed URLs Section
        const totalFail = this.createSummaryItem(this.debugResults.Summary.FailureCount, `${i18n.t("navbar.debug.total_failed")}`);

        debugSummary.appendChild(totalUrls);
        debugSummary.appendChild(totalSuccess);
        debugSummary.appendChild(totalFail);

        return debugSummary;
    }

    // Helper method to create individual summary items
    private createSummaryItem(count: string, label: string, isFirstTab = false): HTMLElement {
        const item = document.createElement('div');
        item.classList.add('tb_debug_summary_item');
        if (isFirstTab) {
            item.classList.add('active');           
        }
        item.innerHTML = `
            <h3>${parseFloat(count).toString()}</h3>
            <p>${label}</p>
        `;

        item.addEventListener("click", () => {
            const summaryItems = this.container.querySelectorAll('.tb_debug_summary_item');
            summaryItems.forEach(el => el.classList.remove('active'));

            item.classList.add('active');

            this.activeFilter = label === `${i18n.t("navbar.debug.total_urls")}` ? null : label;

            this.filterPageSections();
        });

        return item;
    }

    private filterPageSections() {
        // 1. Select all page sections
        const pageSections = this.container.querySelectorAll('.tb_debug_page-section');
        
        pageSections.forEach(pageSection => {
            // 2. Find the URL list within each page section
            const urlList = pageSection.querySelector('.tb_debug_url-list');
            if (!urlList) return;
    
            // 3. Get all URL items
            const urlItems = urlList.querySelectorAll('.tb_debug_url-item');
            let hasVisibleUrls = false;
    
            // 4. Iterate through URL items and apply filtering
            urlItems.forEach(urlItem => {
                const statusElement = urlItem.querySelector('.tb_debug_url-status');
                const isVisible = this.shouldShowUrlItem(statusElement);
                
                // 5. Toggle visibility of URL items
                urlItem.classList.toggle('hidden', !isVisible);
                if (isVisible) hasVisibleUrls = true;
            });
    
            // 6. Hide entire page section if no URL items are visible
            pageSection.classList.toggle('hidden', !hasVisibleUrls);
        });
    }

    private shouldShowUrlItem(statusElement: Element | null): boolean {
        // 1. If no status element, show the item
        if (!statusElement) return true;
        
        // 2. If no filter is active, show all items
        if (this.activeFilter === null) return true;
    
        // 3. For 'Successful' filter
        if (this.activeFilter === `${i18n.t("navbar.debug.total_successful")}`) {
            return statusElement.classList.contains('tb_debug_status-200');
        }
    
        if (this.activeFilter === `${i18n.t("navbar.debug.total_failed")}`) {
            return Number(statusElement.textContent?.split(' ')[0]) >= 400 || Number(statusElement.textContent?.split(' ')[0]) == 0;
        }
    
        return true;
    }

    private debugPageSections() {
        const debugPage = document.createElement('div');
        debugPage.classList.add('tb_debug_page-sections');

        // Dynamically create a section for each page
        this.debugResults.Pages.forEach(pageItem => {
            const pageSection = this.debugPageSection(pageItem);
            debugPage.appendChild(pageSection);
        });

        return debugPage;
    }

    // Method to create a single section for each page
    private debugPageSection(pageItem: { Page: string, UrlList: { Url: string, StatusCode: number, StatusMessage: string, AffectedType: string, AffectedName: string }[] }) {
        const pageSection = document.createElement('div');
        pageSection.classList.add('tb_debug_page-section');

        // Add title for the page
        const title = document.createElement('div');
        title.classList.add('tb_debug_page-title');
        title.innerText = pageItem.Page;
        pageSection.appendChild(title);

        // Create the URL list for the page
        const urlList = this.createUrlList(pageItem.UrlList);
        pageSection.appendChild(urlList);

        return pageSection;
    }

    private createUrlList(urlList: { Url: string, StatusCode: number, StatusMessage: string, AffectedType: string, AffectedName: string }[]): HTMLElement {
        const urlListElement = document.createElement('div');
        urlListElement.classList.add('tb_debug_url-list');

        urlList.forEach((urlItem, index: number) => {
            const urlItemElement = this.createUrlItem(urlItem);
            urlListElement.appendChild(urlItemElement);
        });

        return urlListElement;
    }

    private createUrlItem(urlItem: { Url: string, StatusCode: number, StatusMessage: string, AffectedType: string, AffectedName: string }): HTMLElement {
        const urlItemElement = document.createElement('div');
        urlItemElement.classList.add('tb_debug_url-item');

        urlItemElement.innerHTML = `
            <details>
                <summary class="tb_debug_url-header">
                    <div class="tb_debug_url-text">${truncateString(urlItem.Url, 70)}</div>
                    <div class="tb_debug_url-status tb_debug_status-${urlItem.StatusCode}">${urlItem.StatusCode} ${truncateString(urlItem.StatusMessage, 10)}</div>
                </summary>
                <div class="tb_debug_details-content">
                    <strong>${i18n.t("navbar.debug.full_url")}:</strong> ${urlItem.Url}
                    <br><strong>${i18n.t("navbar.debug.status_code")}:</strong> ${urlItem.StatusCode}
                    <br><strong>${i18n.t("navbar.debug.status_message")}:</strong> ${urlItem.StatusMessage}
                    ${urlItem.StatusCode >= 400 || urlItem.StatusCode == 0? `${this.getAffectedTiles(urlItem)}` : ''}
                </div>
            </details>
        `;

        return urlItemElement;
    }

    private getAffectedTiles(url: { Url: string, StatusCode: number, StatusMessage: string, AffectedType: string, AffectedName: string }): string {
        if (url.AffectedType === 'Tile') {
            return `<br><strong>${i18n.t("navbar.debug.affected_tile")}:</strong> <div class="tb_debug-badge">${url.AffectedName}</div>`
        } else if(url.AffectedType === 'Cta') {
            return `<br><strong>${i18n.t("navbar.debug.affected_cta")}: </strong><div class="tb_debug-badge">${url.AffectedName}</div>`
        } else if(url.AffectedType === 'Content') {
            return `<br><strong>${i18n.t("navbar.debug.affected_content")}: </strong><div class="tb_debug-badge">${url.AffectedName}</div>`
        }
        return ``;
    }
    
    public buildDebugUI(): HTMLElement {
        this.container.appendChild(this.debugSummary());
        this.container.appendChild(this.debugPageSections());

        this.filterPageSections();

        return this.container;
    }
}
