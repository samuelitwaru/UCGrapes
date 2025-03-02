import { Locale } from "../../../rebuild-classes/Locale"
import { DataManager } from "../../../rebuild-classes/DataManager"

class TileActionControl {
    currentLanguage: Locale;
    categoryData: ({ name: string; displayName: string; label: any; options: never[]; canAdd: boolean; addAction: () => any; isWebLink?: undefined; } | { name: string; displayName: string; label: any; options: never[]; canAdd?: undefined; addAction?: undefined; isWebLink?: undefined; } | { name: string; displayName: string; label: any; options: never[]; isWebLink: boolean; addAction: () => any; canAdd?: undefined; })[];
    pageOptions: any;
    dataManager: DataManager;
    predefinedPageOptions: import("/home/samuelitwaru/Desktop/CODE/UCGrapes/src/rebuild-classes/data-models/Page").Page[];
    servicePageOptions: { PageId: any; PageName: any; PageTileName: any; }[];
    dynamicForms: { PageId: string; PageName: string; PageTileName: string; FormUrl: string; }[];
    
    constructor() {
        this.currentLanguage = new Locale();
        this.categoryData = [
            {
              name: "Page",
              displayName: "Page",
              label: this.currentLanguage.getTranslation("category_page"),
              options: [],
              canAdd: true,
              addAction: () => {},
            },
            {
              name: "Service/Product Page",
              displayName: "Service Page",
              label: this.currentLanguage.getTranslation("category_services_or_page"),
              options: [],
              canAdd: true,
              addAction: () => {},
            },
            {
              name: "Dynamic Forms",
              displayName: "Dynamic Forms",
              label: this.currentLanguage.getTranslation("category_dynamic_form"),
              options: [],
            },
            {
              name: "Predefined Page",
              displayName: "Module",
              label: this.currentLanguage.getTranslation("category_predefined_page"),
              options: [],
            },
            {
              name: "Web Link",
              displayName: "Web Link",
              label: this.currentLanguage.getTranslation("category_link"),
              options: [],
              isWebLink: true,
              addAction: () => {},
            },
        ];
    }

    async populateCategories() {
        try {
          this.pageOptions = this.filterPages(
            (page) =>
              !page.PageIsContentPage &&
              !page.PageIsPredefined &&
              !page.PageIsDynamicForm &&
              !page.PageIsWebLinkPage
          );
    
          this.predefinedPageOptions = this.filterPages(
            (page) => page.PageIsPredefined && page.PageName != "Home"
          );
    
          this.servicePageOptions = (this.dataManager.services || []).map(
            (service) => ({
              PageId: service.ProductServiceId,
              PageName: service.ProductServiceName,
              PageTileName:
                service.ProductServiceTileName || service.ProductServiceName,
            })
          );
    
          this.dynamicForms = (this.dataManager.forms || []).map((form) => ({
            PageId: form.FormId,
            PageName: form.ReferenceName,
            PageTileName: form.ReferenceName,
            FormUrl: form.FormUrl,
          }));
    
          const categoryMap = {
            Page: this.pageOptions,
            "Service/Product Page": this.servicePageOptions,
            "Dynamic Forms": this.dynamicForms,
            "Predefined Page": this.predefinedPageOptions,
          };
    
          this.categoryData.forEach((category) => {
            category.options = categoryMap[category.name] || [];
          });
        } catch (error) {
          console.error("Error populating categories:", error);
        }
    }

    filterPages(filterFn) {
        if (!this.dataManager.pages) {
          console.warn("Page collection is not available");
          return [];
        }
        return this.dataManager.pages.filter((page) => {
          if (page) {
            page.PageTileName = page.PageName;
            return filterFn(page);
          }
          return false;
        });
    }
    
    render() {

        return `
            <div class="tile-action-control">
                <h2>Tile Action Control</h2>
                <p>This is a tile action control</p>
            </div>
        `;
    }
}