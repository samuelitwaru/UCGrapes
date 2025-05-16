import { ChildEditor } from "../../../../controls/editor/ChildEditor";
import { InfoSectionController } from "../../../../controls/InfoSectionController";
import { AppVersionManager } from "../../../../controls/versions/AppVersionManager";
import { i18n } from "../../../../i18n/i18n";
import { ActionPage } from "../../../../interfaces/ActionPage";
import { CtaAttributes } from "../../../../interfaces/CtaAttributes";
import { InfoType } from "../../../../interfaces/InfoType";
import { baseURL, ToolBoxService } from "../../../../services/ToolBoxService";
import { randomIdGenerator } from "../../../../utils/helpers";
import { InfoSectionUI } from "../../../views/InfoSectionUI";
import { Alert } from "../../Alert";
import { ActionListDropDown } from "./ActionListDropDown";
import { ActionSelectContainer } from "./ActionSelectContainer";
import { FormModalService } from "./FormModalService";
import { PageAttacher } from "./PageAttacher";

export class PageCreationService {
  appVersionManager: any;
  toolBoxService: any;
  formModalService: FormModalService;
  private infoSectionUi: InfoSectionUI;
  private infoSectionController: InfoSectionController;
  isInfoCtaSection: boolean;
  sectionId: string | undefined;

  constructor(isInfoCtaSection: boolean = false, type?: "Email" | "Phone" | "WebLink" | "Map" | "Form", sectionId?: string) {
    this.isInfoCtaSection = isInfoCtaSection;
    this.sectionId = sectionId;
    this.appVersionManager = new AppVersionManager();
    this.toolBoxService = new ToolBoxService();
    this.formModalService = new FormModalService(isInfoCtaSection, type);
    this.infoSectionUi = new InfoSectionUI();
    this.infoSectionController = new InfoSectionController();
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
        label: "Label",
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
      onSave: () => this.processFormData(form.getData(), "Phone"),
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
        label: "Label",
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
      onSave: () => this.processFormData(form.getData(), "Email"),
    });
  }

  // Updated handleForm method
  handleForm() {
    const formModalService = this.formModalService;
    const form = this.formModalService.createForm("form-form", [{
      label: "Form Url",
      type: "url",
      id: "field_value",
      placeholder: "https://example.com",
      required: true,
      hidden: true,
      errorMessage: "Please select a form",
      validate: (value: string) => formModalService.isValidUrl(value),
    },
    {
      label: "Form ID",
      type: "number",
      id: "field_id",
      required: false,
      hidden: true,
      errorMessage: "Please select a form",
      validate: (value: string) => formModalService.isValidUrl(value),
    },
    {
      label: "Label",
      type: "text",
      id: "field_label",
      placeholder: "Fill Form",
      required: true,
      errorMessage: "Please enter a label for your form",
      minLength: 5,
    },]);

    this.formModalService.createModal({
      title: "Add Form",
      form,
      onSave: () => this.processFormData(form.getData(), "Form"),
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
        label: "Label",
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
      onSave: () => this.processFormData(form.getData(), "WebLink"),
    });
  }

  handleAddress() {
    const formModalService = this.formModalService;
    const form = this.formModalService.createForm("address-form", [
      {
        label: "Address",
        type: "text",
        id: "field_value",
        placeholder: "Address",
        required: true,
        errorMessage: "Please enter a Address",
        validate: (value: string) => formModalService.isValidAddress(value),
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

    this.formModalService.createModal({
      title: "Add Address",
      form,
      onSave: () => this.processFormData(form.getData(), "Map"),
    });
  }

  private async processFormData(
    formData: Record<string, string>,
    type: string
  ) {
    if (this.isInfoCtaSection) {
      this.addCtaButtonSection(type, formData);
      return;
    } else {
      const selectedComponent = (globalThis as any).selectedComponent;
      if (!selectedComponent) return;

      const tileTitle = selectedComponent.find(".tile-title")[0];
      if (tileTitle) tileTitle.components(formData.field_label);

      const tileId = selectedComponent.parent().getId();
      const rowId = selectedComponent.parent().parent().getId();

      const version = (globalThis as any).activeVersion;
      let objectId = "";
      // let childPage: any;

      let childPage = version?.Pages.find((page: any) => {
        if (page.PageType == "WebLink") console.log('page', page)
        return page.PageType == "WebLink" && page.PageLinkStructure.Url == formData.field_value
      })
      if (!childPage) {
        const appVersion = await this.appVersionManager.getActiveVersion();
        childPage = await this.toolBoxService.createLinkPage(appVersion.AppVersionId, formData.field_label, formData.field_value, null)
        childPage = childPage.MenuPage
      }

      const updates = [
        ["Text", formData.field_label],
        ["Name", formData.field_label],
        ["Action.ObjectType", type],
        ["Action.ObjectId", childPage.PageId],
        ["Action.ObjectUrl", formData.field_value],
      ];

      let tileAttributes;
      const pageData = (globalThis as any).pageData;
      if (pageData.PageType === "Information") {
        const infoSectionController = new InfoSectionController();
        for (const [property, value] of updates) {
          infoSectionController.updateInfoTileAttributes(
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
        new ChildEditor(childPage?.PageId, childPage).init(tileAttributes);
      }
    }
  }

  async addCtaButtonSection(type: string = "Phone", formData: any = {}) {
    let icon = "Info"
    if (type == "Phone" || type == "Email") {
      icon = type
    }
    else if (type == "WebLink") {
      icon = "Link"
    } else if (type == "Address") {
      icon = "Globe"
    } else if (type == "Form") {
      icon = "Document"
    }

    const cta: CtaAttributes = {
      CtaId: randomIdGenerator(15),
      CtaType: type,
      CtaLabel: formData.field_label || "Call Us",
      CtaAction: formData.field_value,
      CtaColor: "",
      CtaBGColor: "",
      CtaButtonType: "Image",
      CtaButtonImgUrl: "/Resources/UCGrapes1/src/images/image.png",
      CtaButtonIcon: icon,
      CtaSupplierIsConnected: formData.supplier_id ? true : false,
      CtaConnectedSupplierId: formData.supplier_id ? formData.supplier_id : null,
      Action: {
        ObjectId: type === 'Form' ? formData?.field_id : randomIdGenerator(15),
        ObjectType: type === 'Form' ? 'DynamicForm' : type,
        ObjectUrl: formData.field_value
      }
    };

    let childPage: any;
    if (type === "WebLink" || type === "Form") {
      const activeVersion = (globalThis as any).activeVersion;
      const pageType = type === "WebLink" ? "WebLink" : "DynamicForm";
      const url = formData.field_value;

      childPage = activeVersion?.Pages?.find((page: any) =>
        page.PageType === pageType && page.PageLinkStructure?.Url === url
      );

      if (!childPage) {
        const appVersion = await this.appVersionManager.getActiveVersion(); // Await here
        const formId = type === 'Form' ? Number(formData?.field_id) : null;
        try {
          const newChildPage = await this.toolBoxService.createLinkPage(
            appVersion.AppVersionId,
            formData.field_label,
            url,
            formId
          );
          childPage = newChildPage.MenuPage; // Access MenuPage property
        } catch (error) {
          console.error("Error creating link page:", error);
          // Consider throwing the error or handling it appropriately (e.g., showing a message to the user)
          return; // Exit the function if page creation fails.
        }
      }

      if (childPage) {
        console.log(`${type} childPage:`, childPage);
        new ChildEditor(childPage.PageId, childPage).init({});
      }
    }
    console.log('cta.. ', cta)
    const button = this.infoSectionUi.addCtaButton(cta);
    this.infoSectionController.addCtaButton(button, cta, this.sectionId);
  }
}
