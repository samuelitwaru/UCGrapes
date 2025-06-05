import { ChildEditor } from "../../../../controls/editor/ChildEditor";
import { InfoSectionManager } from "../../../../controls/InfoSectionManager";
import { AppVersionManager } from "../../../../controls/versions/AppVersionManager";
import { i18n } from "../../../../i18n/i18n";
import { baseURL, ToolBoxService } from "../../../../services/ToolBoxService";
import { CtaAttributes, InfoType } from "../../../../types";
import { randomIdGenerator } from "../../../../utils/helpers";
import { InfoSectionUI } from "../../../views/InfoSectionUI";
import { Alert } from "../../Alert";
import { ActionListDropDown } from "./ActionListDropDown";
import { ActionSelectContainer } from "./ActionSelectContainer";
import { FormModalService } from "./FormModalService";
import { PageAttacher } from "./PageAttacher";

type ActionType = "Email" | "Phone" | "WebLink" | "Map" | "Form";

export class PageCreationService {
  private appVersionManager: AppVersionManager;
  private toolBoxService: ToolBoxService;
  formModalService: FormModalService;
  private infoSectionUi: InfoSectionUI;
  private InfoSectionManager: InfoSectionManager;
  isInfoCtaSection: boolean;
  sectionId?: string;

  constructor(isInfoCtaSection = false, type?: ActionType, sectionId?: string) {
    this.isInfoCtaSection = isInfoCtaSection;
    this.sectionId = sectionId;
    this.appVersionManager = new AppVersionManager();
    this.toolBoxService = new ToolBoxService();
    this.formModalService = new FormModalService(isInfoCtaSection, type);
    this.infoSectionUi = new InfoSectionUI();
    this.InfoSectionManager = new InfoSectionManager();
  }

  handlePhone() {
    this.createFormAndModal("phone-form", "Add Phone Number", "Phone", [
      {
        label: "Phone Number",
        type: "tel",
        id: "field_value",
        placeholder: "123-456-7890",
        required: true,
        errorMessage: "Please enter a valid phone number",
        validate: (value: string) => this.formModalService.isValidPhone(value),
      },
      {
        label: "Label",
        type: "text",
        id: "field_label",
        placeholder: "Call us now",
        required: true,
        errorMessage: "Please enter a label for your phone tile",
        minLength: 2,
      },
    ]);
  }

  handleEmail() {
    this.createFormAndModal("email-form", "Add Email Address", "Email", [
      {
        label: "Email Address",
        type: "email",
        id: "field_value",
        placeholder: "example@example.com",
        required: true,
        errorMessage: "Please enter a valid email address",
        validate: (value: string) => this.formModalService.isValidEmail(value),
      },
      {
        label: "Label",
        type: "text",
        id: "field_label",
        placeholder: "Get in touch",
        required: true,
        errorMessage: "Please enter a label for email tile",
        minLength: 2,
      },
    ]);
  }

  handleForm() {
    this.createFormAndModal("form-form", "Add Form", "Form", [
      {
        label: "Form Url",
        type: "url",
        id: "field_value",
        placeholder: "https://example.com",
        required: true,
        hidden: true,
        errorMessage: "Please select a form",
        validate: (value: string) => this.formModalService.isValidUrl(value),
      },
      {
        label: "Form ID",
        type: "number",
        id: "field_id",
        required: false,
        hidden: true,
        errorMessage: "Please select a form",
        validate: (value: string) => this.formModalService.isValidUrl(value),
      },
      {
        label: "Label",
        type: "text",
        id: "field_label",
        placeholder: "Fill Form",
        required: true,
        errorMessage: "Please enter a label for your form",
        minLength: 5,
      },
    ]);
  }

  handleWebLinks() {    
    this.createFormAndModal("web-link-form", "Add Web Link", "WebLink", [
      {
        label: "Link Url",
        type: "url",
        id: "field_value",
        placeholder: "https://example.com",
        required: true,
        errorMessage: "Please enter a valid URL",
        validate: (value: string) => this.formModalService.isValidUrl(value),
      },
      {
        label: "Label",
        type: "text",
        id: "field_label",
        placeholder: "Example Link",
        required: true,
        errorMessage: "Please enter a label for your link",
        minLength: 5,
      },
    ]);
  }

  handleAddress() {
    this.createFormAndModal("address-form", "Add Address", "Map", [
      {
        label: "Address",
        type: "text",
        id: "field_value",
        placeholder: "Address",
        required: true,
        errorMessage: "Please enter a Address",
        validate: (value: string) =>
          this.formModalService.isValidAddress(value),
      },
      {
        label: "Label",
        type: "text",
        id: "field_label",
        placeholder: "Visit us",
        required: true,
        errorMessage: "Please enter a label for your address",
        minLength: 5,
      },
    ]);
  }

  private createFormAndModal(
    formId: string,
    title: string,
    type: string,
    fields: any[]
  ) {
    const form = this.formModalService.createForm(formId, fields);
    this.formModalService.createModal({
      title,
      form,
      onSave: () => this.processFormData(form.getData(), type),
    });
  }

  private async processFormData(
    formData: Record<string, string>,
    type: string
  ) {
    if (this.isInfoCtaSection) {
      this.addCtaButtonSection(type, formData);
      return;
    }
    const selectedComponent = (globalThis as any).selectedComponent;
    if (!selectedComponent) return;

    const tileTitle = selectedComponent.find(".tile-title")[0];
    if (tileTitle) tileTitle.components(formData.field_label);

    const tileId = selectedComponent.parent().getId();
    const rowId = selectedComponent.parent().parent().getId();

    // Find or create child page
    let childPage;
    if (type === "WebLink" || type === "Form") {
      childPage = await this.findOrCreateChildPage(type, formData);
    }

    const updates = [
      ["Text", formData.field_label],
      ["Name", formData.field_label],
      ["Action.ObjectType", type],
      ["Action.ObjectId", childPage?.PageId || randomIdGenerator(10)],
      ["Action.ObjectUrl", formData.field_value],
    ];

    const pageData = (globalThis as any).pageData;
    let tileAttributes;

    if (pageData.PageType === "Information") {
      for (const [property, value] of updates) {
        this.InfoSectionManager.updateInfoTileAttributes(
          rowId,
          tileId,
          property,
          value
        );
      }

      const tileInfoSectionAttributes: InfoType = (
        globalThis as any
      ).infoContentMapper.getInfoContent(rowId);
      tileAttributes = tileInfoSectionAttributes?.Tiles?.find(
        (tile: any) => tile.Id === tileId
      );
    } else {
      for (const [property, value] of updates) {
        (globalThis as any).tileMapper.updateTile(tileId, property, value);
      }
      tileAttributes = (globalThis as any).tileMapper.getTile(rowId, tileId);
    }
    
    new PageAttacher().removeOtherEditors();
    if (childPage) {
      new ChildEditor(childPage.PageId, childPage).init(tileAttributes);
    }
  }

  private async findOrCreateChildPage(
    type: string,
    formData: Record<string, string>
  ) {
    const version = (globalThis as any).activeVersion;
    let childPage = version?.Pages.find((page: any) => {
      if (type === "WebLink") {
        return (
          page.PageType === "WebLink" &&
          page.PageLinkStructure.Url === formData.field_value
        );
      }
      return false;
    });

    if (!childPage) {
      try {
        const appVersion = await this.appVersionManager.getActiveVersion();
        const formId = type === "Form" ? Number(formData?.field_id) : 0;
        const response = await this.toolBoxService.createLinkPage(
          appVersion.AppVersionId,
          formData.field_label,
          formData.field_value,
          formId
        );
        childPage = response.MenuPage;
      } catch (error) {
        console.error("Error creating link page:", error);
        return null;
      }
    }

    return childPage;
  }

  async addCtaButtonSection(type: string = "Phone", formData: any = {}) {
    const iconMap: Record<string, string> = {
      Phone: "Phone",
      Email: "Email",
      WebLink: "Link",
      Map: "Globe",
      Form: "Document",
      Address: "Globe",
    };

    const icon = iconMap[type] || "Info";

    const cta: CtaAttributes = {
      CtaId: randomIdGenerator(15),
      CtaType: type,
      CtaLabel: formData.field_label || "Call Us",
      CtaAction: formData.field_value,
      CtaColor: "#ffffff",
      CtaBGColor: "ctaColor1",
      CtaButtonType: "Image",
      CtaButtonImgUrl: "/Resources/UCGrapes/public/images/image.png",
      CtaButtonIcon: icon,
      CtaSupplierIsConnected: Boolean(formData.supplier_id),
      CtaConnectedSupplierId: formData.supplier_id || null,
      Action: {
        ObjectId: type === "Form" ? formData?.field_id : randomIdGenerator(2),
        ObjectType: type === "Form" ? "DynamicForm" : type,
        ObjectUrl: formData.field_value,
      },
    };

    let childPage;
    // if (type === "WebLink" || type === "Form") {
    //   childPage = await this.findOrCreateChildPage(type, formData);
    //   if (childPage) {
    //     new ChildEditor(childPage.PageId, childPage).init({});
    //   }
    // }
    const button = this.infoSectionUi.addCtaButton(cta);
    this.InfoSectionManager.addCtaButton(button, cta, this.sectionId);
  }
}
