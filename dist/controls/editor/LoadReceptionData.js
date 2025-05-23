var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ToolBoxService } from "../../services/ToolBoxService";
import { JSONToGrapesJSContent } from "./JSONToGrapesJSContent";
export class LoadReceptionData {
    constructor(editor, pageData) {
        this.toolboxService = new ToolBoxService();
        this.editor = editor;
        this.pageData = pageData;
    }
    setupEditor() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.locationData = yield this.toolboxService.getLocationData();
                if (!this.locationData) {
                    console.warn("Location data could not be retrieved.");
                    return;
                }
                console.log("Location data retrieved:", this.locationData);
                // Update page data and get the updated structure
                const updatedPageData = this.updatePageData();
                const converter = new JSONToGrapesJSContent(updatedPageData);
                const htmlOutput = converter.generateHTML();
                this.editor.setComponents(htmlOutput);
                localStorage.setItem(`data-${this.pageData.PageId}`, JSON.stringify(updatedPageData));
            }
            catch (error) {
                console.error("Error fetching location data:", error);
            }
        });
    }
    updatePageData() {
        var _a, _b, _c;
        if (!((_b = (_a = this.pageData) === null || _a === void 0 ? void 0 : _a.PageContentStructure) === null || _b === void 0 ? void 0 : _b.Content))
            return this.pageData;
        const locationDetails = ((_c = this.locationData) === null || _c === void 0 ? void 0 : _c.BC_Trn_Location) || {};
        const defaultDesc = "Welkom bij de receptie van onze app. Hier kunt u al uw vragen stellen en krijgt u direct hulp van ons team. Of het nu gaat om technische ondersteuning, informatie over diensten, of algemene vragen, wij zijn er om u te helpen.";
        const defaultImage = "https://staging.comforta.yukon.software/media/receptie-197@3x.png";
        this.pageData.PageContentStructure.Content = this.pageData.PageContentStructure.Content.map((item) => {
            if ((item === null || item === void 0 ? void 0 : item.ContentType) === 'Image') {
                return Object.assign(Object.assign({}, item), { ContentValue: locationDetails.ReceptionImage ? locationDetails.ReceptionImage : defaultImage });
            }
            if ((item === null || item === void 0 ? void 0 : item.ContentType) === 'Description') {
                return Object.assign(Object.assign({}, item), { ContentValue: locationDetails.ReceptionDescription ? locationDetails.ReceptionDescription : defaultDesc });
            }
            return item;
        });
        return this.pageData;
    }
}
//# sourceMappingURL=LoadReceptionData.js.map