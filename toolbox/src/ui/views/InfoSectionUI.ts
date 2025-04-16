import Quill from "quill";
import { Modal } from "../components/Modal";
import { ImageUpload } from "../components/tools-section/tile-image/ImageUpload";
import {
  contentDefaultAttributes,
  ctaTileDEfaultAttributes,
  DefaultAttributes,
} from "../../utils/default-attributes";
import { ThemeManager } from "../../controls/themes/ThemeManager";
import { InfoSectionController } from "../../controls/InfoSectionController";
import { baseURL } from "../../services/ToolBoxService";
import { randomIdGenerator } from "../../utils/helpers";

export class InfoSectionUI {
  themeManager: any;

  constructor() {
    this.themeManager = new ThemeManager();
  }

  openImageUpload() {
    // const modal = document.createElement("div");
    // modal.classList.add("tb-modal");
    // modal.style.display = "flex";

    // // const modalContent = new ImageUpload("content");
    // modalContent.render(modal);
    // const uploadInput = document.createElement("input");
    // uploadInput.type = "file";
    // uploadInput.multiple = true;
    // uploadInput.accept = "image/jpeg, image/jpg, image/png";
    // uploadInput.id = "fileInput";
    // uploadInput.style.display = "none";

    // document.body.appendChild(modal);
    // document.body.appendChild(uploadInput);
  }

  addCtaButton(cta: any) {
    const imgButton = `
    <div id="${cta.CtaId}" 
        button-type="${cta.CtaType}"
        ${ctaTileDEfaultAttributes} 
        data-gjs-type="info-cta-section" 
        class="img-button-container">
        <div ${DefaultAttributes} class="img-button cta-styled-btn"
            style="background-color: ${this.themeManager.getThemeCtaColor(
                cta.CtaBGColor
            )}">
            <span ${DefaultAttributes} class="img-button-section">
                <img ${DefaultAttributes} 
                    src="${
                        cta.CtaButtonImgUrl
                        ? cta.CtaButtonImgUrl
                        : `/Resources/UCGrapes1/src/images/image.png`
                    }" 
                />
                <span ${DefaultAttributes} class="edit-cta-image">
                    ${
                        cta.CtaButtonImgUrl
                        ? `
                        <svg ${DefaultAttributes} xmlns="http://www.w3.org/2000/svg" id="Component_57_1" data-name="Component 57 – 1" width="22" height="22" viewBox="0 0 33 33">
                            <g ${DefaultAttributes} id="Ellipse_532" data-name="Ellipse 532" fill="#fff" stroke="#5068a8" stroke-width="2">
                                <circle ${DefaultAttributes} cx="16.5" cy="16.5" r="16.5" stroke="none"/>
                                <circle ${DefaultAttributes} cx="16.5" cy="16.5" r="16" fill="none"/>
                            </g>
                            <path ${DefaultAttributes} id="Icon_feather-edit-2" data-name="Icon feather-edit-2" d="M12.834,3.8a1.854,1.854,0,0,1,2.622,2.622L6.606,15.274,3,16.257l.983-3.606Z" transform="translate(7 6.742)" fill="#5068a8" stroke="#5068a8" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                        </svg>
                        `
                        : `
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
                    `
                    }
                </span>
            </span>
            <div${DefaultAttributes} class="cta-badge">
                <i ${DefaultAttributes} class="fa fa-minus"></i>
            </div>
            <span ${DefaultAttributes} class="img-button-label label" style="color:${
                cta.CtaColor ? cta.CtaColor : "#ffffff"
            }">${cta.CtaLabel}</span>
                        <i ${DefaultAttributes} class="fa fa-angle-right img-button-arrow" style="color:${
                cta.CtaColor ? cta.CtaColor : "#ffffff"
            }"></i>
        </div>
    </div>`;
    return imgButton;
  }

  infoTileUi() {
    return `
      <div data-gjs-highlightable="true" data-gjs-type="template-wrapper" class="container-row">
        <div id="RAyFCkUccOaehdf" data-gjs-type="tile-wrapper" class="template-wrapper">
          <div data-gjs-type="default" class="template-block">
              <div data-gjs-type="default" class="tile-icon-section">
                <span id="inds5" data-gjs-type="text" class="tile-close-icon top-right">×</span>
                <span id="i7y2i" data-gjs-type="text" title="" class="tile-icon">
                undefined
                </span>
              </div>
              <div data-gjs-type="default" class="tile-title-section">
                <span data-gjs-type="text" class="tile-close-title top-right">×</span>
                <span data-gjs-type="text" title="Location" class="tile-title">Location</span>
              </div>
          </div>
          <button data-gjs-type="text" title="Delete tile" class="action-button delete-button">−</button>
          <button id="ixaqx" data-gjs-type="text" title="Add tile right" class="action-button add-button-right">+</button>
          <svg data-gjs-type="svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 27 27" class="tile-open-menu">
              <g id="Group_2383-4" data-gjs-type="svg-in" data-name="Group 2383" transform="translate(-921 -417.999)">
                <g id="Group_2382-4" data-gjs-type="svg-in" data-name="Group 2382" transform="translate(921 418)">
                    <circle id="Ellipse_534-4" data-gjs-type="svg-in" data-name="Ellipse 534" cx="13.5" cy="13.5" r="13.5" transform="translate(0 -0.001)" fill="#6a747f"></circle>
                </g>
                <path id="Path_2320-4" data-gjs-type="svg-in" data-name="Path 2320" d="M1.7,0a1.7,1.7,0,1,0,1.7,1.7A1.7,1.7,0,0,0,1.7,0ZM7.346,0a1.7,1.7,0,1,0,1.7,1.7A1.7,1.7,0,0,0,7.346,0ZM13,0a1.7,1.7,0,1,0,1.7,1.7A1.7,1.7,0,0,0,13,0Z" transform="translate(927 430)" fill="#fff"></path>
              </g>
          </svg>
        </div>
      </div>
    `;
  }

  getDescription(description: string) {
    return `
      <div
              style="flex: 1; padding: 0; margin: 0; height: auto; white-space: normal;"
              class="info-desc-section"
              ${contentDefaultAttributes} 
              id="${randomIdGenerator(15)}"
              data-gjs-type="info-desc-section"
          >
            <button ${DefaultAttributes} class="tb-edit-content-icon">
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
            ${this.addGrapesAttributes(
              `<div ${DefaultAttributes} class="info-desc-content">${description}</div>`
            )}      
          </div>
      `;
  }

  getImage(imageUrl: string) {
    return `
    <div ${contentDefaultAttributes} class="info-image-section" id="${randomIdGenerator(
      15
    )}" data-gjs-type="info-image-section">
          <button ${DefaultAttributes} data-gjs-type="default" class="tb-edit-image-icon">
            <svg ${DefaultAttributes} data-gjs-type="svg" width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path ${DefaultAttributes} data-gjs-type="svg-in" fill-rule="evenodd" clip-rule="evenodd" d="M18.4324 4C18.2266 4 18.0227 4.04055 17.8325 4.11933C17.6423 4.19811 17.4695 4.31358 17.3239 4.45914L5.25659 16.5265L4.42524 19.5748L7.47353 18.7434L19.5409 6.67608C19.6864 6.53051 19.8019 6.3577 19.8807 6.16751C19.9595 5.97732 20 5.77348 20 5.56761C20 5.36175 19.9595 5.1579 19.8807 4.96771C19.8019 4.77752 19.6864 4.60471 19.5409 4.45914C19.3953 4.31358 19.2225 4.19811 19.0323 4.11933C18.8421 4.04055 18.6383 4 18.4324 4ZM17.0671 2.27157C17.5 2.09228 17.9639 2 18.4324 2C18.9009 2 19.3648 2.09228 19.7977 2.27157C20.2305 2.45086 20.6238 2.71365 20.9551 3.04493C21.2864 3.37621 21.5492 3.7695 21.7285 4.20235C21.9077 4.63519 22 5.09911 22 5.56761C22 6.03611 21.9077 6.50003 21.7285 6.93288C21.5492 7.36572 21.2864 7.75901 20.9551 8.09029L8.69996 20.3454C8.57691 20.4685 8.42387 20.5573 8.25597 20.6031L3.26314 21.9648C2.91693 22.0592 2.54667 21.9609 2.29292 21.7071C2.03917 21.4534 1.94084 21.0831 2.03526 20.7369L3.39694 15.7441C3.44273 15.5762 3.53154 15.4231 3.6546 15.3001L15.9097 3.04493C16.241 2.71365 16.6343 2.45086 17.0671 2.27157Z" fill="#5068a8"></path>
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
            class="product-service-image"
            ${DefaultAttributes}
            src="${imageUrl}"
            data-gjs-type="default"
            alt="Full-width Image"
        />
      </div>
    `;
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

  private createButton(
    id: string,
    className: string,
    text: string
  ): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.id = id;
    btn.classList.add("tb-btn", className);
    btn.innerText = text;
    return btn;
  }
}
