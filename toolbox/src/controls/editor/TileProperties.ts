import { i18n } from "../../i18n/i18n";
import { rgbToHex } from "../../utils/helpers";
import {
  ThemeManager
} from "../themes/ThemeManager";

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
      this.setActionProperties();
  }

  private setBgColorProperties(): void {
      const themeColors = document.getElementById("theme-color-palette");
      const tileEl = this.selectedComponent.getEl() as HTMLElement;
      const tileBGColorHex = rgbToHex(tileEl.style.backgroundColor);
      const hasBgImage: boolean =
          this.selectedComponent.getStyle()?.["background-image"];

      const tileBgColorAttr = this.themeManager.getThemeColor(
          this.tileAttributes.BGColor
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
      const tileBgImageAttrUrl = this.tileAttributes.BGImageUrl;
      const tileBgImageAttrOpacity = this.tileAttributes.Opacity;
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
                  input.value = tileBgImageAttrOpacity;
                  const opacityValue = opactySection.querySelector(
                      "#valueDisplay"
                  ) as HTMLElement;
                  opacityValue.textContent = tileBgImageAttrOpacity + "%";
                  const tileImageSection = opactySection.querySelector(
                      "#tile-img-container"
                  ) as HTMLElement;
                  tileImageSection.style.display = "block";
                  const imageThumbnail = tileImageSection.querySelector(
                      ".tile-img-thumbnail"
                  ) as HTMLImageElement;
                  if (imageThumbnail) {
                      imageThumbnail.src = tileBgImageAttrUrl;
                  }
                  this.selectedComponent.addStyle({
                      "background-color": `rgba(0, 0, 0, ${
            tileBgImageAttrOpacity / 100
          })`,
                  });
              }
          }
      } else {
          const slider = document.querySelector("#slider-wrapper") as HTMLElement;
          const tileImageSection = document.querySelector(
              "#tile-img-container"
          ) as HTMLElement;
          slider.style.display = "none";
          tileImageSection.style.display = "none";
      }
  }

  private setTitleStyleProperties() {
      const title = document.querySelector("#tile-title") as HTMLInputElement;
      const tileTitle = this.tileAttributes.Text;
      title.value = tileTitle;

      const tileColor = this.tileAttributes.Color;
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
      const tileAlign = this.tileAttributes.Align;
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

  private setActionProperties(): void {
      const tileActionType = this.tileAttributes.Action?.ObjectType;
      const tileActionName = this.tileAttributes?.Text;

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


      const actionHeader = document.querySelector(
          ".tb-dropdown-header"
      ) as HTMLElement;
      const actionHeaderLabel = actionHeader.querySelector(
          "#sidebar_select_action_label"
      ) as HTMLElement;

      if (actionHeaderLabel) {
          if (!tileActionType) {
              actionHeaderLabel.innerText = "Select Action";
          } else {
              actionHeaderLabel.innerText = `${
        tileActionName.length > 10
          ? tileActionName.substring(0, 14) + ""
          : tileActionName
      }, ${
        tileActionName.length > 10
          ? tileActionName.substring(0, 14) + "..."
          : tileActionName
      }`;
          }
      }
  }
}