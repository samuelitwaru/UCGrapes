import { InfoSectionManager } from "../../../../controls/InfoSectionManager";
import { ThemeManager } from "../../../../controls/themes/ThemeManager";

export class TileImgContainer {
  container: HTMLElement;
  positionX: number = 50;
  positionY: number = 50;
  zoomLevel: number = 1;

  constructor() {
    this.container = document.createElement("div");
    this.init();
   }

  init() {
    this.container.classList.add("tile-img-container");
    this.container.id = "tile-img-container";
    
    this.container.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14.5" height="16" viewBox="0 0 14.5 16">
      <g id="Icon_feather-trash-2" data-name="Icon feather-trash-2" transform="translate(0.5 0.5)">
        <path id="Path_68" data-name="Path 68" d="M4.5,9H18" transform="translate(-4.5 -6)" fill="none" stroke="#4c5357" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
        <path id="Path_69" data-name="Path 69" d="M18.572,6V16.5A1.542,1.542,0,0,1,16.99,18H9.082A1.542,1.542,0,0,1,7.5,16.5V6M9.872,6V4.5A1.542,1.542,0,0,1,11.454,3h3.163A1.542,1.542,0,0,1,16.2,4.5V6" transform="translate(-6.285 -3)" fill="none" stroke="#4c5357" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
        <path id="Path_70" data-name="Path 70" d="M15,16.5v3.643" transform="translate(-9.75 -9.199)" fill="none" stroke="#4c5357" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
        <path id="Path_71" data-name="Path 71" d="M21,16.5v3.643" transform="translate(-12.75 -9.199)" fill="none" stroke="#4c5357" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
      </g>
    </svg>
    `;

    let tileAttributes;
    this.container.addEventListener("click", (e) => {
      e.preventDefault();
      const selectedComponent = (globalThis as any).selectedComponent;
      if (!selectedComponent) return;

      const tileWrapper = selectedComponent.parent();
      const rowComponent = tileWrapper.parent();
      tileAttributes = (globalThis as any).tileMapper.getTile(
        rowComponent.getId(),
        tileWrapper.getId()
      );

      const themeManager = new ThemeManager();      

      const currentStyles = selectedComponent.getStyle();
      delete currentStyles["background-image"];
      currentStyles["background-color"] = themeManager.getThemeColor(tileAttributes?.BGColor);
           
      selectedComponent.setStyle(currentStyles);

      const el = selectedComponent.getEl();
      el.style.backgroundImage = ''; 
      el.style.backgroundColor = themeManager.getThemeColor(tileAttributes?.BGColor);

      const infoSectionManager = new InfoSectionManager();
      infoSectionManager.updateInfoTileAttributes(
        rowComponent.getId(),
        tileWrapper.getId(),
        "BGImageUrl",
        ""
      );

      infoSectionManager.updateInfoTileAttributes(
        rowComponent.getId(),
        tileWrapper.getId(),
        "Opacity",
        "0"
      );

      this.container.style.display = "none";

      const slider = document.querySelector("#slider-wrapper") as HTMLElement;
      if (slider) {
        slider.style.display = "none";
      }
    });
  }


   render(container: HTMLElement) {
     container.appendChild(this.container);
   }
  
}
