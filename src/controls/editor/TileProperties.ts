import { i18n } from "../../i18n/i18n";
import { rgbToHex } from "../../utils/helpers";
import { ThemeManager } from "../themes/ThemeManager";

export class TileProperties {
  tileAttributes: any;
  selectedComponent: any;
  themeManager: any;

  constructor(selectedComponent: any, tileAttributes: any) {
    this.tileAttributes = tileAttributes;
    this.selectedComponent = selectedComponent;
    this.themeManager = new ThemeManager();
  }

  public setTileAttributes() {
    this.setBgColorProperties();
    this.setOpacityProperties();
    this.setTitleStyleProperties();
    this.setTileActionProperties();
    // this.setActionProperties();
    this.setTileIconProperties();
  }

  private setBgColorProperties(): void {
    const themeColors = document.getElementById("theme-color-palette");
    const tileEl = this.selectedComponent.getEl() as HTMLElement;
    
    const computedStyle = window.getComputedStyle(tileEl);
    const backgroundColor = tileEl.style.backgroundColor || computedStyle.backgroundColor;
    const tileBGColorHex = rgbToHex(backgroundColor);
    const hasBgImage: boolean =
      this.selectedComponent.getStyle()?.["background-image"];

    const tileBgColorAttr = this.themeManager.getThemeColor(
      this.tileAttributes?.BGColor
    );

    const colorBoxes: any = themeColors?.children;
    for (let i = 0; i < colorBoxes.length; i++) {
      const colorBox = colorBoxes[i] as HTMLElement;
      const inputBox = colorBox.querySelector("input") as HTMLInputElement;
      if (
        !hasBgImage &&
        tileBGColorHex === tileBgColorAttr &&
        tileBGColorHex === inputBox.value
      ) {
        inputBox.checked = true;
      } else {
        inputBox.checked = false;
      }
    }
  }

  private setOpacityProperties(): void {
    const tileBgImageAttrUrl = this.tileAttributes?.BGImageUrl;
    const tileBgImageAttrOpacity = this.tileAttributes?.Opacity || 0;
    const bgImageStyle =
      this.selectedComponent.getStyle()?.["background-image"];
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
          const slider = opactySection.querySelector(
            "#slider-wrapper"
          ) as HTMLElement;
          slider.style.display = "flex";
          const input = opactySection.querySelector(
            "#bg-opacity"
          ) as HTMLInputElement;
          // remove decimal points from the opacity value
          const value = Math.round(tileBgImageAttrOpacity * 100) / 100;
          input.value = value.toString();
          const opacityValue = opactySection.querySelector(
            "#valueDisplay"
          ) as HTMLElement;
          opacityValue.textContent = input.value + "%";
          const tileImageSection = opactySection.querySelector(
            "#tile-img-container"
          ) as HTMLElement;
          if (tileImageSection) {
            tileImageSection.style.display = "flex";
          }
          this.selectedComponent.addStyle({
            "background-color": `rgba(0, 0, 0, ${
              tileBgImageAttrOpacity / 100
            })`,
          });
        }
      }
    } else {
      const tileImageSection = document.querySelector(
        "#tile-img-container"
      ) as HTMLElement;
      if (tileImageSection) {
        tileImageSection.style.display = "none";
      }

      const slider = document.querySelector("#slider-wrapper") as HTMLElement;
      if (slider) {
        slider.style.display = "none";
      } 
    }
  }

  private setTitleStyleProperties() {
    const title = document.querySelector("#tile-title") as HTMLInputElement;
    const tileTitle = this.tileAttributes?.Text;
    title.focus()
    title.value = tileTitle;

    const tileColor = this.tileAttributes?.Color;
    const tileColorSection = document.querySelector("#text-color-palette");
    const tileColorsOptions = tileColorSection?.querySelectorAll("input");
    tileColorsOptions?.forEach((option) => {
      if (option.value === tileColor) {
        option.checked = true;
      } else {
        option.checked = false;
      }
    });
  }

  private setTileActionProperties() {
    const tileAlign = this.tileAttributes?.Align;
    const tileAlignSection = document.querySelector(".text-alignment");
    const tileAlignsOption = tileAlignSection?.querySelectorAll("input");
    tileAlignsOption?.forEach((option) => {
      if (option.value === tileAlign) {
        option.checked = true;
      } else {
        option.checked = false;
      }
    });
  }

  private setTileIconProperties() {
    const tileIcon = this.tileAttributes?.Icon as string;
    if (tileIcon) {
      const categoryTitle = this.themeManager.getIconCategory(tileIcon);
      this.themeManager.updateThemeIcons(categoryTitle);

      const categoryContainer = document.querySelector("#icon-categories-list") as HTMLElement;
      const allOptions =
      categoryContainer.querySelectorAll(".category-option");
        allOptions.forEach((opt) => {
          opt.classList.remove("selected");
          if (opt.getAttribute("data-value") === categoryTitle) {
            opt.classList.add("selected");
            const selectedCategory = categoryContainer.querySelector(".selected-category-value") as HTMLElement;
            if (selectedCategory) {
              selectedCategory.textContent = i18n.t(`sidebar.icon_category.${categoryTitle.toLowerCase()}`);             
            }
          }
        });
    }

    const iconDiv = this.selectedComponent
      .getEl()
      .querySelector(".tile-icon") as HTMLElement;
    const selectedTileIcon = iconDiv?.getAttribute("title") ?? "";

    const sideBarIconsDiv = document.querySelector(
      "#icons-list"
    ) as HTMLDivElement;
    const sidebarIcons = sideBarIconsDiv.querySelectorAll(".icon");

    sidebarIcons.forEach((icon) => {
      const iconElement = icon as HTMLElement;
      const iconTitle = iconElement.getAttribute("title") ?? "";

      if (tileIcon && iconTitle === tileIcon && iconTitle === selectedTileIcon) {
        iconElement.style.border = "2px solid #5068A8";
        const svgPath = iconElement.querySelector("svg path") as SVGPathElement;
        if (svgPath) {
          svgPath.setAttribute("fill", "#5068A8");
        }
      } else {
        iconElement.style.border = "";
        const svgPath = iconElement.querySelector("svg path") as SVGPathElement;
        if (svgPath) {
          svgPath.setAttribute("fill", "#7c8791");
        }
      }
    });
  }

  // private setActionProperties(): void {
  //   // const tileActionType = this.tileAttributes?.Action?.ObjectType;
  //   // const tileActionName = this.tileAttributes?.Text;

  //   //   let actionLabel = "";
  //   //   if (tileActionType == "Page") {
  //   //     actionLabel = i18n.t("sidebar.action_list.page");
  //   //   } else if (tileActionType == "Web Link") {
  //   //     actionLabel = i18n.t("sidebar.action_list.services");
  //   //   } else if (tileActionType == "Service/Product Page") {
  //   //     actionLabel = i18n.t("sidebar.action_list.weblink");
  //   //   } else if (tileActionType == "Dynamic Form") {
  //   //     actionLabel = i18n.t("sidebar.action_list.forms");
  //   //   } else if (tileActionType == "Module") {
  //   //     actionLabel = i18n.t("sidebar.action_list.module");
  //   //   } else if (tileActionType == "Content") {
  //   //     actionLabel = i18n.t("sidebar.action_list.content");
  //   //   }

  //   // const actionHeader = document.querySelector(
  //   //   ".tb-dropdown-header"
  //   // ) as HTMLElement;
  //   // const actionHeaderLabel = actionHeader.querySelector(
  //   //   "#sidebar_select_action_label"
  //   // ) as HTMLElement;

  //   // if (actionHeaderLabel) {
  //   //   if (!tileActionType) {
  //   //     actionHeaderLabel.innerText = "Select Action";
  //   //   } else {
  //   //     actionHeaderLabel.innerText = `${
  //   //       tileActionName.length > 10
  //   //         ? tileActionName.substring(0, 14) + ""
  //   //         : tileActionName
  //   //     }, ${
  //   //       tileActionName.length > 10
  //   //         ? tileActionName.substring(0, 14) + "..."
  //   //         : tileActionName
  //   //     }`;
  //   //   }
  //   // }
  // }
}
