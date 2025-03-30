import { ToolBoxService } from "../../services/ToolBoxService";
import { DefaultAttributes } from "../../utils/default-attributes";
import { imageToBase64 } from "../../utils/helpers";
import { ContentMapper } from "./ContentMapper";

export class ContentDataManager {
    toolBoxService: ToolBoxService;
    editor: any;
    page: any;
    contentMapper: any;

    constructor (editor: any, page: any) {
        this.editor = editor;
        this.page = page;
        this.toolBoxService = new ToolBoxService();
        this.contentMapper = new ContentMapper(this.page.PageId)
    }

    saveContentDescription (contentDescription: string) {
        if (this.page.PageName === "Location") {
            this.saveLocationContent(contentDescription)
        } else if(this.page.PageName === "Reception") {
            this.saveReceptionContent(contentDescription)
        } else {
            this.saveContentPageInfo(contentDescription)
        }
    }

    private async saveContentPageInfo(contentDescription: any) {
        const data = {
            ProductServiceId: this.page.PageId,
            ProductServiceDescription: contentDescription
        }
        const res = await this.toolBoxService.updateDescription(data);
        if (res) {
            const descComponent = this.editor.Components.getWrapper().find("#contentDescription")[0]; 
            if (descComponent) {
                this.updateMapper(descComponent, contentDescription);
            }
        }
    }

    private async saveLocationContent(contentDescription: any) {
        const data = {
          LocationDescription: contentDescription,
          LocationImageBase64: "",
          ReceptionDescription: "",
          ReceptionImageBase64: ""
        }
    
        const res = await this.toolBoxService.updateLocationInfo(data);
        if (res) {
            const descComponent = this.editor.Components.getWrapper().find("#contentDescription")[0]; 
            if (descComponent) {
                this.updateMapper(descComponent, contentDescription);
            }
        }
    }
    
    private async saveReceptionContent(contentDescription: any) {
        const data = {
          LocationDescription: "",
          LocationImageBase64: "",
          ReceptionDescription: contentDescription,
          ReceptionImageBase64: ""
        }
    
        const res = await this.toolBoxService.updateLocationInfo(data);
        if (res) {
            const descComponent = this.editor.Components.getWrapper().find("#contentDescription")[0]; 
            if (descComponent) {
                this.updateMapper(descComponent, contentDescription);
            }
        }
    }

    private updateMapper(descComponent: any, contentDescription: any) {
        const parentComponent = descComponent.parent(); 
        descComponent.replaceWith(`<div ${DefaultAttributes} id="contentDescription">${this.addGrapesAttributes(contentDescription)}</div>`);
        this.contentMapper.updateContentDescription(parentComponent.getId(), contentDescription);
    }

    updateContentImage(safeMediaUrl: string) {
        if (this.page.PageName === "Reception" || this.page.PageName === "Location") {
            this.updateLocationImage(safeMediaUrl);
        } else{
            this.updateServiceContentImage(safeMediaUrl);
        }
    }

    updateCtaButtonImage(safeMediaUrl: string) {
        const ctaContainerId = (globalThis as any).ctaContainerId
        const ctaButtonImgWrapper = this.editor.Components
                  .getWrapper().find(`#${ctaContainerId}`)[0];

              if (ctaButtonImgWrapper) {
                const img = ctaButtonImgWrapper.find("img")[0];
                const icon = ctaButtonImgWrapper.find("svg")[0];
                if (img) {
                    img.setAttributes({
                        src: safeMediaUrl,
                        alt: `cta Image`
                    });
                
                    const editIcon = `
                    <svg ${DefaultAttributes} xmlns="http://www.w3.org/2000/svg" id="Component_57_1" data-name="Component 57 – 1" width="22" height="22" viewBox="0 0 33 33">
                        <g ${DefaultAttributes} id="Ellipse_532" data-name="Ellipse 532" fill="#fff" stroke="#5068a8" stroke-width="2">
                        <circle ${DefaultAttributes} cx="16.5" cy="16.5" r="16.5" stroke="none"/>
                        <circle ${DefaultAttributes} cx="16.5" cy="16.5" r="16" fill="none"/>
                        </g>
                        <path ${DefaultAttributes} id="Icon_feather-edit-2" data-name="Icon feather-edit-2" d="M12.834,3.8a1.854,1.854,0,0,1,2.622,2.622L6.606,15.274,3,16.257l.983-3.606Z" transform="translate(7 6.742)" fill="#5068a8" stroke="#5068a8" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                    </svg>
                    `
                    icon.replaceWith(editIcon);
                    this.contentMapper.updateContentButtonType(ctaContainerId, 'Image', safeMediaUrl);                  
                }
              }
    }

    private async updateServiceContentImage(safeMediaUrl: string) {
        try {
            const base64String = await imageToBase64(safeMediaUrl);
            
            const data = {
                ProductServiceId: this.page.PageId,
                ProductServiceDescription: "",
                ProductServiceImageBase64: base64String
            };
            
            const res = await this.toolBoxService.updateContentImage(data);
            
            if (res) {
              const imageComponent = this.editor.Components
                  .getWrapper().find("#product-service-image")[0];
              if (imageComponent) {
                imageComponent.setAttributes({
                  src: safeMediaUrl,
                  alt: `${this.page.PageName} Image`
                });

                this.contentMapper.updateContentImage(imageComponent.parent().getId(), safeMediaUrl);
              }
            }
          } catch (error) {
            console.error('Error:', error);
          }
    }

    private async updateLocationImage(safeMediaUrl: string) {
        try {
            const base64String = await imageToBase64(safeMediaUrl);
            
            let data;

            if (this.page.PageName === "Location") {
                data = {
                    LocationDescription: "",
                    LocationImageBase64: base64String,
                    ReceptionDescription: "",
                    ReceptionImageBase64: ""
                };
            } else if (this.page.PageName === "Reception") {
                data = {
                    LocationDescription: "",
                    LocationImageBase64: "",
                    ReceptionDescription: "",
                    ReceptionImageBase64: base64String
                };
            }
            
            const res = await this.toolBoxService.updateLocationInfo(data);
            
            if (res) {
              const imageComponent = this.editor.Components
                  .getWrapper().find("#product-service-image")[0];
              if (imageComponent) {
                imageComponent.setAttributes({
                  src: safeMediaUrl,
                  alt: `${this.page.PageName} Image`
                });

                this.contentMapper.updateContentImage(imageComponent.parent().getId(), safeMediaUrl);
              }
            }
          } catch (error) {
            console.error('Error:', error);
          }
    }

    async deleteContentImage() {
        try {
            const data = {
                ProductServiceId: this.page.PageId,
            }
            const res = await this.toolBoxService.deleteContentImage(data);
            if (res) {
                const descImageComponent = this.editor.Components.getWrapper().find("#product-service-image")[0];
                if (descImageComponent) {
                    const parentComponent = descImageComponent.parent();
                    if (parentComponent) {
                        parentComponent.remove();
                    }
                }
            }
        } catch (error) {
            console.error("Error deleting media:", error);
        }
    }

    addGrapesAttributes(descContainerHtml: string) {
        const descContainer = document.createElement("div");
        if (typeof descContainerHtml === "string") {
          descContainer.innerHTML = descContainerHtml;
        }
    
        const allElements = descContainer.querySelectorAll("*");
        allElements.forEach((element) => {
          element.setAttribute("data-gjs-draggable", "false");
          element.setAttribute("data-gjs-selectable", "false");
          element.setAttribute("data-gjs-editable", "false");
          element.setAttribute("data-gjs-highlightable", "false");
          element.setAttribute("data-gjs-droppable", "false");
          element.setAttribute("data-gjs-resizable", "false");
          element.setAttribute("data-gjs-hoverable", "false");
        });
    
        return descContainer.innerHTML;
      }
}