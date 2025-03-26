import { ChildEditor } from "../../../../controls/editor/ChildEditor";
import { AppVersionManager } from "../../../../controls/versions/AppVersionManager";
import { ActionPage } from "../../../../interfaces/ActionPage";
import { baseURL, ToolBoxService } from "../../../../services/ToolBoxService";
import { Alert } from "../../Alert";
import { ActionListDropDown } from "./ActionListDropDown";
import { ActionSelectContainer } from "./ActionSelectContainer";
import { FormModalService } from "./FormModalService";
import { PageAttacher } from "./PageAttacher";

export class PageCreationService {
    appVersionManager: any;
    toolBoxService: any;
    formModalService: FormModalService;

    constructor() {
        this.appVersionManager = new AppVersionManager();
        this.toolBoxService = new ToolBoxService();
        this.formModalService = new FormModalService();
    }

    addNewService() {
        // console.log("addNewService");
    }

    addNewContentPage() {
        const form = this.formModalService.createForm('conent-page-form', [
            {
                label: 'Page Title',
                type: 'text',
                id: 'page_title',
                placeholder: 'Enter page title',
                required: true,
                errorMessage: 'Please enter a page title',
                minLength: 3,
                maxLength: 50
            }
        ]);

        this.formModalService.createModal({
            title: "Add New Content Page",
            form,
            onSave: () => this.processContentPageData(form.getData())
        });
    }

    addNewMenuPage() {
        const form = this.formModalService.createForm('menu-page-form', [
            {
                label: 'Page Title',
                type: 'text',
                id: 'page_title',
                placeholder: 'Enter page title',
                required: true,
                errorMessage: 'Please enter a page title',
                minLength: 3,
                maxLength: 50
            }
        ]);

        this.formModalService.createModal({
            title: "Add New Menu Page",
            form,
            onSave: () => this.processMenuPageData(form.getData()),
        });
    }

    handleWebLinks() {
        const form = this.formModalService.createForm('web-link-form', [
            {
                label: 'Link Url',
                type: 'text',
                id: 'link_url',
                placeholder: 'https://example.com',
                required: true,
                errorMessage: 'Please enter a valid URL',
                validate: this.formModalService.isValidUrl
            },
            {
                label: 'Link Label',
                type: 'text',
                id: 'link_label',
                placeholder: 'Example Link',
                required: true,
                errorMessage: 'Please enter a label for your link',
                minLength: 2
            }
        ]);

        this.formModalService.createModal({
            title: "Add Web Link",
            form,
            onSave: () => this.processFormData(form.getData()),
        });
    }

    async handleDynamicForms(form: any) {
        const selectedComponent = (globalThis as any).selectedComponent;
        if (!selectedComponent) return;

        const tileTitle = selectedComponent.find(".tile-title")[0];
        if (tileTitle) tileTitle.components(form.PageName);

        const tileId = selectedComponent.parent().getId();
        const rowId = selectedComponent.parent().parent().getId();

        const version = await this.appVersionManager.getActiveVersion(); 
        const childPage = version.Pages.find((page: any) => (page.PageName === "Dynamic Form" && page.PageType === "DynamicForm"));

        const formUrl = `${baseURL}/utoolboxdynamicform.aspx?WWPFormId=${form.PageId}&WWPDynamicFormMode=DSP&DefaultFormType=&WWPFormType=0`;
        const updates = [
            ["Text", form.PageName],
            ["Name", form.PageName],
            ["Action.ObjectType", "Web Link"],
            ["Action.ObjectId", childPage?.PageId],
            ["Action.ObjectUrl", formUrl],
        ];

       this.updateActionListDropDown("Dynamic Form", form.PageName);

        for (const [property, value] of updates) {
            (globalThis as any).tileMapper.updateTile(tileId, property, value);
        } 
        const tileAttributes = (globalThis as any).tileMapper.getTile(
            rowId,
            tileId
        );
        new PageAttacher().removeOtherEditors();
        new ChildEditor(childPage?.PageId, childPage).init(tileAttributes);
    }

    private async processMenuPageData(formData: Record<string, string>) {
        const version = await this.appVersionManager.getActiveVersion();
        
        this.toolBoxService.createMenuPage(version.AppVersionId, formData.page_title).then((res: any) => { 
            this.updateActionListDropDown("Home", res.MenuPage.PageName);
            this.updateTileAfterPageCreation(res.MenuPage);

            new Alert('success', 'Page created successfully');
        });
    }

    private async processContentPageData(formData: Record<string, string>) {
        const version = await this.appVersionManager.getActiveVersion();
        
        this.toolBoxService.createContentPage(version.AppVersionId, formData.page_title).then((res: any) => { 
            this.updateTileAfterPageCreation(res.ContentPage);
            new Alert('success', 'Page created successfully');
        });
    }

    updateActionListDropDown(type: any, pageName: any) {
            const dropDownContainer = document.getElementById("dropdownMenu") as HTMLElement;
            dropDownContainer.querySelector('details')?.removeAttribute('open');
            dropDownContainer.style.display = "none";

            const actionHeader = document.querySelector(".tb-dropdown-header") as HTMLElement;
            const actionHeaderLabel = actionHeader.querySelector('#sidebar_select_action_label') as HTMLElement;
            const actionIcon = actionHeader.querySelector('i') as HTMLElement;
            
            actionIcon.classList.remove("fa-angle-up");
            actionIcon.classList.add("fa-angle-down");
            actionHeaderLabel.innerText = `${type.length > 14 ? type.substring(0, 14) + "..." : type}, ${pageName.length > 14 ? pageName.substring(0, 14) + "..." : pageName}`
    }
    private async updateTileAfterPageCreation(page: any) {
        const selectedComponent = (globalThis as any).selectedComponent;
        if (!selectedComponent) return;

        const tileTitle = selectedComponent.find(".tile-title")[0];
        if (tileTitle) tileTitle.components(page.PageName);

        const tileId = selectedComponent.parent().getId();
        const rowId = selectedComponent.parent().parent().getId();

        const tileAttributes = (globalThis as any).tileMapper.getTile(
            rowId,
            tileId
        );

        const updates = [
            ["Text", page.PageName],
            ["Name", page.PageName],
            ["Action.ObjectType", "Page"],
            ["Action.ObjectId", page.PageId],
          ];
          
        for (const [property, value] of updates) {
            (globalThis as any).tileMapper.updateTile(tileId, property, value);
        }
        const version = await this.appVersionManager.getActiveVersion(); 
        this.attachPage(page, version, tileAttributes);
    }

    private attachPage(pageData: any, version: any, tileAttributes: any) {
        new PageAttacher().removeOtherEditors();
    
        new ChildEditor(pageData.PageId, pageData).init(tileAttributes);
      }

    private async processFormData(formData: Record<string, string>) {
        const selectedComponent = (globalThis as any).selectedComponent;
        if (!selectedComponent) return;

        const tileTitle = selectedComponent.find(".tile-title")[0];
        if (tileTitle) tileTitle.components(formData.link_label);

        const tileId = selectedComponent.parent().getId();
        const rowId = selectedComponent.parent().parent().getId();

        const version = await this.appVersionManager.getActiveVersion(); 
        const childPage = version.Pages.find((page: any) => (page.PageName === "Web Link" && page.PageType === "WebLink"));

        const updates = [
            ["Text", formData.link_label],
            ["Name", formData.link_label],
            ["Action.ObjectType", "Web Link"],
            ["Action.ObjectId", childPage?.PageId],
            ["Action.ObjectUrl", formData.link_url],
        ];
      
        for (const [property, value] of updates) {
            (globalThis as any).tileMapper.updateTile(tileId, property, value);
        } 
        const tileAttributes = (globalThis as any).tileMapper.getTile(
            rowId,
            tileId
        );
        
        new PageAttacher().removeOtherEditors();
        new ChildEditor(childPage?.PageId, childPage).init(tileAttributes);
    }
}