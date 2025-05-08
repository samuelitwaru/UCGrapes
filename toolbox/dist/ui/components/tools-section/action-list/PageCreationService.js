var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ChildEditor } from "../../../../controls/editor/ChildEditor";
import { InfoSectionController } from "../../../../controls/InfoSectionController";
import { AppVersionManager } from "../../../../controls/versions/AppVersionManager";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { randomIdGenerator } from "../../../../utils/helpers";
import { InfoSectionUI } from "../../../views/InfoSectionUI";
import { FormModalService } from "./FormModalService";
import { PageAttacher } from "./PageAttacher";
export class PageCreationService {
    constructor(isInfoCtaSection = false, type) {
        this.isInfoCtaSection = isInfoCtaSection;
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
                validate: (value) => formModalService.isValidPhone(value),
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
                validate: (value) => formModalService.isValidEmail(value),
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
                validate: (value) => formModalService.isValidUrl(value),
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
                validate: (value) => formModalService.isValidAddress(value),
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
    processFormData(formData, type) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (this.isInfoCtaSection) {
                this.addCtaButtonSection(type, formData);
                return;
            }
            else {
                const selectedComponent = globalThis.selectedComponent;
                if (!selectedComponent)
                    return;
                const tileTitle = selectedComponent.find(".tile-title")[0];
                if (tileTitle)
                    tileTitle.components(formData.field_label);
                const tileId = selectedComponent.parent().getId();
                const rowId = selectedComponent.parent().parent().getId();
                const version = globalThis.activeVersion;
                let objectId = "";
                let childPage;
                if (type === "WebLink") {
                    childPage = version === null || version === void 0 ? void 0 : version.Pages.find((page) => page.PageName === "Web Link" && page.PageType === "WebLink");
                    objectId = childPage === null || childPage === void 0 ? void 0 : childPage.PageId;
                }
                const updates = [
                    ["Text", formData.field_label],
                    ["Name", formData.field_label],
                    ["Action.ObjectType", type],
                    ["Action.ObjectId", objectId],
                    ["Action.ObjectUrl", formData.field_value],
                ];
                let tileAttributes;
                const pageData = globalThis.pageData;
                if (pageData.PageType === "Information") {
                    const infoSectionController = new InfoSectionController();
                    for (const [property, value] of updates) {
                        infoSectionController.updateInfoTileAttributes(rowId, tileId, property, value);
                    }
                    const tileInfoSectionAttributes = globalThis.infoContentMapper.getInfoContent(rowId);
                    tileAttributes = (_a = tileInfoSectionAttributes === null || tileInfoSectionAttributes === void 0 ? void 0 : tileInfoSectionAttributes.Tiles) === null || _a === void 0 ? void 0 : _a.find((tile) => tile.Id === tileId);
                }
                else {
                    for (const [property, value] of updates) {
                        globalThis.tileMapper.updateTile(tileId, property, value);
                    }
                    tileAttributes = globalThis.tileMapper.getTile(rowId, tileId);
                }
                new PageAttacher().removeOtherEditors();
                if (childPage) {
                    new ChildEditor(childPage === null || childPage === void 0 ? void 0 : childPage.PageId, childPage).init(tileAttributes);
                }
            }
        });
    }
    addCtaButtonSection(type = "Phone", formData = {}) {
        const cta = {
            CtaId: randomIdGenerator(15),
            CtaType: type,
            CtaLabel: formData.field_label || "Call Us",
            CtaAction: formData.field_value,
            CtaColor: "",
            CtaBGColor: "",
            CtaButtonType: "Image",
            CtaButtonImgUrl: "/Resources/UCGrapes1/src/images/image.png",
            CtaSupplierIsConnected: formData.supplier_id ? true : false,
            CtaConnectedSupplierId: formData.supplier_id ? formData.supplier_id : null,
        };
        const button = this.infoSectionUi.addCtaButton(cta);
        this.infoSectionController.addCtaButton(button, cta);
    }
}
//# sourceMappingURL=PageCreationService.js.map