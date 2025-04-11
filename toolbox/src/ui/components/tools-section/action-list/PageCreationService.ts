import { ChildEditor } from "../../../../controls/editor/ChildEditor";
import { AppVersionManager } from "../../../../controls/versions/AppVersionManager";
import { i18n } from "../../../../i18n/i18n";
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

  handlePhone() {
    const formModalService = this.formModalService;
    const form = this.formModalService.createForm("phone-form", [
      {
        label: "Phone Number",
        type: "tel",
        id: "field_value",
        placeholder: "123-456-7890",
        required: true,
        errorMessage: "Please enter a valid phone number",
        validate: (value: string) => formModalService.isValidPhone(value),
      },
      {
        label: "Tile Label",
        type: "",
        id: "field_label",
        placeholder: "Call us now",
        required: true,
        errorMessage: "Please enter a label for your phone tile",
        minLength: 2,
      },
    ]);

    this.formModalService.createModal({
      title: "Add Phone Number",
      form,
      onSave: () => this.processFormData(form.getData(), 'Phone'),
    });
  }

  // Updated handleEmail method
  handleEmail() {
    const formModalService = this.formModalService;
    const form = this.formModalService.createForm("email-form", [
      {
        label: "Email Address",
        type: "email",
        id: "field_value",
        placeholder: "example@example.com",
        required: true,
        errorMessage: "Please enter a valid email address",
        validate: (value: string) => formModalService.isValidEmail(value),
      },
      {
        label: "Tile Label",
        type: "text",
        id: "field_label",
        placeholder: "Get in touch",
        required: true,
        errorMessage: "Please enter a label for email tile",
        minLength: 2,
      },
    ]);

    this.formModalService.createModal({
      title: "Add Email Address",
      form,
      onSave: () => this.processFormData(form.getData(), 'Email'),
    });
  }

  // Updated handleWebLinks method
  handleWebLinks() {
    const formModalService = this.formModalService;
    const form = this.formModalService.createForm("web-link-form", [
      {
        label: "Link Url",
        type: "url",
        id: "field_value",
        placeholder: "https://example.com",
        required: true,
        errorMessage: "Please enter a valid URL",
        validate: (value: string) => formModalService.isValidUrl(value),
      },
      {
        label: "Link Label",
        type: "text",
        id: "field_label",
        placeholder: "Example Link",
        required: true,
        errorMessage: "Please enter a label for your link",
        minLength: 5,
      },
    ]);

    this.formModalService.createModal({
      title: "Add Web Link",
      form,
      onSave: () => this.processFormData(form.getData(), 'WebLink'),
    });
  }

  private attachPage(pageData: any, version: any, tileAttributes: any) {
    new PageAttacher().removeOtherEditors();

    new ChildEditor(pageData.PageId, pageData).init(tileAttributes);
  }

  private async processFormData(formData: Record<string, string>, type: string) {
    const selectedComponent = (globalThis as any).selectedComponent;
    if (!selectedComponent) return;

    const tileTitle = selectedComponent.find(".tile-title")[0];
    if (tileTitle) tileTitle.components(formData.field_label);

    const tileId = selectedComponent.parent().getId();
    const rowId = selectedComponent.parent().parent().getId();

    const version = (globalThis as any).activeVersion;
    let objectId = "";
    let childPage: any;
    if (type === "WebLink") {
        childPage = version?.Pages.find(
            (page: any) => page.PageName === "WebLink" && page.PageType === "WebLink"
          );   
        objectId = childPage?.PageId;     
    }
    console.log("childPage", childPage);
    
    const updates = [
      ["Text", formData.field_label],
      ["Name", formData.field_label],
      ["Action.ObjectType", type],
      ["Action.ObjectId", objectId],
      ["Action.ObjectUrl", formData.field_value],
    ];

    for (const [property, value] of updates) {
      (globalThis as any).tileMapper.updateTile(tileId, property, value);
    }
    const tileAttributes = (globalThis as any).tileMapper.getTile(
      rowId,
      tileId
    );

    new PageAttacher().removeOtherEditors();
    if (childPage) new ChildEditor(childPage?.PageId, childPage).init(tileAttributes);
  }
}
