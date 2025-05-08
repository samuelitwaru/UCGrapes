import { CtaAttributes } from "../interfaces/CtaAttributes";
import { InfoType } from "../interfaces/InfoType";
import { Tile } from "../interfaces/Tile";
import { baseURL } from "../services/ToolBoxService";
import { InfoSectionUI } from "../ui/views/InfoSectionUI";
import {
  contentColumnDefaultAttributes,
  contentDefaultAttributes,
  DefaultAttributes,
} from "../utils/default-attributes";
import { randomIdGenerator } from "../utils/helpers";
import { InfoContentMapper } from "./editor/InfoContentMapper";

export class InfoSectionController {
  editor: any;
  infoSectionUI: InfoSectionUI;

  constructor() {
    this.infoSectionUI = new InfoSectionUI();
    this.editor = (globalThis as any).activeEditor;
  }

  createMenuItem(item: any, onCloseCallback?: () => void): HTMLElement {
    const menuItem = document.createElement("li");
    menuItem.classList.add("menu-item");
    menuItem.innerHTML =
      item.label.length > 20 ? item.label.substring(0, 20) + "..." : item.label;
    menuItem.setAttribute("data-name", item.name || "");
    menuItem.addEventListener("click", (e) => {
      e.stopPropagation();
      if (item.action) {
        item.action();
        if (onCloseCallback) {
          onCloseCallback();
        }
      }
      const infoMenuContainer = menuItem.parentElement
        ?.parentElement as HTMLElement;
      infoMenuContainer.remove();
    });
    menuItem.id = item.id;
    return menuItem;
  }

  addCtaButton(buttonHTML: string, ctaAttributes: CtaAttributes) {
    const ctaContainer = document.createElement("div");
    ctaContainer.innerHTML = buttonHTML;
    const ctaComponent = ctaContainer.firstElementChild as HTMLElement;

    const append = this.appendComponent(buttonHTML);
    if (append) {
      const infoType: InfoType = {
        InfoId: ctaComponent.id,
        InfoType: "Cta",
        CtaAttributes: ctaAttributes,
      };

      this.addToMapper(infoType);
    }
  }

  addImage() {
    const imgUrl = `${baseURL}/Resources/UCGrapes1/toolbox/public/images/default.jpg`;
    const imgContainer = this.infoSectionUI.getImage(imgUrl);
    const imageContainer = document.createElement("div");
    imageContainer.innerHTML = imgContainer;
    const imageComponent = imageContainer.firstElementChild as HTMLElement;

    const append = this.appendComponent(imgContainer);
    if (append) {
      const infoType: InfoType = {
        InfoId: imageComponent.id,
        InfoType: "Image",
        InfoValue: "Resources/UCGrapes1/toolbox/public/images/default.jpg",
      };

      this.addToMapper(infoType);
    }
  }
  addMultipleImages(imgUrl: string[]) {
   // const imgUrl = `${baseURL}/Resources/UCGrapes1/toolbox/public/images/default.jpg`;
    const imgContainer = this.infoSectionUI.getMultipleImages(imgUrl);
    const imageContainer = document.createElement("div");
    imageContainer.innerHTML = imgContainer;
    const imageComponent = imageContainer.firstElementChild as HTMLElement;

    const append = this.appendComponent(imgContainer);
    if (append) {
      let slideIndex = 0;
      showSlides();
      
      function showSlides() {
        let i;
        let slides = (globalThis as any).wrapper.find(".mySlides");
        console.log((globalThis as any).wrapper)
        for (i = 0; i < slides.length; i++) {
          slides[i].getEl().style.display = "none";
        }
        slideIndex++;
        if (slideIndex > slides.length) {slideIndex = 1}
        slides[slideIndex-1].getEl().style.display = "block";
        setTimeout(showSlides, 2000); // Change image every 2 seconds
      }
      const infoType: InfoType = {
        InfoId: imageComponent.id,
        InfoType: "Image",
        InfoValue: "Resources/UCGrapes1/toolbox/public/images/default.jpg",
      };

      this.addToMapper(infoType);
       /*  let slideIndex: number = 1;
      showSlides(slideIndex);
      
      // Next/previous controls
      function plusSlides(n:number) {
        showSlides(slideIndex += n);
      }
      
      // Thumbnail image controls
      function currentSlide(n:number) {
        showSlides(slideIndex = n);
      } */
      
    /*   function showSlides(n:number) {
        let i;
        //console.log((globalThis as any).wrapper.find(".mySlides"))

        (globalThis as any).wrapper.find(".mySlides").forEach((slide: any) => {
          slide.getEl()
        })


        let slides = (globalThis as any).wrapper.find(".mySlides");
        console.log(slides[1].getEl())
        //let slides = document.getElementsByClassName("mySlides");
        console.log(slides.length)
        //let dots = document.getElementsByClassName("dot");
        let dots = (globalThis as any).wrapper.find(".dot")
        
        if (n > slides.length) {slideIndex = 1}
  
        if (n < 1) {slideIndex = slides.length}
        
        for (i = 0; i < slides.length; i++) {
          slides[i].getEl().style.display = "none";
          console.log(slides[i].getEl().style.display)
        }
        for (i = 0; i < dots.length; i++) {
          dots[i].className = dots[i].getEl().className.replace(" active", "");
        }
        //slides[slideIndex-1].getEl().className += 'visible';
        slides[slideIndex-1].getEl().style.display = "block";
        console.log(slides[slideIndex-1].getEl().style.display)
        //dots[slideIndex-1].getEl().className += " active";
      } */


    }
  }

  

  addDescription(description: string) {
    const descContainer = this.infoSectionUI.getDescription(description);
    const descTempContainer = document.createElement("div");
    descTempContainer.innerHTML = descContainer;
    const descTempComponent = descTempContainer.firstElementChild as HTMLElement;

    const append = this.appendComponent(descContainer);
    if (append) {
      const infoType: InfoType = {
        InfoId: descTempComponent.id,
        InfoType: "Description",
        InfoValue: description,
      };

      this.addToMapper(infoType);
    }
  }

  addTile(tileHTML: string) {
    const tileWrapper = document.createElement("div");
    tileWrapper.innerHTML = tileHTML;
    const tileWrapperComponent = tileWrapper.firstElementChild as HTMLElement;
    const tileId = tileWrapperComponent.querySelector(".template-wrapper")?.id

    const append = this.appendComponent(tileHTML);
    if (append) {
      const infoType: InfoType = {
        InfoId: tileWrapperComponent.id,
        InfoType: "TileRow",
        Tiles: [
          {
            Id: tileId || randomIdGenerator(15),
            Name: "Title",
            Text: "Title",
            Color: "#333333",
            Align: "left",
            BGSize: 1,
            BGPosition: 1,
            Action: {
              ObjectType: "",
              ObjectId: "",
              ObjectUrl: "",
            }
          },
        ],
      };
      this.addToMapper(infoType);
    }
  }

  updateDescription(updatedDescription: string, infoId: string) {
    const descContainer = this.infoSectionUI.getDescription(updatedDescription);
    const component = this.editor.getWrapper().find(`#${infoId}`)[0];
    if (component) {
      component.replaceWith(descContainer);
      this.updateInfoMapper(infoId, {
        InfoId: infoId,
        InfoType: "Description",
        InfoValue: updatedDescription,
      });
    }
  }

  updateInfoImage(imageUrl: string, infoId?: string) {
    const imgContainer = this.infoSectionUI.getImage(imageUrl);
    const component = this.editor.getWrapper().find(`#${infoId}`)[0];
    if (component) {
      component.replaceWith(imgContainer);
      this.updateInfoMapper(infoId || "", {
        InfoId: infoId || randomIdGenerator(15),
        InfoType: "Image",
        InfoValue: imageUrl,
      });
    }
  }

  updateInfoCtaButtonImage(imageUrl: string, infoId?: string) {
    const ctaEditor = this.editor.getWrapper().find(`#${infoId}`)[0];
    if (ctaEditor) {
      const img = ctaEditor.find("img")[0];
      if (img) {
        if (infoId) {
          img.setAttributes({ src: imageUrl });
          this.updateInfoCtaAttributes(infoId, "CtaButtonType", "Image")
          this.updateInfoCtaAttributes(infoId, "CtaButtonImgUrl", imageUrl)
        }
      }
    }
  }

  deleteInfoImageOrDesc(infoId: string) {
    const component = this.editor.getWrapper().find(`#${infoId}`)[0];
    if (component) {
      component.remove();
      this.removeInfoMapper(infoId);
    }
  }

  deleteCtaButton(infoId: string) {
    const component = this.editor.getWrapper().find(`#${infoId}`)[0];
    if (component) {
      component.remove();
      this.removeInfoMapper(infoId);
    }
  }

  appendComponent(componentDiv: any) {
    const containerColumn = this.editor
      .getWrapper()
      .find(".container-column-info")[0];

    if (containerColumn) {
      const component = this.editor.addComponents(componentDiv);
      const position = containerColumn.components().length + 1;
      containerColumn.append(component, { at: position });

      return true;
    }

    return false;
  }

  private addToMapper(infoType: InfoType) {
    const pageId = (globalThis as any).currentPageId;
    const infoMapper = new InfoContentMapper(pageId);
    infoMapper.addInfoType(infoType);
  }

  updateInfoCtaAttributes(infoId: string, attribute: string, value: any) {
    const infoType: InfoType = (globalThis as any).infoContentMapper.getInfoContent(
      infoId
    );
    if (infoType) {
      const ctaAttributes = infoType.CtaAttributes;
      if (ctaAttributes) {
        this.setNestedProperty(ctaAttributes, attribute, value);
        this.updateInfoMapper(infoId, infoType);
      }
    }
  }

  updateInfoTileAttributes(
    infoId: string,
    tileId: string,
    attributePath: string, // accepts dot notation
    value: any
  ) {
    const tileInfoSectionAttributes: InfoType = (
      globalThis as any
    ).infoContentMapper.getInfoContent(infoId);

    if (tileInfoSectionAttributes) {
      const tile = tileInfoSectionAttributes.Tiles?.find(
        (tile) => tile.Id === tileId
      );
      if (tile) {
        this.setNestedProperty(tile, attributePath, value);
      }

      this.updateInfoMapper(infoId, tileInfoSectionAttributes);
    }
  }

  setNestedProperty(obj: any, path: string, value: any) {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];

      if (!(key in current)) {
        current[key] = {}; // create if not exists
      }

      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  updateInfoMapper(infoId: string, infoType: InfoType) {
    const pageId = (globalThis as any).currentPageId;
    const infoMapper = new InfoContentMapper(pageId);
    infoMapper.updateInfoContent(infoId, infoType);
    this.removeEmptyRows(pageId);
  }

  private removeInfoMapper(infoId: string) {
    const pageId = (globalThis as any).currentPageId;
    const infoMapper = new InfoContentMapper(pageId);
    infoMapper.removeInfoContent(infoId);
  }

  private removeEmptyRows(pageId: string) {
    const data: any = JSON.parse(localStorage.getItem(`data-${pageId}`) || "{}");
    if (data?.PageInfoStructure?.InfoContent) {
      data.PageInfoStructure.InfoContent.forEach((infoContent: any) => {
        if (infoContent?.InfoType === "TileRow") {
          if (!infoContent.Tiles || infoContent.Tiles.length === 0) {
            this.removeInfoMapper(infoContent.InfoId);
          }
        }
      });
    }
  }
}
