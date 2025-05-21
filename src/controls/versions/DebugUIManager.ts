import { i18n } from "../../i18n/i18n";
import { DebugResults } from "../../types";
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

    private debugSummary() {
        if (!this.debugResults || !this.debugResults.Summary || 
            !this.debugResults.Pages || this.debugResults.Pages.length === 0) {
            const noResultsMessage = document.createElement('div');
            noResultsMessage.classList.add('tb_debug_no_results');
            noResultsMessage.innerHTML = `
                <h3>${i18n.t("navbar.debug.no_results")}</h3>
                <p>${i18n.t("navbar.debug.no_results_message")}</p>
            `;
            return noResultsMessage;
        }

        const debugSummary = document.createElement('div');
        debugSummary.classList.add('tb_debug_summary');
        const totalUrls = this.createSummaryItem(this.debugResults?.Summary.TotalUrls, `${i18n.t("navbar.debug.total_urls")}`, true);

        const totalSuccess = this.createSummaryItem(this.debugResults?.Summary.SuccessCount, `${i18n.t("navbar.debug.total_successful")}`);

        const totalFail = this.createSummaryItem(this.debugResults?.Summary.FailureCount, `${i18n.t("navbar.debug.total_failed")}`);

        debugSummary.appendChild(totalUrls);
        debugSummary.appendChild(totalSuccess);
        debugSummary.appendChild(totalFail);

        return debugSummary;
    }

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
        if (!this.debugResults || !this.debugResults.Pages || this.debugResults.Pages.length === 0) {
            return;
        }
        
        const pageSections = this.container.querySelectorAll('.tb_debug_page-section');
        
        pageSections.forEach(pageSection => {
            const urlList = pageSection.querySelector('.tb_debug_url-list');
            if (!urlList) return;
    
            const urlItems = urlList.querySelectorAll('.tb_debug_url-item');
            let hasVisibleUrls = false;
    
            urlItems.forEach(urlItem => {
                const statusElement = urlItem.querySelector('.tb_debug_url-status');
                const isVisible = this.shouldShowUrlItem(statusElement);
                
                urlItem.classList.toggle('hidden', !isVisible);
                if (isVisible) hasVisibleUrls = true;
            });
    
            pageSection.classList.toggle('hidden', !hasVisibleUrls);
        });
    }

    private shouldShowUrlItem(statusElement: Element | null): boolean {
        if (!statusElement) return true;
        
        if (this.activeFilter === null) return true;
    
        if (this.activeFilter === `${i18n.t("navbar.debug.total_successful")}`) {
            return statusElement.classList.contains('tb_debug_status-200');
        }
    
        if (this.activeFilter === `${i18n.t("navbar.debug.total_failed")}`) {
            return Number(statusElement.textContent?.split(' ')[0]) >= 400 || Number(statusElement.textContent?.split(' ')[0]) == 0;
        }
    
        return true;
    }

    private debugPageSections() {
        // Check if there are no debug results
        if (!this.debugResults || !this.debugResults.Pages || this.debugResults.Pages.length === 0) {
            return document.createElement('div');
        }
        
        const debugPage = document.createElement('div');
        debugPage.classList.add('tb_debug_page-sections');

        this.debugResults.Pages.forEach(pageItem => {
            const pageSection = this.debugPageSection(pageItem);
            debugPage.appendChild(pageSection);
        });

        return debugPage;
    }

    private debugPageSection(pageItem: { Page: string, UrlList: { Url: string, StatusCode: number, StatusMessage: string, AffectedType: string, AffectedName: string }[] }) {
        const pageSection = document.createElement('div');
        pageSection.classList.add('tb_debug_page-section');

        const title = document.createElement('div');
        title.classList.add('tb_debug_page-title');
        title.innerText = pageItem.Page;
        pageSection.appendChild(title);

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
        if (!this.debugResults || 
            !this.debugResults.Summary || 
            !this.debugResults.Pages || 
            this.debugResults.Pages.length === 0) {
            
            const emptyStateMessage = document.createElement('div');
            emptyStateMessage.classList.add('tb_debug_empty_state');
            emptyStateMessage.innerHTML = `
                <div class="tb_debug_empty_icon">⚠️</div>
                <h3>No Debug Results Available</h3>
                <p>There are no debug results to display. Please run a debug scan first.</p>
            `;
            this.container.appendChild(emptyStateMessage);
        } else {
            this.container.appendChild(this.debugSummary());
            this.container.appendChild(this.debugPageSections());
            this.filterPageSections();
        }

        return this.container;
    }
}