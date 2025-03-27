import { ToolBoxService } from "../../services/ToolBoxService";
import { JSONToGrapesJSContent } from "./JSONToGrapesJSContent";

export class LoadLocationData {
    toolboxService: any;
    locationData: any;
    editor: any;
    pageData: any;

    constructor(editor: any, pageData: any) {
        this.toolboxService = new ToolBoxService();
        this.editor = editor;
        this.pageData = pageData;
    }

    public async setupEditor() {
        try {
            this.locationData = await this.toolboxService.getLocationData();
            
            if (!this.locationData) {
                console.warn("Location data could not be retrieved.");
                return;
            }

            const updatedPageData = this.updatePageData();

            const converter = new JSONToGrapesJSContent(updatedPageData);
            const htmlOutput = converter.generateHTML();

            this.editor.setComponents(htmlOutput); 

            localStorage.setItem(`data-${this.pageData.PageId}`, JSON.stringify(updatedPageData));
        } catch (error) {
            console.error("Error fetching location data:", error);
        }
    }

    updatePageData(): any {
        if (!this.pageData?.PageContentStructure?.Content) return this.pageData;

        const locationDetails = this.locationData?.BC_Trn_Location || {};
        
        this.pageData.PageContentStructure.Content = this.pageData.PageContentStructure.Content.map((item: any) => {
            if (item?.ContentType === 'Image') {
                return { ...item, ContentValue: locationDetails.LocationImage || item.ContentValue };
            }
            if (item?.ContentType === 'Description') {
                return { ...item, ContentValue: locationDetails.LocationDescription || item.ContentValue };
            }
            return item;
        });

        return this.pageData; 
    }
}
