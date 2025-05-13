import { ToolBoxService } from "../../services/ToolBoxService";
import { JSONToGrapesJSContent } from "./JSONToGrapesJSContent";

export class LoadReceptionData {
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

            console.log("Location data retrieved:", this.locationData)

            // Update page data and get the updated structure
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

        const defaultDesc = "Welkom bij de receptie van onze app. Hier kunt u al uw vragen stellen en krijgt u direct hulp van ons team. Of het nu gaat om technische ondersteuning, informatie over diensten, of algemene vragen, wij zijn er om u te helpen.";
        const defaultImage = "https://staging.comforta.yukon.software/media/receptie-197@3x.png";
        
        this.pageData.PageContentStructure.Content = this.pageData.PageContentStructure.Content.map((item: any) => {
            if (item?.ContentType === 'Image') {
                return { ...item, ContentValue: locationDetails.ReceptionImage ? locationDetails.ReceptionImage : defaultImage };
            }
            if (item?.ContentType === 'Description') {
                return { ...item, ContentValue: locationDetails.ReceptionDescription ? locationDetails.ReceptionDescription : defaultDesc };
            }
            return item;
        });

        return this.pageData; 
    }
}
