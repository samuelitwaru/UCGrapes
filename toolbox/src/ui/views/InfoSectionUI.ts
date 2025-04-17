import Quill from "quill";
import { Modal } from "../components/Modal";
import { ImageUpload } from "../components/tools-section/tile-image/ImageUpload";
import {
  ctaTileDEfaultAttributes,
  DefaultAttributes,
} from "../../utils/default-attributes";
import { ThemeManager } from "../../controls/themes/ThemeManager";
import { InfoSectionController } from "../../controls/InfoSectionController";

export class InfoSectionUI {
  themeManager: any;
  controller: InfoSectionController;

  constructor() {
    this.themeManager = new ThemeManager();
    this.controller = new InfoSectionController();
  }

  openImageUpload() {
    const modal = document.createElement("div");
    modal.classList.add("tb-modal");
    modal.style.display = "flex";

    const modalContent = new ImageUpload("content");
    modalContent.render(modal);
    const uploadInput = document.createElement("input");
    uploadInput.type = "file";
    uploadInput.multiple = true;
    uploadInput.accept = "image/jpeg, image/jpg, image/png";
    uploadInput.id = "fileInput";
    uploadInput.style.display = "none";

    document.body.appendChild(modal);
    document.body.appendChild(uploadInput);
  }

  openContentEditModal() {
    const modalBody = document.createElement("div");

    const modalContent = document.createElement("div");
    modalContent.id = "editor";
    modalContent.innerHTML = `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,...</p>`;

    const submitSection = document.createElement("div");
    submitSection.classList.add("popup-footer");
    submitSection.style.marginBottom = "-12px";

    const saveBtn = this.createButton("submit_form", "tb-btn-primary", "Save");
    const cancelBtn = this.createButton(
      "cancel_form",
      "tb-btn-outline",
      "Cancel"
    );

    submitSection.appendChild(saveBtn);
    submitSection.appendChild(cancelBtn);

    modalBody.appendChild(modalContent);
    modalBody.appendChild(submitSection);

    const modal = new Modal({
      title: "Edit Content",
      width: "500px",
      body: modalBody,
    });
    modal.open();

    const quill = new Quill("#editor", {
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "link"],
          [{ list: "ordered" }, { list: "bullet" }],
        ],
      },
      theme: "snow",
    });

    saveBtn.addEventListener("click", () => {
      const content = document.querySelector(
        "#editor .ql-editor"
      ) as HTMLElement;
      this.controller.addDescription(content.innerHTML);
      modal.close();
    });
    cancelBtn.addEventListener("click", () => {
      modal.close();
    });
  }

  addCtaButton(cta: any) {
    const imgButton = `
    <div id="${cta.CtaId}" 
        button-type="${cta.CtaType}"
        ${ctaTileDEfaultAttributes} 
        data-gjs-type="cta-buttons" 
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
