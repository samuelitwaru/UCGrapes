var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { templates } from "../../utils/templates";
import { JSONToGrapesJSMenu } from "../editor/JSONToGrapesJSMenu";
import { AppVersionManager } from "../versions/AppVersionManager";
export class TemplateManager {
    constructor(pageId, editor, templateId) {
        this.pageId = pageId;
        this.editor = editor;
        this.templateId = templateId;
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const pageDataRow = (_a = templates.Templates.find((template) => template.Id === this.templateId)) === null || _a === void 0 ? void 0 : _a.Rows;
            const appVersionManager = new AppVersionManager();
            const page = appVersionManager.getPages().find((page) => page.PageId === this.pageId);
            if (page) {
                const updatedData = this.getUpdatedPageData(pageDataRow, page);
                this.editor.DomComponents.clear();
                this.applyTemplate(updatedData);
            }
        });
    }
    getUpdatedPageData(pageDataRow, page) {
        const updatePageDataRow = JSON.parse(JSON.stringify(pageDataRow));
        let updatePage = JSON.parse(JSON.stringify(page));
        updatePage.PageMenuStructure.Rows = updatePageDataRow;
        updatePage = JSON.parse(JSON.stringify(updatePage));
        return updatePage;
    }
    applyTemplate(pageData) {
        const converter = new JSONToGrapesJSMenu(pageData);
        const htmlOutput = converter.generateHTML();
        this.editor.setComponents(htmlOutput);
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(pageData));
    }
}
//# sourceMappingURL=TemplateManager.js.map