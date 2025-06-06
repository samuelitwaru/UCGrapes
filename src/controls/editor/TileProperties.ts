import { i18n } from "../../i18n/i18n";
import { Tile } from "../../types";
import { ActionInput } from "../../ui/components/tools-section/content-section/ActionInput";
import { getIconCategories, rgbToHex } from "../../utils/helpers";
import { ThemeManager } from "../themes/ThemeManager";

export class TileProperties {
  tileAttributes: Tile;
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
    const backgroundColor =
      computedStyle.backgroundColor || tileEl.style.backgroundColor;
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
    title.focus();
    const defaultTitles = ["title", "titel"];
    if (tileTitle && !defaultTitles.includes(tileTitle.toLowerCase())) {
      title.value = tileTitle;
    } else {
      title.value = "";
    }

    const parentDiv = title.parentElement as HTMLElement;

    // Remove existing actionInput if it exists
    const existingActionInput = parentDiv.querySelector(".cta-action-input");
    if (existingActionInput) {
      existingActionInput.remove();
    }

    if (
      this.tileAttributes?.Action?.ObjectType === "Phone" ||
      this.tileAttributes?.Action?.ObjectType === "Email" ||
      this.tileAttributes?.Action?.ObjectType === "WebLink"
    ) {
      const actionInput = this.tileActionDisplay();
      title.insertAdjacentElement("afterend", actionInput);
    }

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
      if (!categoryTitle) return;
      let categories: { name: string; label: string }[] = getIconCategories()
      const category = categories.find((cat) => cat.name.toLowerCase() === categoryTitle.toLowerCase())
      
      if (!category) return
      const categoryContainer = document.querySelector(
        "#icon-categories-list"
      ) as HTMLElement;
      const allOptions = categoryContainer.querySelectorAll(".category-option");
      console.log(allOptions)
      allOptions.forEach((opt) => {
        opt.classList.remove("selected");
        if (opt.getAttribute("data-value") === categoryTitle) {
          opt.classList.add("selected");
          const selectedCategory = categoryContainer.querySelector(
            ".selected-category-value"
          ) as HTMLElement;
          if (selectedCategory) {
            selectedCategory.textContent = category.label;
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

      if (
        tileIcon &&
        iconTitle === tileIcon &&
        iconTitle === selectedTileIcon
      ) {
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

  private tileActionDisplay() {
    const actionValue = this.tileAttributes?.Action?.ObjectUrl;
    const actionInput = new ActionInput(
      actionValue,
      this.tileAttributes,
      "action",
      "tile"
    );

    return actionInput.getInputElement();
  }
}
