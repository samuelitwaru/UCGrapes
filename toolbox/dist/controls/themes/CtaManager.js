import { ctaTileDEfaultAttributes, DefaultAttributes } from "../../utils/default-attributes";
import { randomIdGenerator } from "../../utils/helpers";
import { ContentMapper } from "../editor/ContentMapper";
import { CtaButtonProperties } from "../editor/CtaButtonProperties";
import { InfoSectionController } from "../InfoSectionController";
import { CtaSvgManager } from "./CtaSvgManager";
import { ThemeManager } from "./ThemeManager";
export class CtaManager {
    constructor() {
        this.editor = globalThis.activeEditor;
        this.pageId = globalThis.currentPageId;
        this.pageData = globalThis.pageData;
        this.contentMapper = new ContentMapper(this.pageId);
        this.themeManager = new ThemeManager();
        this.ctaSvgManager = new CtaSvgManager();
    }
    addCtaButton(ctaButton) {
        const ctaContainer = this.editor.Components.getWrapper().find(".cta-button-container")[0];
        if (!ctaContainer)
            return;
        const buttonId = randomIdGenerator(12);
        const { ctaButtonEl, ctaAction } = this.getIconAndAction(ctaButton, buttonId);
        const ctaMapper = {
            CtaId: buttonId,
            CtaLabel: ctaButton.CallToActionName,
            CtaType: ctaButton.CallToActionType,
            CtaButtonType: "Round",
            CtaBGColor: "CtaColorOne",
            CtaAction: ctaAction
        };
        ctaContainer.append(ctaButtonEl);
        this.contentMapper.addContentCta(ctaMapper);
    }
    checkIfExisting(ctaButtonEl) {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = ctaButtonEl;
        const buttonElement = tempElement.querySelector('[button-type]');
        if (!buttonElement) {
            return false;
        }
        const buttonType = buttonElement.getAttribute('button-type');
        const ctaButtons = this.editor.Components.getWrapper().getEl().querySelectorAll(".cta-button-container [button-type]");
        return Array.from(ctaButtons).some((ctaButton) => {
            return ctaButton.getAttribute("button-type") === buttonType;
        });
    }
    changeCtaColor(color) {
        const selectedComponent = globalThis.selectedComponent;
        if (!selectedComponent)
            return;
        const ctaButton = selectedComponent.find(".cta-styled-btn")[0];
        if (!ctaButton)
            return;
        ctaButton.addStyle({
            "background-color": color.CtaColorCode,
        });
        ctaButton.getEl().style.backgroundColor = color.CtaColorCode;
        const ctaButtonComponent = ctaButton.parent();
        if (this.isInformationPage()) {
            const infoSectionController = new InfoSectionController();
            infoSectionController.updateInfoCtaAttributes(selectedComponent.getId(), 'CtaBGColor', color.CtaColorName);
        }
        else {
            this.contentMapper.updateContentCtaBGColor(ctaButtonComponent.getId(), color.CtaColorName);
        }
    }
    changeToPlainButton() {
        const selectedComponent = this.getSelectedComponent();
        if (!selectedComponent)
            return;
        const ctaButtonAttributes = this.getCtaButtonAttributes(selectedComponent);
        if (!ctaButtonAttributes)
            return;
        const plainButton = this.createPlainButtonHTML(selectedComponent.getId(), ctaButtonAttributes);
        this.selectComponentAfterAdd(selectedComponent.getId(), selectedComponent, plainButton);
        this.updateCtaButtonType(selectedComponent.getId(), 'FullWidth');
        this.updateProperties();
    }
    changeToIconButton() {
        const selectedComponent = this.getSelectedComponent();
        if (!selectedComponent)
            return;
        const ctaButtonAttributes = this.getCtaButtonAttributes(selectedComponent);
        if (!ctaButtonAttributes)
            return;
        const ctaSVG = this.ctaSvgManager.getTypeSVG(ctaButtonAttributes);
        if (!ctaSVG)
            return;
        const iconButton = this.createIconButtonHTML(selectedComponent.getId(), ctaButtonAttributes, ctaSVG);
        this.selectComponentAfterAdd(selectedComponent.getId(), selectedComponent, iconButton);
        this.updateCtaButtonType(selectedComponent.getId(), 'Icon');
        this.updateProperties();
    }
    changeToImgButton() {
        const selectedComponent = this.getSelectedComponent();
        if (!selectedComponent)
            return;
        const ctaButtonAttributes = this.getCtaButtonAttributes(selectedComponent);
        if (!ctaButtonAttributes)
            return;
        const imgButton = this.createImgButtonHTML(selectedComponent.getId(), ctaButtonAttributes);
        this.selectComponentAfterAdd(selectedComponent.getId(), selectedComponent, imgButton);
        this.updateCtaButtonType(selectedComponent.getId(), 'Image');
        if (!this.isInformationPage()) {
            const defaultImagePath = '/Resources/UCGrapes1/src/images/image.png';
            this.contentMapper.updateContentButtonType(ctaButtonAttributes.CtaId, 'Image', defaultImagePath);
        }
        this.updateProperties();
    }
    removeCta(ctaBadge) {
        const ctaBadgeParent = ctaBadge.parentElement;
        if (!(ctaBadgeParent === null || ctaBadgeParent === void 0 ? void 0 : ctaBadgeParent.id))
            return;
        const ctaBadgeParentComponent = this.editor.Components.getWrapper().find("#" + ctaBadgeParent.id)[0];
        if (!ctaBadgeParentComponent)
            return;
        if (this.isInformationPage()) {
            const infoSectionController = new InfoSectionController();
            infoSectionController.deleteCtaButton(ctaBadgeParentComponent.parent().getId());
            return;
        }
        const ctaButtonComponent = ctaBadgeParentComponent.parent();
        if (ctaButtonComponent) {
            ctaButtonComponent.remove();
            this.contentMapper.removeContentCta(ctaButtonComponent.getId());
        }
    }
    getIconAndAction(ctaButton, id) {
        let ctaButtonEl;
        let ctaAction;
        const type = ctaButton === null || ctaButton === void 0 ? void 0 : ctaButton.CallToActionType;
        switch (type) {
            case "Phone":
                ctaButtonEl = this.ctaSvgManager.phoneCta(ctaButton, id);
                ctaAction = ctaButton === null || ctaButton === void 0 ? void 0 : ctaButton.CallToActionPhoneNumber;
                break;
            case "Email":
                ctaButtonEl = this.ctaSvgManager.emailCta(ctaButton, id);
                ctaAction = ctaButton === null || ctaButton === void 0 ? void 0 : ctaButton.CallToActionEmail;
                break;
            case "WebLink":
                ctaButtonEl = this.ctaSvgManager.urlCta(ctaButton, id);
                ctaAction = ctaButton === null || ctaButton === void 0 ? void 0 : ctaButton.CallToActionUrl;
                break;
            case "Form":
                ctaButtonEl = this.ctaSvgManager.formCta(ctaButton, id);
                ctaAction = ctaButton === null || ctaButton === void 0 ? void 0 : ctaButton.CallToActionUrl;
                break;
            default:
                break;
        }
        return { ctaButtonEl, ctaAction };
    }
    // Private helper methods
    getSelectedComponent() {
        return globalThis.selectedComponent;
    }
    isInformationPage() {
        return this.pageData.PageType === "Information";
    }
    getCtaButtonAttributes(selectedComponent) {
        if (this.isInformationPage()) {
            const tileInfoSectionAttributes = globalThis.infoContentMapper.getInfoContent(selectedComponent.getId());
            return tileInfoSectionAttributes === null || tileInfoSectionAttributes === void 0 ? void 0 : tileInfoSectionAttributes.CtaAttributes;
        }
        return this.contentMapper.getContentCta(selectedComponent.getId());
    }
    updateCtaButtonType(componentId, buttonType) {
        console.log('iconButton');
        if (this.isInformationPage()) {
            const infoSectionController = new InfoSectionController();
            infoSectionController.updateInfoCtaAttributes(componentId, 'CtaButtonType', buttonType);
        }
        else {
            this.contentMapper.updateContentButtonType(this.getCtaButtonAttributes(this.getSelectedComponent()).CtaId, buttonType);
        }
    }
    selectComponentAfterAdd(ctaId, selectedComponent, newComponent) {
        this.editor.once("component:add", () => {
            const addedComponent = this.editor
                .getWrapper()
                .find(`#${ctaId}`)[0];
            if (addedComponent) {
                this.editor.select(addedComponent);
            }
        });
        selectedComponent.replaceWith(newComponent);
    }
    updateProperties() {
        const selectedComponent = this.getSelectedComponent();
        const ctaButtonAttributes = this.getCtaButtonAttributes(selectedComponent);
        if (!ctaButtonAttributes || !selectedComponent)
            return;
        const ctaButtonProperties = new CtaButtonProperties(selectedComponent, ctaButtonAttributes);
        ctaButtonProperties.setctaAttributes();
    }
    createPlainButtonHTML(componentId, attributes) {
        const bgColor = this.themeManager.getThemeCtaColor(attributes.CtaBGColor);
        const textColor = attributes.CtaColor || "#ffffff";
        const pageTypeAttribute = this.isInformationPage()
            ? `data-gjs-type="info-cta-section"`
            : `data-gjs-type=cta-buttons`;
        return `
            <div id="${componentId}" 
                button-type="${attributes.CtaType}"
                class="plain-button-container"
                ${pageTypeAttribute}
                ${ctaTileDEfaultAttributes}>
                <button ${DefaultAttributes} class="plain-button cta-styled-btn"
                    style="background-color: ${bgColor}">
                    <div ${DefaultAttributes} id="ihd0f" class="cta-badge">
                            <i ${DefaultAttributes} id="i7o62" data-gjs-type="default" class="fa fa-minus"></i>
                    </div>
                    <span ${DefaultAttributes} class="label" style="color:${textColor}"> ${attributes.CtaLabel}</span> 
                </button>
            </div>
        `;
    }
    createIconButtonHTML(componentId, attributes, ctaSVG) {
        const bgColor = this.themeManager.getThemeCtaColor(attributes.CtaBGColor);
        const textColor = attributes.CtaColor || "#ffffff";
        const pageTypeAttribute = this.isInformationPage()
            ? `data-gjs-type="info-cta-section"`
            : `data-gjs-type=cta-buttons`;
        return `
            <div id="${componentId}" 
                button-type="${attributes.CtaType}"
                ${ctaTileDEfaultAttributes} 
                ${pageTypeAttribute}
                class="img-button-container">
                <div ${DefaultAttributes} class="img-button cta-styled-btn"
                    style="background-color: ${bgColor}">
                    <span ${DefaultAttributes} class="img-button-icon">
                        ${ctaSVG} 
                        <svg class="icon-edit-button" title="Change icon" ${DefaultAttributes} xmlns="http://www.w3.org/2000/svg" id="Component_57_1" data-name="Component 57 – 1" width="20" height="20" viewBox="0 0 33 33">
                            <g ${DefaultAttributes} id="Ellipse_532" data-name="Ellipse 532" fill="#fff" stroke="#5068a8" stroke-width="2">
                                <circle ${DefaultAttributes} cx="16.5" cy="16.5" r="16.5" stroke="none"/>
                                <circle ${DefaultAttributes} cx="16.5" cy="16.5" r="16" fill="none"/>
                            </g>
                            <path ${DefaultAttributes} id="Icon_feather-edit-2" data-name="Icon feather-edit-2" d="M12.834,3.8a1.854,1.854,0,0,1,2.622,2.622L6.606,15.274,3,16.257l.983-3.606Z" transform="translate(7 6.742)" fill="#5068a8" stroke="#5068a8" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                        </svg>
                    </span>
                    <div${DefaultAttributes} class="cta-badge">
                        <i ${DefaultAttributes} class="fa fa-minus"></i>
                    </div>
                    <span ${DefaultAttributes} class="img-button-label label" style="color:${textColor}">${attributes.CtaLabel}</span>
                    <i ${DefaultAttributes} class="fa fa-angle-right img-button-arrow" style="color:${textColor}"></i>
                </div>
            </div>
        `;
    }
    createImgButtonHTML(componentId, attributes) {
        const bgColor = this.themeManager.getThemeCtaColor(attributes.CtaBGColor);
        const textColor = attributes.CtaColor || "#ffffff";
        const pageTypeAttribute = this.isInformationPage()
            ? `data-gjs-type="info-cta-section"`
            : `data-gjs-type=cta-buttons`;
        const imgUrl = attributes.CtaButtonImgUrl || `/Resources/UCGrapes1/src/images/image.png`;
        const editIconSVG = attributes.CtaButtonImgUrl
            ? `<svg ${DefaultAttributes} xmlns="http://www.w3.org/2000/svg" id="Component_57_1" data-name="Component 57 – 1" width="22" height="22" viewBox="0 0 33 33">
                <g ${DefaultAttributes} id="Ellipse_532" data-name="Ellipse 532" fill="#fff" stroke="#5068a8" stroke-width="2">
                    <circle ${DefaultAttributes} cx="16.5" cy="16.5" r="16.5" stroke="none"/>
                    <circle ${DefaultAttributes} cx="16.5" cy="16.5" r="16" fill="none"/>
                </g>
                <path ${DefaultAttributes} id="Icon_feather-edit-2" data-name="Icon feather-edit-2" d="M12.834,3.8a1.854,1.854,0,0,1,2.622,2.622L6.606,15.274,3,16.257l.983-3.606Z" transform="translate(7 6.742)" fill="#5068a8" stroke="#5068a8" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
              </svg>`
            : `<svg ${DefaultAttributes} xmlns="http://www.w3.org/2000/svg" id="Component_53_4" data-name="Component 53 – 4" width="22" height="22" viewBox="0 0 22 22">
                <g ${DefaultAttributes} id="Group_2309" data-name="Group 2309">
                    <g ${DefaultAttributes} id="Group_2307" data-name="Group 2307">
                    <g ${DefaultAttributes} id="Ellipse_6" data-name="Ellipse 6" fill="#fdfdfd" stroke="#5068a8" stroke-width="1">
                        <circle ${DefaultAttributes} cx="11" cy="11" r="11" stroke="none"/>
                        <circle ${DefaultAttributes} cx="11" cy="11" r="10.5" fill="none"/>
                    </g>
                    </g>
                </g>
                <path ${DefaultAttributes} id="Icon_ionic-ios-add" data-name="Icon ionic-ios-add" d="M18.342,13.342H14.587V9.587a.623.623,0,1,0-1.245,0v3.755H9.587a.623.623,0,0,0,0,1.245h3.755v3.755a.623.623,0,1,0,1.245,0V14.587h3.755a.623.623,0,1,0,0-1.245Z" transform="translate(-2.965 -2.965)" fill="#5068a8"/>
              </svg>`;
        return `
            <div id="${componentId}" 
                button-type="${attributes.CtaType}"
                ${ctaTileDEfaultAttributes} 
                ${pageTypeAttribute}
                class="img-button-container">
                <div ${DefaultAttributes} class="img-button cta-styled-btn"
                    style="background-color: ${bgColor}">
                    <span ${DefaultAttributes} class="img-button-section">
                        <img ${DefaultAttributes} src="${imgUrl}" />
                        <span ${DefaultAttributes} class="edit-cta-image">
                            ${editIconSVG}
                        </span>
                    </span>
                    <div${DefaultAttributes} class="cta-badge">
                        <i ${DefaultAttributes} class="fa fa-minus"></i>
                    </div>
                    <span ${DefaultAttributes} class="img-button-label label" style="color:${textColor}">${attributes.CtaLabel}</span>
                    <i ${DefaultAttributes} class="fa fa-angle-right img-button-arrow" style="color:${textColor}"></i>
                </div>
            </div>
        `;
    }
    changeCtaButtonIcon(icon, ctaId, ctaAttributes) {
        if (ctaAttributes && ctaId) {
            if (this.isInformationPage()) {
                const selectedComponent = this.getSelectedComponent();
                if (selectedComponent) {
                    const iconComponent = selectedComponent.find(".img-button-icon")[0];
                    if (iconComponent) {
                        const tempElement = document.createElement('div');
                        tempElement.innerHTML = icon.svg;
                        const newSvgElement = tempElement.querySelector('svg');
                        if (newSvgElement) {
                            newSvgElement.setAttribute('height', '32');
                            newSvgElement.setAttribute('width', '32');
                            const pathElements = newSvgElement.querySelectorAll('path');
                            pathElements.forEach(path => {
                                path.setAttribute('fill', (ctaAttributes === null || ctaAttributes === void 0 ? void 0 : ctaAttributes.CtaColor) || '#fff');
                            });
                            const updatedSvg = tempElement.innerHTML;
                            const svgComponent = iconComponent.find("svg")[0];
                            if (svgComponent) {
                                svgComponent.replaceWith(updatedSvg);
                            }
                            this.updateCtaIconMapper(ctaId, icon);
                        }
                    }
                }
            }
        }
    }
    updateCtaIconMapper(ctaId, icon) {
        if (this.isInformationPage()) {
            const selectedComponent = this.getSelectedComponent();
            if (selectedComponent) {
                const infoSectionController = new InfoSectionController();
                infoSectionController.updateInfoCtaAttributes(ctaId, 'CtaButtonIcon', icon.name);
            }
        }
    }
}
//# sourceMappingURL=CtaManager.js.map