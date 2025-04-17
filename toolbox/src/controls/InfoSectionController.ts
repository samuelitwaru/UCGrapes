import { InfoType } from "../interfaces/InfoType";
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

  addCtaButton(buttonHTML: string) {
    const ctaContainer = document.createElement("div");
    ctaContainer.innerHTML = buttonHTML;

    const append = this.appendComponent(buttonHTML);
    if (append) {
      const infoType: InfoType = {
        InfoId: randomIdGenerator(15),
        InfoType: "Cta",
        CtaAttributes: {
          CtaId: randomIdGenerator(15),
          CtaType: "Phone",
          CtaLabel: "Phone",
          CtaAction: "",
          CtaColor: "#ffffff",
          CtaBGColor: "CtaColorOne",
          CtaButtonType: "Image",
          CtaButtonImgUrl: "/Resources/UCGrapes1/src/images/image.png"
        }
      };

      this.addToMapper(infoType);
    }
  }

  addImage() {
    const imgUrl = `${baseURL}/Resources/UCGrapes1/toolbox/public/images/default.jpg`;
    const imgContainer = this.infoSectionUI.getImage(imgUrl);

    const append = this.appendComponent(imgContainer);
    if (append) {
      const infoType: InfoType = {
        InfoId: randomIdGenerator(15),
        InfoType: "Image",
        InfoValue: "Resources/UCGrapes1/toolbox/public/images/default.jpg",
      };

      this.addToMapper(infoType);
    }
  }

  addDescription(description: string) {
    const descContainer = this.infoSectionUI.getDescription(description);

    const append = this.appendComponent(descContainer);
    if (append) {
      const infoType: InfoType = {
        InfoId: randomIdGenerator(15),
        InfoType: "Description",
        InfoValue: description,
      };

      this.addToMapper(infoType);
    }
  }

  addTile(tile: string) {
    this.appendComponent(tile);
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
        img.setAttributes({"src":imageUrl});
        const infoType: InfoType = {
          InfoId: infoId || randomIdGenerator(15),
          InfoType: "Cta",
          CtaAttributes: {
            CtaId: randomIdGenerator(15),
            CtaType: "Phone",
            CtaLabel: "Phone",
            CtaAction: "",
            CtaColor: "#ffffff",
            CtaBGColor: "CtaColorOne",
            CtaButtonType: "Image",
            CtaButtonImgUrl: imageUrl
          }
        };
        this.updateInfoMapper(infoId || "", infoType);
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
    const infoMapper = new InfoContentMapper(pageId)
    infoMapper.addInfoType(infoType);
  }

  private updateInfoMapper(infoId: string, infoType: InfoType) {
    const pageId = (globalThis as any).currentPageId;
    const infoMapper = new InfoContentMapper(pageId)
    infoMapper.updateInfoContent(infoId, infoType);
  }

  private removeInfoMapper(infoId: string) {
    const pageId = (globalThis as any).currentPageId;
    const infoMapper = new InfoContentMapper(pageId)
    infoMapper.removeInfoContent(infoId);
  }
}
