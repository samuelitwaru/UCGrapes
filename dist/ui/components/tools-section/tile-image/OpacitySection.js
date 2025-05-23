import { InfoSectionController } from "../../../../controls/InfoSectionController";
import { ImageUpload } from "./ImageUpload";
export class OpacitySection {
    constructor() {
        this.container = document.createElement("div");
        this.init();
    }
    init() {
        this.container.className = "bg-section";
        const addImageBtn = document.createElement("button");
        addImageBtn.className = "add-image";
        addImageBtn.id = "image-bg";
        addImageBtn.innerHTML = `
            <span class="plus">
               <i class="fa fa-plus"></i>
            </span>
            <span class="image-icon">
                <i class="fa fa-image"></i>
            </span>
        `;
        const sliderWrapper = document.createElement("div");
        sliderWrapper.className = "slider-wrapper";
        sliderWrapper.id = "slider-wrapper";
        sliderWrapper.style.display = "none";
        const input = document.createElement("input");
        input.type = "range";
        input.id = "bg-opacity";
        input.min = "0";
        input.max = "100";
        input.value = "0";
        input.addEventListener("input", (event) => {
            const value = event.target.value;
            const valueDisplay = document.getElementById("valueDisplay");
            if (valueDisplay) {
                valueDisplay.innerHTML = `${value}%`;
            }
            this.updateImageOpacity(value);
        });
        const valueDisplay = document.createElement("span");
        valueDisplay.id = "valueDisplay";
        valueDisplay.innerHTML = "0%";
        sliderWrapper.appendChild(input);
        sliderWrapper.appendChild(valueDisplay);
        addImageBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const selectedComponent = globalThis.selectedComponent;
            if (!selectedComponent)
                return;
            const modal = document.createElement("div");
            modal.classList.add("tb-modal");
            modal.style.display = "flex";
            const modalContent = new ImageUpload("tile");
            modalContent.render(modal);
            const uploadInput = document.createElement("input");
            uploadInput.type = "file";
            uploadInput.multiple = true;
            uploadInput.accept = "image/jpeg, image/jpg, image/png";
            uploadInput.id = "fileInput";
            uploadInput.style.display = "none";
            document.body.appendChild(modal);
            document.body.appendChild(uploadInput);
        });
        this.container.appendChild(addImageBtn);
        this.container.appendChild(sliderWrapper);
    }
    updateImageOpacity(value) {
        const selectedComponent = globalThis.selectedComponent;
        if (!selectedComponent)
            return;
        const opacity = value / 100;
        selectedComponent.getEl().style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
        const pageData = globalThis.pageData;
        if (pageData.PageType === "Information") {
            const infoSectionController = new InfoSectionController();
            infoSectionController.updateInfoTileAttributes(selectedComponent.parent().parent().getId(), selectedComponent.parent().getId(), "Opacity", value);
        }
        else {
            globalThis.tileMapper.updateTile(selectedComponent.parent().getId(), "Opacity", value);
        }
    }
    render(container) {
        container.appendChild(this.container);
    }
}
//# sourceMappingURL=OpacitySection.js.map