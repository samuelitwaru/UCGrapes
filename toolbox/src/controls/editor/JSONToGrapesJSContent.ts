import { CallToAction } from "../../interfaces/CallToAction";
import {
  contentColumnDefaultAttributes,
  contentDefaultAttributes,
  ctaTileDEfaultAttributes,
  DefaultAttributes,
  firstTileWrapperDefaultAttributes,
  rowDefaultAttributes,
  tileDefaultAttributes,
  tileWrapperDefaultAttributes,
  ctaContainerDefaultAttributes,
} from "../../utils/default-attributes";
import { ThemeManager } from "../themes/ThemeManager";

export class JSONToGrapesJSContent {
  private data: any;
  themeManager: any;

  constructor(json: any) {
    this.data = json;
    this.themeManager = new ThemeManager();
  }

  private generateCta(cta: any) {
    if (cta.CtaButtonType === "Image") {
      return `<div id="${cta.CtaId}" data-gjs-type="cta-buttons"
                ${ctaTileDEfaultAttributes} 
                  button-type="${cta.CtaType}"
                  class="img-button-container">
                    <div ${DefaultAttributes} class="img-button cta-styled-btn"
                        style="background-color: ${this.themeManager.getThemeCtaColor(cta.CtaBGColor)}">
                        <span ${DefaultAttributes} class="img-button-section">
                            <img ${DefaultAttributes} src="${cta.CtaButtonImgUrl}" />
                            <span ${DefaultAttributes} class="edit-cta-image">
                                ${cta.CtaButtonImgUrl ? `
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
                        <span ${DefaultAttributes} class="img-button-label">${cta.CtaLabel}</span>
                        <i ${DefaultAttributes} class="fa fa-angle-right img-button-arrow"></i>
                    </div>
                </div>`;
    } else if (cta.CtaButtonType === "FullWidth") {
      return `
            <div
                id="${cta.CtaId}"
                ${ctaTileDEfaultAttributes} 
                data-gjs-type="cta-buttons"
                button-type="${cta.CtaType}"
                class="plain-button-container"
            >
                <button ${DefaultAttributes} id="ibob6" data-gjs-type="default" class="plain-button cta-styled-btn"
                  style="background-color: ${this.themeManager.getThemeCtaColor(cta.CtaBGColor)}">
                    <div ${DefaultAttributes} id="iyocy" data-gjs-type="default" class="cta-badge">
                        <i ${DefaultAttributes} id="ifxn6" data-gjs-type="default" class="fa fa-minus"></i>
                    </div>
                    Form
                </button>
            </div>
            `;
    } else if (cta.CtaButtonType === "Icon") {
      return `
          <div id="${cta.CtaId}" data-gjs-type="cta-buttons"
            ${ctaTileDEfaultAttributes} 
              button-type="${cta.CtaType}"
              class="img-button-container">
                <div ${DefaultAttributes} class="img-button cta-styled-btn"
                    style="background-color: ${this.themeManager.getThemeCtaColor(cta.CtaBGColor)}">
                    <span ${DefaultAttributes} class="img-button-icon">
                      ${this.ctaIcon(cta)}
                    </span>
                    <div${DefaultAttributes} class="cta-badge">
                        <i ${DefaultAttributes} class="fa fa-minus"></i>
                    </div>
                    <span ${DefaultAttributes} class="img-button-label">${cta.CtaLabel}</span>
                    <i ${DefaultAttributes} class="fa fa-angle-right img-button-arrow"></i>
                </div>
            </div>
      `;
    } else if (cta.CtaButtonType === "Round") {
      return `
            <div ${ctaTileDEfaultAttributes} 
              data-gjs-type="cta-buttons" 
              button-type="${cta.CtaType}" 
              class="cta-container-child cta-child"
              id="${cta.CtaId}">              
                <div class="cta-button cta-styled-btn" ${DefaultAttributes}
                  style="background-color: ${this.themeManager.getThemeCtaColor(cta.CtaBGColor)}">
                    ${this.ctaIcon(cta)}
                    <div class="cta-badge" ${DefaultAttributes}><i ${DefaultAttributes} data-gjs-type="default" class="fa fa-minus"></i></div>
                </div>
                <div class="cta-label" ${DefaultAttributes}>${cta.CtaLabel}</div>
            </div>
            `;
    }
  }
  
  ctaIcon(cta: any) {
    let icon;
    switch (cta.CtaType) {
      case "Phone":
        icon = `
        <svg ${DefaultAttributes} id="ixdtl" data-gjs-type="svg" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                    viewBox="0 0 49.417 49.418">
            <path ${DefaultAttributes} id="call" data-gjs-type="svg-in"
                d="M29.782,3a2.149,2.149,0,1,0,0,4.3A19.3,19.3,0,0,1,49.119,26.634a2.149,2.149,0,1,0,4.3,0A23.667,23.667,0,0,0,29.782,3ZM12.032,7.305a2.548,2.548,0,0,0-.818.067,8.342,8.342,0,0,0-3.9,2.342C2.775,14.254.366,21.907,17.437,38.98S42.16,53.643,46.7,49.1a8.348,8.348,0,0,0,2.346-3.907,2.524,2.524,0,0,0-1.179-2.786c-2.424-1.418-7.654-4.484-10.08-5.9a2.523,2.523,0,0,0-2.568.012l-4.012,2.392a2.517,2.517,0,0,1-2.845-.168,65.811,65.811,0,0,1-5.711-4.981,65.07,65.07,0,0,1-4.981-5.711A2.512,2.512,0,0,1,17.5,25.2L19.9,21.191a2.533,2.533,0,0,0,.008-2.577L14.012,8.556A2.543,2.543,0,0,0,12.032,7.305Zm17.751,4.289a2.149,2.149,0,1,0,0,4.3A10.709,10.709,0,0,1,40.525,26.634a2.149,2.149,0,1,0,4.3,0A15.072,15.072,0,0,0,29.782,11.594Zm0,8.594a2.149,2.149,0,1,0,0,4.3,2.114,2.114,0,0,1,2.149,2.148,2.149,2.149,0,1,0,4.3,0A6.479,6.479,0,0,0,29.782,20.188Z"
                transform="translate(-4 -3)" fill="#fff"></path>
        </svg>
        `;
        break;
      case "Email":
        icon = `
        <svg ${DefaultAttributes} id="inavf" data-gjs-type="svg" xmlns="http://www.w3.org/2000/svg" width="32"
            height="28" viewBox="0 0 41 32.8">
            <path ${DefaultAttributes} id="Path_1218" data-gjs-type="svg-in" data-name="Path 1218"
                d="M6.1,4A4.068,4.068,0,0,0,2.789,5.7a1.5,1.5,0,0,0,.444,2.126l18,11.219a2.387,2.387,0,0,0,2.531,0L41.691,7.732a1.5,1.5,0,0,0,.384-2.2A4.063,4.063,0,0,0,38.9,4Zm35.907,8.376a.963.963,0,0,0-.508.152L23.765,23.711a2.392,2.392,0,0,1-2.531,0L3.5,12.656a.98.98,0,0,0-1.5.833V32.7a4.1,4.1,0,0,0,4.1,4.1H38.9A4.1,4.1,0,0,0,43,32.7V13.357A.981.981,0,0,0,42.007,12.376Z"
                transform="translate(-2 -4)" fill="#fff"></path>
        </svg>
        `;
        break;
      case "SiteUrl":
        icon = `
        <svg ${DefaultAttributes} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">
          <path${DefaultAttributes} id="Path_1213" data-name="Path 1213" d="M15.833,4a4.163,4.163,0,0,0-2.958,1.229l-.979.979a4.168,4.168,0,0,0-1.229,2.958,4.1,4.1,0,0,0,.292,1.521L12.042,9.6a2.857,2.857,0,0,1,.792-2.458l.979-.979a2.853,2.853,0,0,1,2.021-.833,2.805,2.805,0,0,1,2,.833,2.85,2.85,0,0,1,0,4.021l-.979.979A2.853,2.853,0,0,1,14.833,12a2.439,2.439,0,0,1-.437-.042l-1.083,1.083a4.1,4.1,0,0,0,1.521.292A4.163,4.163,0,0,0,17.792,12.1l.979-.979A4.168,4.168,0,0,0,20,8.167,4.2,4.2,0,0,0,15.833,4ZM14.188,8.854,8.854,14.188l.958.958,5.333-5.333ZM9.167,10.667A4.163,4.163,0,0,0,6.208,11.9l-.979.979A4.168,4.168,0,0,0,4,15.833,4.2,4.2,0,0,0,8.167,20a4.163,4.163,0,0,0,2.958-1.229l.979-.979a4.168,4.168,0,0,0,1.229-2.958,4.1,4.1,0,0,0-.292-1.521L11.958,14.4a2.857,2.857,0,0,1-.792,2.458l-.979.979a2.853,2.853,0,0,1-2.021.833,2.805,2.805,0,0,1-2-.833,2.85,2.85,0,0,1,0-4.021l.979-.979A2.853,2.853,0,0,1,9.167,12a2.44,2.44,0,0,1,.438.042l1.083-1.083A4.1,4.1,0,0,0,9.167,10.667Z" transform="translate(-4 -4)" fill="#fff"></path>
        </svg>
        `;
        break;
      case "Form":
        icon = `
        <svg ${DefaultAttributes} id="igqdh" data-gjs-type="svg" xmlns="http://www.w3.org/2000/svg" width="26" height="30"
              viewBox="0 0 13 16">
              <path ${DefaultAttributes} id="Path_1209" data-gjs-type="svg-in" data-name="Path 1209"
                  d="M9.828,4A1.823,1.823,0,0,0,8,5.8V18.2A1.823,1.823,0,0,0,9.828,20h9.344A1.823,1.823,0,0,0,21,18.2V9.8a.6.6,0,0,0-.179-.424l-.006-.006L15.54,4.176A.614.614,0,0,0,15.109,4Zm0,1.2H14.5V8.6a1.823,1.823,0,0,0,1.828,1.8h3.453v7.8a.6.6,0,0,1-.609.6H9.828a.6.6,0,0,1-.609-.6V5.8A.6.6,0,0,1,9.828,5.2Zm5.891.848L18.92,9.2H16.328a.6.6,0,0,1-.609-.6Z"
                  transform="translate(-8 -4)" fill="#fff"></path>
          </svg>
        `;
        break;
      default:
        break;
    }
    
    return icon;
  }

  private generateContent(content: any): any {
    if (content.ContentType === "Image" && content.ContentValue !== "") {
      return this.contentImage(content);
    } else if (
      content.ContentType === "Description" &&
      content.ContentValue !== ""
    ) {
      return this.contentDescription(content);
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
                      <div ${ctaContainerDefaultAttributes} class="cta-button-container" style="gap: 0.2rem;">
                          ${ctaHtml}
                      </div>`
                        : `
                      <div ${ctaContainerDefaultAttributes} class="cta-button-container" style="gap: 0.2rem;"></div>`
                    }         
                      <i class="fa fa-pencil></i>
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

  contentImage(content: any) {
    return `
    <div ${contentDefaultAttributes} class="content-image" id="${content?.ContentId}" data-gjs-type="product-service-image">
        <button ${DefaultAttributes} class="tb-edit-image-icon">
            <svg ${DefaultAttributes} width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path ${DefaultAttributes} fill-rule="evenodd" clip-rule="evenodd" d="M18.4324 4C18.2266 4 18.0227 4.04055 17.8325 4.11933C17.6423 4.19811 17.4695 4.31358 17.3239 4.45914L5.25659 16.5265L4.42524 19.5748L7.47353 18.7434L19.5409 6.67608C19.6864 6.53051 19.8019 6.3577 19.8807 6.16751C19.9595 5.97732 20 5.77348 20 5.56761C20 5.36175 19.9595 5.1579 19.8807 4.96771C19.8019 4.77752 19.6864 4.60471 19.5409 4.45914C19.3953 4.31358 19.2225 4.19811 19.0323 4.11933C18.8421 4.04055 18.6383 4 18.4324 4ZM17.0671 2.27157C17.5 2.09228 17.9639 2 18.4324 2C18.9009 2 19.3648 2.09228 19.7977 2.27157C20.2305 2.45086 20.6238 2.71365 20.9551 3.04493C21.2864 3.37621 21.5492 3.7695 21.7285 4.20235C21.9077 4.63519 22 5.09911 22 5.56761C22 6.03611 21.9077 6.50003 21.7285 6.93288C21.5492 7.36572 21.2864 7.75901 20.9551 8.09029L8.69996 20.3454C8.57691 20.4685 8.42387 20.5573 8.25597 20.6031L3.26314 21.9648C2.91693 22.0592 2.54667 21.9609 2.29292 21.7071C2.03917 21.4534 1.94084 21.0831 2.03526 20.7369L3.39694 15.7441C3.44273 15.5762 3.53154 15.4231 3.6546 15.3001L15.9097 3.04493C16.241 2.71365 16.6343 2.45086 17.0671 2.27157Z" fill="#5068a8"/>
            </svg>
          </button>
          <button ${DefaultAttributes} class="tb-delete-image-icon">
            <svg fill="#5068a8" ${DefaultAttributes} width="14px" height="14px" viewBox="0 0 36 36" version="1.1"  preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <title ${DefaultAttributes}>delete</title>
                <path fill="#5068a8" ${DefaultAttributes} class="clr-i-outline clr-i-outline-path-1" d="M27.14,34H8.86A2.93,2.93,0,0,1,6,31V11.23H8V31a.93.93,0,0,0,.86,1H27.14A.93.93,0,0,0,28,31V11.23h2V31A2.93,2.93,0,0,1,27.14,34Z"></path><path class="clr-i-outline clr-i-outline-path-2" d="M30.78,9H5A1,1,0,0,1,5,7H30.78a1,1,0,0,1,0,2Z"></path>
                <rect fill="#5068a8" ${DefaultAttributes} class="clr-i-outline clr-i-outline-path-3" x="21" y="13" width="2" height="15"></rect>
                <rect fill="#5068a8" ${DefaultAttributes} class="clr-i-outline clr-i-outline-path-4" x="13" y="13" width="2" height="15"></rect>
                <path fill="#5068a8" ${DefaultAttributes} class="clr-i-outline clr-i-outline-path-5" d="M23,5.86H21.1V4H14.9V5.86H13V4a2,2,0,0,1,1.9-2h6.2A2,2,0,0,1,23,4Z"></path>
                <rect fill="#5068a8" ${DefaultAttributes} x="0" y="0" width="36" height="36" fill-opacity="0"/>
            </svg>
          </button>
        <img
            id="product-service-image"
            ${DefaultAttributes}
            src="${content?.ContentValue}"
            data-gjs-type="default"
            alt="Full-width Image"
        />
      </div>
    `;
  }

  contentDescription(content: any) {
    return `
    <div
        style="flex: 1; padding: 0; margin: 0; height: auto; white-space: normal;"
        class="content-page-block"
        ${contentDefaultAttributes} 
        id="${content?.ContentId}"
        data-gjs-type="product-service-description"
    >
      <button ${DefaultAttributes} class="tb-edit-content-icon">
        <svg ${DefaultAttributes} width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path ${DefaultAttributes} fill-rule="evenodd" clip-rule="evenodd" d="M18.4324 4C18.2266 4 18.0227 4.04055 17.8325 4.11933C17.6423 4.19811 17.4695 4.31358 17.3239 4.45914L5.25659 16.5265L4.42524 19.5748L7.47353 18.7434L19.5409 6.67608C19.6864 6.53051 19.8019 6.3577 19.8807 6.16751C19.9595 5.97732 20 5.77348 20 5.56761C20 5.36175 19.9595 5.1579 19.8807 4.96771C19.8019 4.77752 19.6864 4.60471 19.5409 4.45914C19.3953 4.31358 19.2225 4.19811 19.0323 4.11933C18.8421 4.04055 18.6383 4 18.4324 4ZM17.0671 2.27157C17.5 2.09228 17.9639 2 18.4324 2C18.9009 2 19.3648 2.09228 19.7977 2.27157C20.2305 2.45086 20.6238 2.71365 20.9551 3.04493C21.2864 3.37621 21.5492 3.7695 21.7285 4.20235C21.9077 4.63519 22 5.09911 22 5.56761C22 6.03611 21.9077 6.50003 21.7285 6.93288C21.5492 7.36572 21.2864 7.75901 20.9551 8.09029L8.69996 20.3454C8.57691 20.4685 8.42387 20.5573 8.25597 20.6031L3.26314 21.9648C2.91693 22.0592 2.54667 21.9609 2.29292 21.7071C2.03917 21.4534 1.94084 21.0831 2.03526 20.7369L3.39694 15.7441C3.44273 15.5762 3.53154 15.4231 3.6546 15.3001L15.9097 3.04493C16.241 2.71365 16.6343 2.45086 17.0671 2.27157Z" fill="#5068a8"/>
        </svg>
      </button>
      ${this.addGrapesAttributes(`<div ${DefaultAttributes} id="contentDescription">${content?.ContentValue}</div>`)}      
    </div>
    `;
  }
}
