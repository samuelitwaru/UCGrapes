import Quill from "quill";
import { baseURL } from "../services/ToolBoxService";
import { Modal } from "../ui/components/Modal";
import { InfoSectionUI } from "../ui/views/InfoSectionUI";
import { randomIdGenerator } from "../utils/helpers";
import { InfoContentMapper } from "./editor/InfoContentMapper";
import { AddInfoSectionButton } from "../ui/components/AddInfoSectionButton";
import { CtaAttributes, InfoType } from "../types";

export class InfoSectionManager {
  editor: any;
  infoSectionUI: InfoSectionUI;

  constructor() {
    this.infoSectionUI = new InfoSectionUI();
    this.editor = (globalThis as any).activeEditor;
    if (!this.editor) return;
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

  addCtaButton(
    buttonHTML: string,
    ctaAttributes: CtaAttributes,
    nextSectionId?: string
  ) {
    const ctaContainer = document.createElement("div");
    ctaContainer.innerHTML = buttonHTML;
    const ctaComponent = ctaContainer.firstElementChild as HTMLElement;

    const append = this.appendComponent(buttonHTML, nextSectionId);
    if (append) {
      const infoType: InfoType = {
        InfoId: ctaComponent.id,
        InfoType: "Cta",
        InfoPositionId: nextSectionId,
        CtaAttributes: ctaAttributes,
      };

      this.addToMapper(infoType);

      // Select the component after appending
      const component = this.editor?.getWrapper().find(`#${ctaComponent.id}`)[0];
      if (component) {
        this.editor?.select(component);
      }
    }
  }

  addImage(imageUrl: string, nextSectionId?: string) {
    // console.log('addImage sectionId :>> ', nextSectionId);
    const imgUrl = `${baseURL}/Resources/UCGrapes/dist/images/default.jpg`;
    const imgContainer = this.infoSectionUI.getImage(imageUrl);
    const imageContainer = document.createElement("div");
    imageContainer.innerHTML = imgContainer;
    const imageComponent = imageContainer.firstElementChild as HTMLElement;

    const append = this.appendComponent(imgContainer, nextSectionId);
    if (append) {
      const infoType: InfoType = {
        InfoId: imageComponent.id,
        InfoType: "Image",
        InfoValue: imageUrl,
        InfoPositionId: nextSectionId,
      };

      this.addToMapper(infoType);
    }
  }

  openContentEditModal(sectionId?: string) {
    const modalBody = document.createElement("div");

    const modalContent = document.createElement("div");
    modalContent.id = "editor";
    modalContent.innerHTML = ""; // Empty content to start with
    modalContent.style.minHeight = "150px"; // Set minimum height for about three paragraphs

    const submitSection = document.createElement("div");
    submitSection.classList.add("popup-footer");
    submitSection.style.marginBottom = "-12px";

    const saveBtn = this.createButton("submit_form", "tb-btn-primary", "Save");
    saveBtn.disabled = true; // Disable save button initially
    saveBtn.style.opacity = "0.6";
    saveBtn.style.cursor = "not-allowed";

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
      title: "Description",
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
      placeholder: "Start typing here...",
    });

    // Set focus to the editor
    setTimeout(() => {
      quill.focus();
    }, 0);

    // Monitor content changes to enable/disable save button
    quill.on("text-change", () => {
      const editorContent = quill.root.innerHTML;
      // Check if editor has meaningful content (not just empty paragraphs)
      const hasContent =
        editorContent !== "<p><br></p>" && editorContent.trim() !== "";
      saveBtn.disabled = !hasContent;

      // Update button styling based on disabled state
      if (saveBtn.disabled) {
        saveBtn.style.opacity = "0.6";
        saveBtn.style.cursor = "not-allowed";
      } else {
        saveBtn.style.opacity = "1";
        saveBtn.style.cursor = "pointer";
      }
    });

    saveBtn.addEventListener("click", () => {
      const content = document.querySelector(
        "#editor .ql-editor"
      ) as HTMLElement;
      this.addDescription(content.innerHTML, sectionId);
      modal.close();
    });
    cancelBtn.addEventListener("click", () => {
      modal.close();
    });
  }

  addDescription(description: string, nextSectionId?: string) {
    const descContainer = this.infoSectionUI.getDescription(description);
    const descTempContainer = document.createElement("div");
    descTempContainer.innerHTML = descContainer;
    const descTempComponent =
      descTempContainer.firstElementChild as HTMLElement;

    const append = this.appendComponent(descContainer, nextSectionId);
    if (append) {
      const infoType: InfoType = {
        InfoId: descTempComponent.id,
        InfoType: "Description",
        InfoPositionId: nextSectionId,
        InfoValue: description,
      };

      this.addToMapper(infoType);
    }
  }

  addTile(tileHTML: string, nextSectionId?: string) {
    const tileWrapper = document.createElement("div");
    tileWrapper.innerHTML = tileHTML;
    const tileWrapperComponent = tileWrapper.firstElementChild as HTMLElement;
    const tileId = tileWrapperComponent.querySelector(".template-wrapper")?.id;

    const append = this.appendComponent(tileHTML, nextSectionId);
    if (append) {
      const infoType: InfoType = {
        InfoId: tileWrapperComponent.id,
        InfoType: "TileRow",
        InfoPositionId: nextSectionId,
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
            },
          },
        ],
      };
      this.addToMapper(infoType);

      // Select the tile
      const component = this.editor?.getWrapper().find(`#${tileId}`)[0];

      if (component) {
        const tileComponent = component.find(".template-block")[0];
        if (tileComponent) {
          this.editor?.select(tileComponent);
        }
      }
    }
  }

  updateDescription(updatedDescription: string, infoId: string) {
    const descContainer = this.infoSectionUI.getDescription(
      updatedDescription,
      infoId
    );
    const component = this.editor?.getWrapper().find(`#${infoId}`)[0];
    if (component) {
      component.replaceWith(descContainer);
      this.updateInfoMapper(infoId, {
        InfoId: infoId,
        InfoType: "Description",
        InfoValue: updatedDescription,
      });
    }
  }

  updateInfoImage(imageUrl: string, infoId?: string, sectionId?: string) {
    // console.log('updateInfoImage sectionId :>> ', sectionId);
    const imgContainer = this.infoSectionUI.getImage(imageUrl);
    const component = this.editor?.getWrapper().find(`#${infoId}`)[0];
    if (component) {
      component.replaceWith(imgContainer);
      this.updateInfoMapper(infoId || "", {
        InfoId: infoId || randomIdGenerator(15),
        InfoType: "Image",
        InfoValue: imageUrl,
      });
    } else {
      this.addImage(imageUrl, sectionId);
    }
  }

  updateInfoCtaButtonImage(imageUrl: string, infoId?: string) {
    const ctaEditor = this.editor?.getWrapper().find(`#${infoId}`)[0];
    if (ctaEditor) {
      const ctaInfoHtml = ctaEditor.getEl();
      ctaInfoHtml.style.backgroundImage = ``;
      const img = ctaEditor.find("img")[0];
      if (img && infoId) {
        img.setAttributes({ src: imageUrl });
        this.updateInfoCtaAttributes(infoId, "CtaButtonType", "Image");
        this.updateInfoCtaAttributes(infoId, "CtaButtonImgUrl", imageUrl);
      }
    }
  }

  deleteInfoImageOrDesc(infoId: string) {
    const component = this.editor?.getWrapper().find(`#${infoId}`)[0];
    if (component) {
      component.remove();
      this.removeInfoMapper(infoId);
      this.removeConsecutivePlusButtons();
      this.restoreEmptyStateIfNoSections();
    }
  }

  deleteCtaButton(infoId: string) {
    const component = this.editor?.getWrapper().find(`#${infoId}`)[0];
    if (component) {
      component.remove();
      this.removeInfoMapper(infoId);
      this.removeConsecutivePlusButtons();
      this.restoreEmptyStateIfNoSections();
    }
  }

  appendComponent(componentDiv: any, nextSectionId?: string) {
    const containerColumn = this.editor?.getWrapper()
      .find(".container-column-info")[0];
    if (!containerColumn) return false;

    const components = containerColumn.components().models;
    const isAppendingAtEnd = !nextSectionId;
    const insertionIndex = nextSectionId
      ? components.findIndex((comp: any) => comp.getId() === nextSectionId)
      : components.length;

    const addInfoSectionButton = new AddInfoSectionButton().getHTML();
    const addLastInfoSectionButton = new AddInfoSectionButton(
      false,
      true
    ).getHTML();

    // Add plus above
    const plusAbove = this.editor?.addComponents(addInfoSectionButton);
    containerColumn.append(plusAbove, { at: insertionIndex });

    // Add actual section
    const section = this.editor?.addComponents(componentDiv);
    containerColumn.append(section, { at: insertionIndex + 1 });

    // Add plus below
    const plusBelow = this.editor?.addComponents(addInfoSectionButton);
    containerColumn.append(plusBelow, { at: insertionIndex + 2 });

    // Clean up redundant pluses
    this.removeConsecutivePlusButtons();
    this.markFirstAndLastPlusButtons("first");
    this.markFirstAndLastPlusButtons("last");
    this.removeEmptyState();

    // Scroll to bottom if we added the section at the end
    if (isAppendingAtEnd) {
      setTimeout(() => {
        const editorFrame = this.editor?.getWrapper()
          .find(".content-frame-container")[0];
        if (editorFrame) {
          const editorFrameElement = editorFrame.getEl();
          editorFrameElement.scrollTo({
            top: editorFrameElement.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 0);
    }

    return true;
  }

  private addToMapper(infoType: InfoType) {
    const pageId = (globalThis as any).currentPageId;
    const infoMapper = new InfoContentMapper(pageId);
    infoMapper.addInfoType(infoType);
  }

  updateInfoCtaAttributes(infoId: string, attribute: string, value: any) {
    const infoType: InfoType = (
      globalThis as any
    ).infoContentMapper.getInfoContent(infoId);
    if (infoType) {
      const ctaAttributes = infoType.CtaAttributes;
      if (ctaAttributes) {
        this.setNestedProperty(ctaAttributes, attribute, value);
        this.updateInfoMapper(infoId, infoType);
        this.removeConsecutivePlusButtons();
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
    console.log('infoId', infoId);
    console.log('infoType', infoType);
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
    const data: any = JSON.parse(
      localStorage.getItem(`data-${pageId}`) || "{}"
    );
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

  restoreEmptyStateIfNoSections() {
    const containerColumn = this.editor?.getWrapper()
      .find(".container-column-info")[0];
    if (!containerColumn) return;

    const remainingComponents = containerColumn.components().models;
    if (remainingComponents.length <= 1) {
      // Add the default blank plus button
      const blankPlus = new AddInfoSectionButton(true).getHTML();
      const newBtn = this.editor?.addComponents(blankPlus);
      containerColumn.append(newBtn);

      // Re-apply empty state class to main container
      const contentFrameContainer = this.editor?.getWrapper()
        .find(".content-frame-container")[0];
      if (contentFrameContainer) {
        contentFrameContainer.addClass("empty-state");
        this.removeConsecutivePlusButtons();
      }
    }
  }

  private markFirstAndLastPlusButtons(position: "first" | "last") {
    const containerColumn = this.editor?.getWrapper()
      .find(".container-column-info")[0];
    if (!containerColumn) return;

    const allPlusButtons = containerColumn.find(
      ".info-section-spacing-container"
    );
    if (allPlusButtons.length === 0) return;

    // Remove relevant class from all
    const classToRemove =
      position === "first" ? "first-section" : "last-section";
    allPlusButtons.forEach((comp: any) => comp.removeClass(classToRemove));

    // Add it to the target element
    const targetPlus =
      position === "first"
        ? allPlusButtons[0]
        : allPlusButtons[allPlusButtons.length - 1];
    if (targetPlus) {
      const classToAdd =
        position === "first" ? "first-section" : "last-section";
      targetPlus.addClass(classToAdd);
      // console.log(`Marked ${position} plus button with '${classToAdd}' class:`, targetPlus.getId?.());
    }
  }

  removeConsecutivePlusButtons() {
    if (!this.editor) return;
    const containerColumn = this.editor?.getWrapper()
      .find(".container-column-info")[0];
    if (!containerColumn) return;

    let components = containerColumn.components().models;

    let i = 1; // Start from the second component
    while (i < components.length) {
      const current = components[i];
      const previous = components[i - 1];

      const currentClasses = current.getClasses();
      const previousClasses = previous.getClasses();

      const isCurrentPlus = currentClasses.includes(
        "info-section-spacing-container"
      );
      const isPreviousPlus = previousClasses.includes(
        "info-section-spacing-container"
      );

      if (isCurrentPlus && isPreviousPlus) {
        const currentId = current.getId?.();
        const component = this.editor.getWrapper().find(`#${currentId}`)[0];
        if (component) {
          component.remove();

          // Refresh components after removal
          components = containerColumn.components().models;

          // Don't increment i; re-evaluate current index
          continue;
        }
      } else if (isCurrentPlus) {
        const next = i + 1 < components.length ? components[i + 1] : null;
        const prevIsCta =
          previousClasses.includes("cta-container-child") &&
          previousClasses.includes("cta-child");
        const nextIsCta =
          next?.getClasses().includes("cta-container-child") &&
          next?.getClasses().includes("cta-child");

        const currentId = current.getId?.();
        const component = this.editor.getWrapper().find(`#${currentId}`)[0];

        if (component) {
          if (prevIsCta && nextIsCta) {
            component.addStyle({ width: "auto" });
            // console.log(`Setting width: auto for plus button: ${currentId}`);
          } else {
            component.removeStyle("width");
            // console.log(`Removing width style from plus button: ${currentId}`);
          }
        }
      }

      i++;
    }
  }

  private removeEmptyState() {
    const contentFrameContainer = this.editor
      .getWrapper()
      .find(".content-frame-container")[0];
    if (contentFrameContainer) {
      contentFrameContainer.removeClass("empty-state");
      // console.log("Removed 'empty-state' from content frame container");
    }
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
