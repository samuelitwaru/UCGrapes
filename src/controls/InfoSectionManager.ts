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
      const component = this.editor
        ?.getWrapper()
        .find(`#${ctaComponent.id}`)[0];
      if (component) {
        this.editor?.select(component);
      }
    }
  }

  addImage(imageUrl: string, nextSectionId?: string) {
    // console.log('addImage nextSectionId', nextSectionId);
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

  addMultipleImages(
    selectedImages: Array<{ Id: string; Url: string }> = [],
    isUpdating: boolean = false,
    infoId?: string,
    nextSectionId?: string
  ) {
    // console.log('addMultipleImages nextSectionId', nextSectionId);
    console.log("Selected images: ", selectedImages);
    const imgContainer = this.infoSectionUI.getMultipleImages(
      selectedImages.map((img) => img.Url),
      isUpdating,
      infoId
    );
    const imageContainer = document.createElement("div");
    imageContainer.innerHTML = imgContainer;
    const imageComponent = imageContainer.firstElementChild as HTMLElement;

    if (isUpdating) {
      const component = this.editor?.getWrapper().find(`#${infoId}`)[0];
      if (component) {
        component.replaceWith(imgContainer);
        this.updateInfoMapper(infoId || "", {
          InfoId: imageComponent.id,
          InfoType: "Images",
          Images: selectedImages.map((img) => ({
            InfoImageId: `id-${img.Id}` || randomIdGenerator(15),
            InfoImageValue: img.Url,
          })),
        });
      }
    } else {
      const append = this.appendComponent(imgContainer, nextSectionId);
      if (append) {
        const infoType: InfoType = {
          InfoId: imageComponent.id,
          InfoType: "Images",
          InfoPositionId: nextSectionId,
          Images: selectedImages.map((img) => ({
            InfoImageId: `id-${img.Id}` || randomIdGenerator(15),
            InfoImageValue: img.Url,
          })),
        };

        this.addToMapper(infoType);
      }
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

    const characterCounterSection = document.createElement("div");
    characterCounterSection.classList.add("row");
    const characterCounterSpan = document.createElement("span");
    characterCounterSection.style.paddingLeft = "20px";
    characterCounterSpan.style.fontSize = "small";
    characterCounterSpan.style.fontStyle = "italic";
    characterCounterSection.appendChild(characterCounterSpan);
    characterCounterSpan.innerHTML = "0/1000";

    submitSection.appendChild(saveBtn);
    submitSection.appendChild(cancelBtn);

    modalBody.appendChild(modalContent);
    modalBody.appendChild(characterCounterSection);
    modalBody.appendChild(submitSection);

    const modal = new Modal({
      title: "Description",
      width: "500px",
      body: modalBody,
    });
    modal.open();

    const Delta = Quill.import('delta');
    const quill = new Quill("#editor", {
      formats: [
        'bold',
        'italic',
        'underline',
        'link',
        'list'
      ],
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "link"],
          [{ list: "ordered" }, { list: "bullet" }],
        ],
        clipboard: {
          matchers: [
            [ 
              Node.ELEMENT_NODE,
              (node: Node, delta: any) => {
                return delta.compose(new Delta().retain(delta.length(), {
                  background: false,
                  color: false,
                  font: false,
                  code: false,
                  size: false,
                  strike: false,
                  script: false,
                  blockquote: false,
                  header: false,
                  indent: false,
                  align: false,
                  direction: false,
                  formula: false,
                  image: false,
                  video: false
                }));
              }
            ] 
          ]
        }
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

      if (quill.getLength() > 1000) {
        quill.deleteText(1000, quill.getLength());
        characterCounterSpan
        characterCounterSpan.innerHTML = "1000/1000"
        //console.log("InfoSectionManager");
      } else {
        const textLeft = quill.getLength() - 1;
        characterCounterSpan.innerHTML = textLeft + "/1000"
      }

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
      console.log('component deleteInfoImageOrDesc', component);
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
    // console.log('appendComponent nextSectionId', nextSectionId);
    const containerColumn = this.editor
      ?.getWrapper()
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
        const editorFrame = this.editor
          ?.getWrapper()
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
    const infoType: InfoType | null = this.getInfoContent(infoId);
    if (infoType) {
      const ctaAttributes = infoType.CtaAttributes;
      if (ctaAttributes) {
        this.setNestedProperty(ctaAttributes, attribute, value);
        this.updateInfoMapper(infoId, infoType);
        this.removeConsecutivePlusButtons();
      }
    }
  }

  getInfoContent(infoId: string) {
    const pageId = (globalThis as any).currentPageId;
    const infoMapper = new InfoContentMapper(pageId);
    const infoContent: InfoType | null = infoMapper.getInfoContent(infoId);

    return infoContent;
  }

  updateInfoTileAttributes(
    infoId: string,
    tileId: string,
    attributePath: string, // accepts dot notation
    value: any
  ) {
    const pageId = (globalThis as any).currentPageId;
    const tileInfoSectionAttributes = this.getInfoContent(infoId);
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
    const containerColumn = this.editor
      ?.getWrapper()
      .find(".container-column-info")[0];
    if (!containerColumn) return;

    const remainingComponents = containerColumn.components().models;
    if (remainingComponents.length <= 1) {
      // Add the default blank plus button
      const blankPlus = new AddInfoSectionButton(true).getHTML();
      const newBtn = this.editor?.addComponents(blankPlus);
      containerColumn.append(newBtn);

      // Re-apply empty state class to main container
      const contentFrameContainer = this.editor
        ?.getWrapper()
        .find(".content-frame-container")[0];
      if (contentFrameContainer) {
        contentFrameContainer.addClass("empty-state");
        this.removeConsecutivePlusButtons();
      }
    }
  }

  markFirstAndLastPlusButtons(position: "first" | "last") {
    const containerColumn = this.editor
      ?.getWrapper()
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

  removeConsecutivePlusButtons(editor: any = this.editor) {
    if (!editor) return;
    const containerColumn = editor
      ?.getWrapper()
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
        const component = editor.getWrapper().find(`#${currentId}`)[0];
        if (component) {
          component.remove();
          // Refresh components after removal
          components = containerColumn.components().models;

          // Don't increment i; re-evaluate current index
          continue;
        }
      }

      i++;
    }
    this.updateRoundCtaWidths(editor);
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

  private updateRoundCtaWidths(editor: any = this.editor) {
    if (!editor) return;
    const containerColumn = editor
      ?.getWrapper()
      .find(".container-column-info")[0];
    if (!containerColumn) return;

    const components = containerColumn.components().models;

    // Check if there are any CTA sections
    const hasCta = components.some((comp: any) => {
      const classes = comp.getClasses();
      return classes.includes("cta-container-child") && classes.includes("cta-child");
    });
    if (!hasCta) return;

    // --- Update width of plus buttons between CTAs ---
    for (let i = 0; i < components.length; i++) {
      const current = components[i];
      const currentClasses = current.getClasses();
      if (currentClasses.includes("info-section-spacing-container")) {
        const previous = i > 0 ? components[i - 1] : null;
        const next = i + 1 < components.length ? components[i + 1] : null;
        const prevIsCta =
          previous &&
          previous.getClasses().includes("cta-container-child") &&
          previous.getClasses().includes("cta-child");
        const nextIsCta =
          next &&
          next.getClasses().includes("cta-container-child") &&
          next.getClasses().includes("cta-child");

        const currentId = current.getId?.();
        const componentEl = editor.getWrapper().find(`#${currentId}`)[0];

        if (componentEl) {
          if (prevIsCta && nextIsCta) {
            componentEl.addStyle({ width: "auto" });
          } else {
            componentEl.removeStyle("width");
          }
        }
      }
    }

    // Collect indices of all CTA components
    const ctaIndices: number[] = [];
    components.forEach((comp: any, idx: number) => {
      const classes = comp.getClasses();
      if (classes.includes("cta-container-child") && classes.includes("cta-child")) {
        ctaIndices.push(idx);
      }
    });

    // Group consecutive CTA indices (ignoring only plus buttons in between)
    let group: number[] = [];
    const groups: number[][] = [];
    for (let i = 0; i < ctaIndices.length; i++) {
      if (group.length === 0) {
        group.push(ctaIndices[i]);
      } else {
        // Check if only plus buttons are between this and the previous CTA
        let onlyPlusBetween = true;
        for (let j = ctaIndices[i - 1] + 1; j < ctaIndices[i]; j++) {
          const betweenClasses = components[j].getClasses();
          if (!betweenClasses.includes("info-section-spacing-container")) {
            onlyPlusBetween = false;
            break;
          }
        }
        if (onlyPlusBetween) {
          group.push(ctaIndices[i]);
        } else {
          groups.push(group);
          group = [ctaIndices[i]];
        }
      }
    }
    if (group.length) groups.push(group);

    // console.log('groups', groups);

    // Now split any group longer than 3 into groups of max 3
    const splitGroups: number[][] = [];
    groups.forEach(g => {
      for (let i = 0; i < g.length; i += 3) {
        splitGroups.push(g.slice(i, i + 3));
      }
    });

    // console.log('splitGroups', splitGroups);

    // Apply widths
    splitGroups.forEach(indices => {
      if (indices.length === 1) {
        // Single CTA
        const comp = components[indices[0]];
        const ctaId = comp.getId?.();
        const ctaEl = editor.getWrapper().find(`#${ctaId}`)[0];
        if (ctaEl) {
          ctaEl.addStyle({ width: "100%" });
          ctaEl.addClass("cta-width-full");
          ctaEl.removeClass("cta-width-medium");
          ctaEl.removeClass("cta-width-small");
        }
      } else if (indices.length === 2) {
        // Two consecutive CTAs
        indices.forEach(idx => {
          const comp = components[idx];
          const ctaId = comp.getId?.();
          const ctaEl = editor.getWrapper().find(`#${ctaId}`)[0];
          if (ctaEl) {
            ctaEl.addStyle({ width: "40%" });
            ctaEl.addClass("cta-width-medium");
            ctaEl.removeClass("cta-width-full");
            ctaEl.removeClass("cta-width-small");
          }
        });
      } else if (indices.length === 3) {
        // Three consecutive CTAs
        indices.forEach(idx => {
          const comp = components[idx];
          const ctaId = comp.getId?.();
          const ctaEl = editor.getWrapper().find(`#${ctaId}`)[0];
          if (ctaEl) {
            ctaEl.addStyle({ width: "calc(100% / 4.5)" });
            ctaEl.addClass("cta-width-small");
            ctaEl.removeClass("cta-width-full");
            ctaEl.removeClass("cta-width-medium");
          }
        });
      }
    });
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
