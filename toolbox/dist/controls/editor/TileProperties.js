import { i18n } from "../../i18n/i18n";
import { rgbToHex } from "../../utils/helpers";
import { ThemeManager } from "../themes/ThemeManager";
export class TileProperties {
    constructor(selectedComponent, tileAttributes) {
        this.tileAttributes = tileAttributes;
        this.selectedComponent = selectedComponent;
        this.themeManager = new ThemeManager();
    }
    setTileAttributes() {
        this.setBgColorProperties();
        this.setOpacityProperties();
        this.setTitleStyleProperties();
        this.setTileActionProperties();
        this.setActionProperties();
        this.setTileIconProperties();
    }
    setBgColorProperties() {
        var _a, _b;
        const themeColors = document.getElementById("theme-color-palette");
        const tileEl = this.selectedComponent.getEl();
        const tileBGColorHex = rgbToHex(tileEl.style.backgroundColor);
        const hasBgImage = (_a = this.selectedComponent.getStyle()) === null || _a === void 0 ? void 0 : _a["background-image"];
        const tileBgColorAttr = this.themeManager.getThemeColor((_b = this.tileAttributes) === null || _b === void 0 ? void 0 : _b.BGColor);
        const colorBoxes = themeColors === null || themeColors === void 0 ? void 0 : themeColors.children;
        for (let i = 0; i < colorBoxes.length; i++) {
            const colorBox = colorBoxes[i];
            const inputBox = colorBox.querySelector("input");
            if (!hasBgImage &&
                tileBGColorHex === tileBgColorAttr &&
                tileBGColorHex === inputBox.value) {
                inputBox.checked = true;
            }
            else {
                inputBox.checked = false;
            }
        }
    }
    setOpacityProperties() {
        var _a, _b, _c;
        const tileBgImageAttrUrl = (_a = this.tileAttributes) === null || _a === void 0 ? void 0 : _a.BGImageUrl;
        const tileBgImageAttrOpacity = (_b = this.tileAttributes) === null || _b === void 0 ? void 0 : _b.Opacity;
        const bgImageStyle = (_c = this.selectedComponent.getStyle()) === null || _c === void 0 ? void 0 : _c["background-image"];
        let tileBGImage = "";
        if (bgImageStyle && bgImageStyle.startsWith("url(")) {
            tileBGImage = bgImageStyle
                .replace(/^url\(["']?/, "")
                .replace(/["']?\)$/, "");
        }
        if (tileBGImage && tileBgImageAttrUrl) {
            if (tileBGImage === tileBgImageAttrUrl) {
                const opactySection = document.querySelector(".tile-img-section");
                if (opactySection) {
                    const slider = opactySection.querySelector("#slider-wrapper");
                    slider.style.display = "flex";
                    const input = opactySection.querySelector("#bg-opacity");
                    // remove decimal points from the opacity value
                    const value = Math.round(tileBgImageAttrOpacity * 100) / 100;
                    input.value = value.toString();
                    const opacityValue = opactySection.querySelector("#valueDisplay");
                    opacityValue.textContent = input.value + "%";
                    const tileImageSection = opactySection.querySelector("#tile-img-container");
                    tileImageSection.style.display = "block";
                    const imageThumbnail = tileImageSection.querySelector(".tile-img-thumbnail");
                    if (imageThumbnail) {
                        imageThumbnail.src = tileBgImageAttrUrl;
                    }
                    this.selectedComponent.addStyle({
                        "background-color": `rgba(0, 0, 0, ${tileBgImageAttrOpacity / 100})`,
                    });
                }
            }
        }
        else {
            const slider = document.querySelector("#slider-wrapper");
            const tileImageSection = document.querySelector("#tile-img-container");
            slider.style.display = "none";
            tileImageSection.style.display = "none";
        }
    }
    setTitleStyleProperties() {
        var _a, _b;
        const title = document.querySelector("#tile-title");
        const tileTitle = (_a = this.tileAttributes) === null || _a === void 0 ? void 0 : _a.Text;
        title.value = tileTitle;
        const tileColor = (_b = this.tileAttributes) === null || _b === void 0 ? void 0 : _b.Color;
        const tileColorSection = document.querySelector("#text-color-palette");
        const tileColorsOptions = tileColorSection === null || tileColorSection === void 0 ? void 0 : tileColorSection.querySelectorAll("input");
        tileColorsOptions === null || tileColorsOptions === void 0 ? void 0 : tileColorsOptions.forEach((option) => {
            if (option.value === tileColor) {
                option.checked = true;
            }
            else {
                option.checked = false;
            }
        });
    }
    setTileActionProperties() {
        var _a;
        const tileAlign = (_a = this.tileAttributes) === null || _a === void 0 ? void 0 : _a.Align;
        const tileAlignSection = document.querySelector(".text-alignment");
        const tileAlignsOption = tileAlignSection === null || tileAlignSection === void 0 ? void 0 : tileAlignSection.querySelectorAll("input");
        tileAlignsOption === null || tileAlignsOption === void 0 ? void 0 : tileAlignsOption.forEach((option) => {
            if (option.value === tileAlign) {
                option.checked = true;
            }
            else {
                option.checked = false;
            }
        });
    }
    setTileIconProperties() {
        var _a, _b;
        const tileIcon = (_a = this.tileAttributes) === null || _a === void 0 ? void 0 : _a.Icon;
        if (tileIcon) {
            const categoryTitle = this.themeManager.getIconCategory(tileIcon);
            this.themeManager.updateThemeIcons(categoryTitle);
            const categoryContainer = document.querySelector("#icon-categories-list");
            const allOptions = categoryContainer.querySelectorAll(".category-option");
            allOptions.forEach((opt) => {
                opt.classList.remove("selected");
                if (opt.getAttribute("data-value") === categoryTitle) {
                    opt.classList.add("selected");
                    const selectedCategory = categoryContainer.querySelector(".selected-category-value");
                    if (selectedCategory) {
                        selectedCategory.textContent = i18n.t(`sidebar.icon_category.${categoryTitle.toLowerCase()}`);
                    }
                }
            });
        }
        const iconDiv = this.selectedComponent
            .getEl()
            .querySelector(".tile-icon");
        const selectedTileIcon = (_b = iconDiv === null || iconDiv === void 0 ? void 0 : iconDiv.getAttribute("title")) !== null && _b !== void 0 ? _b : "";
        const sideBarIconsDiv = document.querySelector("#icons-list");
        const sidebarIcons = sideBarIconsDiv.querySelectorAll(".icon");
        sidebarIcons.forEach((icon) => {
            var _a;
            const iconElement = icon;
            const iconTitle = (_a = iconElement.getAttribute("title")) !== null && _a !== void 0 ? _a : "";
            if (tileIcon && iconTitle === tileIcon && iconTitle === selectedTileIcon) {
                iconElement.style.border = "2px solid #5068A8";
                const svgPath = iconElement.querySelector("svg path");
                if (svgPath) {
                    svgPath.setAttribute("fill", "#5068A8");
                }
            }
            else {
                iconElement.style.border = "";
                const svgPath = iconElement.querySelector("svg path");
                if (svgPath) {
                    svgPath.setAttribute("fill", "#7c8791");
                }
            }
        });
    }
    setActionProperties() {
        var _a, _b, _c;
        const tileActionType = (_b = (_a = this.tileAttributes) === null || _a === void 0 ? void 0 : _a.Action) === null || _b === void 0 ? void 0 : _b.ObjectType;
        const tileActionName = (_c = this.tileAttributes) === null || _c === void 0 ? void 0 : _c.Text;
        //   let actionLabel = "";
        //   if (tileActionType == "Page") {
        //     actionLabel = i18n.t("sidebar.action_list.page");
        //   } else if (tileActionType == "Web Link") {
        //     actionLabel = i18n.t("sidebar.action_list.services");
        //   } else if (tileActionType == "Service/Product Page") {
        //     actionLabel = i18n.t("sidebar.action_list.weblink");
        //   } else if (tileActionType == "Dynamic Form") {
        //     actionLabel = i18n.t("sidebar.action_list.forms");
        //   } else if (tileActionType == "Module") {
        //     actionLabel = i18n.t("sidebar.action_list.module");
        //   } else if (tileActionType == "Content") {
        //     actionLabel = i18n.t("sidebar.action_list.content");
        //   }
        const actionHeader = document.querySelector(".tb-dropdown-header");
        const actionHeaderLabel = actionHeader.querySelector("#sidebar_select_action_label");
        if (actionHeaderLabel) {
            if (!tileActionType) {
                actionHeaderLabel.innerText = "Select Action";
            }
            else {
                actionHeaderLabel.innerText = `${tileActionName.length > 10
                    ? tileActionName.substring(0, 14) + ""
                    : tileActionName}, ${tileActionName.length > 10
                    ? tileActionName.substring(0, 14) + "..."
                    : tileActionName}`;
            }
        }
    }
}
//# sourceMappingURL=TileProperties.js.map