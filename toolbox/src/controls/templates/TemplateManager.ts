import { templates } from "../../utils/templates";
import { JSONToGrapesJSMenu } from "../editor/JSONToGrapesJSMenu";
import { AppVersionManager } from "../versions/AppVersionManager";

export class TemplateManager {
    private pageId: string;
    private editor: any;
    templateId: string;

    constructor(pageId: string, editor: any, templateId: string) {
        this.pageId = pageId;
        this.editor = editor;
        this.templateId = templateId;
        this.init();
    }

    private async init() {
        const pageDataRow = templates.Templates.find((template: any) => template.Id === this.templateId)?.Rows;
        const appVersionManager = new AppVersionManager();
        const page = appVersionManager.getPages().find((page: any) => page.PageId === this.pageId);

        if (page) {
            const updatedData = this.getUpdatedPageData(pageDataRow, page);
            this.editor.DomComponents.clear();
            this.applyTemplate(updatedData);
        }
    }

    private getUpdatedPageData(pageDataRow: any, page: any) {        
        const updatePageDataRow = JSON.parse(JSON.stringify(pageDataRow));
        let updatePage = JSON.parse(JSON.stringify(page));

        updatePage.PageMenuStructure.Rows = updatePageDataRow;
        updatePage = JSON.parse(JSON.stringify(updatePage));

        return updatePage;
    }

    private applyTemplate(pageData: any) {
        const converter = new JSONToGrapesJSMenu(pageData);
        const htmlOutput = converter.generateHTML();

        this.editor.setComponents(htmlOutput); 

        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(pageData));
    }
}