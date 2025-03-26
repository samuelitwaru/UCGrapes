import { CallToAction } from "../../interfaces/CallToAction";
import { ThemeCtaColor } from "../../models/Theme";
import { ctaTileDEfaultAttributes, DefaultAttributes, tileDefaultAttributes } from "../../utils/default-attributes";
import { randomIdGenerator } from "../../utils/helpers";
import { ContentMapper } from "../editor/ContentMapper";
import { CtaSvgManager } from "./CtaSvgManager";
import { ThemeManager } from "./ThemeManager";

export class CtaManager {
    editor: any;
    contentMapper: any;
    themeManager: any;
    ctaSvgManager: any;

    constructor() {
        this.editor = (globalThis as any).activeEditor;
        const pageId = (globalThis as any).currentPageId;
        this.contentMapper = new ContentMapper(pageId);
        this.themeManager = new ThemeManager();
        this.ctaSvgManager = new CtaSvgManager();
    }

    addCtaButton(ctaButton: CallToAction) {

        const ctaContainer = this.editor.Components.getWrapper().find(".cta-button-container")[0];
        if (ctaContainer) {
            
            const buttonId = randomIdGenerator(12);
            const {ctaButtonEl, ctaAction} = this.getIconAndAction(ctaButton, buttonId);

            const ctaMapper = {
                CtaId: buttonId,
                CtaLabel: ctaButton.CallToActionName,
                CtaType: ctaButton.CallToActionType,
                CtaButtonType: "Round",
                CtaBGColor: "CtaColorOne",
                CtaAction: ctaAction
            }
            
            if (this.checkIfExisting(ctaButtonEl)) {
                const selectedComponent = (globalThis as any).selectedComponent
                if (selectedComponent && selectedComponent.parent().getClasses().includes("cta-button-container")) {
                    this.contentMapper.removeContentCta(selectedComponent.getId());
                    selectedComponent.replaceWith(ctaButtonEl);
                    this.contentMapper.addContentCta(ctaMapper);
                }
                return;
            };
            
            ctaContainer.append(ctaButtonEl);
            
            this.contentMapper.addContentCta(ctaMapper);
        }
    }

    checkIfExisting(ctaButtonEl: any): boolean {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = ctaButtonEl;
        const buttonElement = tempElement.querySelector('[button-type]');
        
        if (!buttonElement) {
            return false;
        }
        
        const buttonType = buttonElement.getAttribute('button-type');
        const ctaButtons = this.editor.Components.getWrapper().getEl().querySelectorAll(".cta-button-container [button-type]");
        
        return Array.from(ctaButtons).some((ctaButton: any) => {
            return ctaButton.getAttribute("button-type") === buttonType;
        });
    }

    changeCtaColor(color: any) {
        const selectedComponent = (globalThis as any).selectedComponent
        if (!selectedComponent) return;

        const ctaButton = selectedComponent.find(".cta-styled-btn")[0];
        if (ctaButton) {
            ctaButton.addStyle({
                "background-color": color.CtaColorCode,
            });

            ctaButton.getEl().style.backgroundColor = color.CtaColorCode;

            const ctaButtonComponent = ctaButton.parent();
            this.contentMapper.updateContentCtaBGColor(ctaButtonComponent.getId(), color.CtaColorName);
        }
    }

    changeToPlainButton () {
        const selectedComponent = (globalThis as any).selectedComponent;
        if (!selectedComponent) return;
        const ctaButtonAttributes = this.contentMapper.getContentCta(selectedComponent.getId());
        if (ctaButtonAttributes && selectedComponent) {
            const plainButton = `
                <div id="${ctaButtonAttributes.CtaId}" 
                    button-type="${ctaButtonAttributes.CtaType}"
                    class="plain-button-container"
                     ${ctaTileDEfaultAttributes}>
                    <button ${DefaultAttributes} class="plain-button cta-styled-btn"
                        style="background-color: ${this.themeManager.getThemeCtaColor(ctaButtonAttributes.CtaBGColor)}">
                        <div ${DefaultAttributes} id="ihd0f" class="cta-badge">
                                <i ${DefaultAttributes} id="i7o62" data-gjs-type="default" class="fa fa-minus"></i>
                        </div> ${ctaButtonAttributes.CtaLabel} 
                    </button>
                </div>
            `;

            this.selectComponentAfterAdd(ctaButtonAttributes.CtaId, selectedComponent, plainButton);
            this.contentMapper.updateContentButtonType(ctaButtonAttributes.CtaId, 'FullWidth');
        }
    }

    changeToIconButton () {
        const selectedComponent = (globalThis as any).selectedComponent;
        if (!selectedComponent) return;
        const ctaButtonAttributes = this.contentMapper.getContentCta(selectedComponent.getId());

        const ctaSVG = this.ctaSvgManager.getTypeSVG(ctaButtonAttributes?.CtaType);
        
        if (ctaButtonAttributes && selectedComponent) {
            const iconButton = `
                <div id="${ctaButtonAttributes.CtaId}" 
                    button-type="${ctaButtonAttributes.CtaType}"
                    ${ctaTileDEfaultAttributes} 
                    data-gjs-type="cta-buttons" 
                    class="img-button-container">
                    <div ${DefaultAttributes} class="img-button cta-styled-btn"
                        style="background-color: ${this.themeManager.getThemeCtaColor(ctaButtonAttributes.CtaBGColor)}">
                        <span ${DefaultAttributes} class="img-button-icon">
                            ${ctaSVG} 
                        </span>
                        <div${DefaultAttributes} class="cta-badge">
                            <i ${DefaultAttributes} class="fa fa-minus"></i>
                        </div>
                        <span ${DefaultAttributes} class="img-button-label">${ctaButtonAttributes.CtaLabel}</span>
                        <i ${DefaultAttributes} class="fa fa-angle-right img-button-arrow"></i>
                    </div>
                </div>
            `;

            this.selectComponentAfterAdd(ctaButtonAttributes.CtaId, selectedComponent, iconButton);
            this.contentMapper.updateContentButtonType(ctaButtonAttributes.CtaId, 'Icon');
        }
    }

    changeToImgButton () {
        const selectedComponent = (globalThis as any).selectedComponent;
        if (!selectedComponent) return;
        const ctaButtonAttributes = this.contentMapper.getContentCta(selectedComponent.getId());
        
        if (ctaButtonAttributes && selectedComponent) {
            const imgButton = `
                <div id="${ctaButtonAttributes.CtaId}" 
                    button-type="${ctaButtonAttributes.CtaType}"
                    ${ctaTileDEfaultAttributes} 
                    data-gjs-type="cta-buttons" 
                    class="img-button-container">
                    <div ${DefaultAttributes} class="img-button cta-styled-btn"
                        style="background-color: ${this.themeManager.getThemeCtaColor(ctaButtonAttributes.CtaBGColor)}">
                        <span ${DefaultAttributes} class="img-button-section">
                            <img ${DefaultAttributes} 
                                src="${ctaButtonAttributes.CtaButtonImgUrl ? ctaButtonAttributes.CtaButtonImgUrl 
                                    : `/Resources/UCGrapes1/src/images/image.png`}" 
                            />
                            <span ${DefaultAttributes} class="edit-cta-image">
                                ${ctaButtonAttributes.CtaButtonImgUrl ? `
                                  <svg ${DefaultAttributes} xmlns="http://www.w3.org/2000/svg" id="Component_57_1" data-name="Component 57 – 1" width="22" height="22" viewBox="0 0 33 33">
                                        <g ${DefaultAttributes} id="Ellipse_532" data-name="Ellipse 532" fill="#fff" stroke="#5068a8" stroke-width="2">
                                            <circle ${DefaultAttributes} cx="16.5" cy="16.5" r="16.5" stroke="none"/>
                                            <circle ${DefaultAttributes} cx="16.5" cy="16.5" r="16" fill="none"/>
                                        </g>
                                        <path ${DefaultAttributes} id="Icon_feather-edit-2" data-name="Icon feather-edit-2" d="M12.834,3.8a1.854,1.854,0,0,1,2.622,2.622L6.606,15.274,3,16.257l.983-3.606Z" transform="translate(7 6.742)" fill="#5068a8" stroke="#5068a8" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                    </svg>
                                    ` : `
                                    <svg ${DefaultAttributes} xmlns="http://www.w3.org/2000/svg" id="Component_53_4" data-name="Component 53 – 4" width="22" height="22" viewBox="0 0 22 22">
                                        <g ${DefaultAttributes} id="Group_2309" data-name="Group 2309">
                                            <g ${DefaultAttributes} id="Group_2307" data-name="Group 2307">
                                            <g ${DefaultAttributes} id="Ellipse_6" data-name="Ellipse 6" fill="#fdfdfd" stroke="#5068a8" stroke-width="1">
                                                <circle ${DefaultAttributes} cx="11" cy="11" r="11" stroke="none"/>
                                                <circle ${DefaultAttributes} cx="11" cy="11" r="10.5" fill="none"/>
                                            </g>
                                            </g>
                                        </g>
                                        <path ${DefaultAttributes} id="Icon_ionic-ios-add" data-name="Icon ionic-ios-add" d="M18.342,13.342H14.587V9.587a.623.623,0,1,0-1.245,0v3.755H9.587a.623.623,0,0,0,0,1.245h3.755v3.755a.623.623,0,1,0,1.245,0V14.587h3.755a.623.623,0,1,0,0-1.245Z" transform="translate(-2.965 -2.965)" fill="#5068a8"/>
                                    </svg>
                                `}
                            </span>
                        </span>
                        <div${DefaultAttributes} class="cta-badge">
                            <i ${DefaultAttributes} class="fa fa-minus"></i>
                        </div>
                        <span ${DefaultAttributes} class="img-button-label">${ctaButtonAttributes.CtaLabel}</span>
                        <i ${DefaultAttributes} class="fa fa-angle-right img-button-arrow"></i>
                    </div>
                </div>
            `;

            this.selectComponentAfterAdd(ctaButtonAttributes.CtaId, selectedComponent, imgButton);
            this.contentMapper.updateContentButtonType(ctaButtonAttributes.CtaId, 'Image', '/Resources/UCGrapes1/src/images/image.png');
        }
    }

    private selectComponentAfterAdd(ctaId: string, selectedComponent: any, newComponent: any) {
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

    removeCta(ctaBadge: HTMLElement) {
        const ctaBadgeParent = ctaBadge.parentElement;
        const ctaBadgeParentComponent = this.editor.Components.getWrapper().find(
            "#" + ctaBadgeParent?.id
        )[0];
        if (ctaBadgeParentComponent) {
            const ctaButtonComponent = ctaBadgeParentComponent.parent();
            ctaButtonComponent?.remove();

            this.contentMapper.removeContentCta(ctaButtonComponent.getId());
        }
    }
    
    getIconAndAction(ctaButton: any, id: string) {
        let ctaButtonEl;
        let ctaAction;
        const type = ctaButton?.CallToActionType;
        switch (type) {
            case "Phone":
                ctaButtonEl = this.ctaSvgManager.phoneCta(ctaButton, id);
                ctaAction = ctaButton?.CallToActionPhoneNumber
                break;
            case "Email":
                ctaButtonEl = this.ctaSvgManager.emailCta(ctaButton, id);
                ctaAction  = ctaButton?.CallToActionEmail
                break;
            case "SiteUrl":
                ctaButtonEl = this.ctaSvgManager.urlCta(ctaButton, id);
                ctaAction = ctaButton?.CallToActionUrl
                break;
            case "Form":
                ctaButtonEl = this.ctaSvgManager.formCta(ctaButton, id);
                ctaAction = ctaButton?.CallToActionUrl
                break;
            default:
                break;
        } 
        return {ctaButtonEl, ctaAction}
    }

}