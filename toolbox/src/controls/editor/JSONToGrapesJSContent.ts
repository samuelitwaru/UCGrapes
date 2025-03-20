import {
  contentColumnDefaultAttributes,
  contentDefaultAttributes,
  DefaultAttributes,
  firstTileWrapperDefaultAttributes,
  rowDefaultAttributes,
  tileDefaultAttributes,
  tileWrapperDefaultAttributes,
} from "../../utils/default-attributes";

export class JSONToGrapesJSContent {
  private data: any;

  constructor(json: any) {
    this.data = json;
  }

  private generateCta(cta: any) {
    if (cta.CtaButtonType === "Image") {
      return `<div data-gjs-type="cta-buttons" class="img-button-container">
                <div class="img-button">
                    <span  class="img-button-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="30" viewBox="0 0 13 16">
                            <path id="Path_1209" data-gjs-type="svg-in" data-name="Path 1209" d="M9.828,4A1.823,1.823,0,0,0,8,5.8V18.2A1.823,1.823,0,0,0,9.828,20h9.344A1.823,1.823,0,0,0,21,18.2V9.8a.6.6,0,0,0-.179-.424l-.006-.006L15.54,4.176A.614.614,0,0,0,15.109,4Zm0,1.2H14.5V8.6a1.823,1.823,0,0,0,1.828,1.8h3.453v7.8a.6.6,0,0,1-.609.6H9.828a.6.6,0,0,1-.609-.6V5.8A.6.6,0,0,1,9.828,5.2Zm5.891.848L18.92,9.2H16.328a.6.6,0,0,1-.609-.6Z" transform="translate(-8 -4)" fill="#fff"></path>
                        </svg>
                    </div>
                    <div class="cta-badge"><i id="ihup9" class="fa fa-minus"></i></div>
                    <span class="img-button-label">Form</span>
                    <i id="imtnq" data-gjs-type="default" class="fa fa-angle-right img-button-arrow"></i>
                </div>
            </div>`;
    } else if (cta.CtaButtonType === "FullWidth") {
      return `
            <div
                data-gjs-type="cta-buttons"
                cta-background-color="#c4a082"
                class="plain-button-container gjs-selected"
            >
                <button id="ibob6" data-gjs-type="default" class="plain-button">
                    <div id="iyocy" data-gjs-type="default" class="cta-badge">
                        <i id="ifxn6" data-gjs-type="default" class="fa fa-minus"></i>
                    </div>
                    Form
                </button>
            </div>
            `;
    } else if (cta.CtaButtonType === "Icon") {
    } else if (cta.CtaButtonType === "Round") {
      return `
            <div ${tileDefaultAttributes} data-gjs-type="cta-buttons" cta-button-label="Email" cta-button-type="Email" cta-button-action="info@rotterdam.com" cta-background-color="#b2b997" class="cta-container-child cta-child">
                <div class="cta-button" ${DefaultAttributes}>
                    <svg ${DefaultAttributes} id="isqih" data-gjs-type="svg" xmlns="http://www.w3.org/2000/svg" width="32" height="28" viewBox="0 0 41 32.8">
                        <path ${DefaultAttributes} id="Path_1218-2" data-gjs-type="svg-in" data-name="Path 1218" d="M6.1,4A4.068,4.068,0,0,0,2.789,5.7a1.5,1.5,0,0,0,.444,2.126l18,11.219a2.387,2.387,0,0,0,2.531,0L41.691,7.732a1.5,1.5,0,0,0,.384-2.2A4.063,4.063,0,0,0,38.9,4Zm35.907,8.376a.963.963,0,0,0-.508.152L23.765,23.711a2.392,2.392,0,0,1-2.531,0L3.5,12.656a.98.98,0,0,0-1.5.833V32.7a4.1,4.1,0,0,0,4.1,4.1H38.9A4.1,4.1,0,0,0,43,32.7V13.357A.981.981,0,0,0,42.007,12.376Z" transform="translate(-2 -4)" fill="#fff"></path>
                    </svg>
                    <div class="cta-badge" ${DefaultAttributes}><i ${DefaultAttributes} data-gjs-type="default" class="fa fa-minus"></i></div>
                </div>
                <div class="cta-label" ${DefaultAttributes}>Email</div>
            </div>
            `;
    }
  }

  private generateContent(content: any): any {
    if (content.ContentType === "Image" && content.ContentValue !== "") {
      return `
            <img ${contentDefaultAttributes} id="${content?.ContentId}" data-gjs-type="product-service-image" draggable="true" src="${content?.ContentValue}" alt="Product Service Image" class="content-page-block">
            `;
    } else if (
      content.ContentType === "Description" &&
      content.ContentValue !== ""
    ) {
      return `
            <div ${contentDefaultAttributes} id="${content?.ContentId}" data-gjs-type="product-service-description" draggable="true" class="content-page-block">
                ${this.addGrapesAttributes(content?.ContentValue)}
            </div>
            `;
    } else {
      return "";
    }
  }

  public generateHTML(): any {
    let contentHtml = "";
    let ctaHtml = "";

    if (
      this.data?.PageContentStructure?.Content &&
      Array.isArray(this.data.PageContentStructure.Content)
    ) {
      contentHtml = this.data.PageContentStructure.Content.map((content: any) =>
        this.generateContent(content)
      ).join("");
    }

    if (
      this.data?.PageContentStructure?.Cta &&
      Array.isArray(this.data.PageContentStructure.Cta)
    ) {
      ctaHtml = this.data.PageContentStructure.Cta.map((cta: any) =>
        this.generateCta(cta)
      ).join("");
    }

    const htmlData = `
            <div ${DefaultAttributes} id="frame-container" data-gjs-type="template-wrapper" class="content-frame-container">
                <div ${DefaultAttributes} class="container-column">
                    <div ${DefaultAttributes} class="container-row">
                        <div ${DefaultAttributes} data-gjs-type="default" class="template-wrapper">
                            <div ${contentColumnDefaultAttributes} data-gjs-type="default" class="content-page-wrapper">
                                ${contentHtml}
                            </div>
                        </div>
                    </div> 
                    ${
                      ctaHtml
                        ? `
                      <div ${rowDefaultAttributes} class="cta-button-container" style="gap: 0.2rem;">
                          ${ctaHtml}
                      </div>`
                        : `
                      <div ${rowDefaultAttributes} class="cta-button-container" style="gap: 0.2rem;">
                          
                      </div>`
                    }         
                </div>
            </div>
        `;

    return htmlData;
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
