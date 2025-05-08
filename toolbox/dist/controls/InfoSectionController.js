import { baseURL } from "../services/ToolBoxService";
import { InfoSectionUI } from "../ui/views/InfoSectionUI";
import { randomIdGenerator } from "../utils/helpers";
import { InfoContentMapper } from "./editor/InfoContentMapper";
export class InfoSectionController {
    constructor() {
        this.infoSectionUI = new InfoSectionUI();
        this.editor = globalThis.activeEditor;
    }
    createMenuItem(item, onCloseCallback) {
        const menuItem = document.createElement("li");
        menuItem.classList.add("menu-item");
        menuItem.innerHTML =
            item.label.length > 20 ? item.label.substring(0, 20) + "..." : item.label;
        menuItem.setAttribute("data-name", item.name || "");
        menuItem.addEventListener("click", (e) => {
            var _a;
            e.stopPropagation();
            if (item.action) {
                item.action();
                if (onCloseCallback) {
                    onCloseCallback();
                }
            }
            const infoMenuContainer = (_a = menuItem.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
            infoMenuContainer.remove();
        });
        menuItem.id = item.id;
        return menuItem;
    }
    addCtaButton(buttonHTML, ctaAttributes) {
        const ctaContainer = document.createElement("div");
        ctaContainer.innerHTML = buttonHTML;
        const ctaComponent = ctaContainer.firstElementChild;
        const append = this.appendComponent(buttonHTML);
        if (append) {
            const infoType = {
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
        const imageComponent = imageContainer.firstElementChild;
        const append = this.appendComponent(imgContainer);
        if (append) {
            const infoType = {
                InfoId: imageComponent.id,
                InfoType: "Image",
                InfoValue: "Resources/UCGrapes1/toolbox/public/images/default.jpg",
            };
            this.addToMapper(infoType);
        }
    }
    addDescription(description) {
        const descContainer = this.infoSectionUI.getDescription(description);
        const descTempContainer = document.createElement("div");
        descTempContainer.innerHTML = descContainer;
        const descTempComponent = descTempContainer.firstElementChild;
        const append = this.appendComponent(descContainer);
        if (append) {
            const infoType = {
                InfoId: descTempComponent.id,
                InfoType: "Description",
                InfoValue: description,
            };
            this.addToMapper(infoType);
        }
    }
    addTile(tileHTML) {
        var _a;
        const tileWrapper = document.createElement("div");
        tileWrapper.innerHTML = tileHTML;
        const tileWrapperComponent = tileWrapper.firstElementChild;
        const tileId = (_a = tileWrapperComponent.querySelector(".template-wrapper")) === null || _a === void 0 ? void 0 : _a.id;
        const append = this.appendComponent(tileHTML);
        if (append) {
            const infoType = {
                InfoId: tileWrapperComponent.id,
                InfoType: "TileRow",
                Tiles: [
                    {
                        Id: tileId || randomIdGenerator(15),
                        Name: "Title",
                        Text: "Title",
                        Color: "#333333",
                        Align: "left",
                    },
                ],
            };
            this.addToMapper(infoType);
        }
    }
    updateDescription(updatedDescription, infoId) {
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
    updateInfoImage(imageUrl, infoId) {
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
    updateInfoCtaButtonImage(imageUrl, infoId) {
        const ctaEditor = this.editor.getWrapper().find(`#${infoId}`)[0];
        if (ctaEditor) {
            const img = ctaEditor.find("img")[0];
            if (img) {
                img.setAttributes({ src: imageUrl });
                const infoType = {
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
                        CtaButtonImgUrl: imageUrl,
                    },
                };
                this.updateInfoMapper(infoId || "", infoType);
            }
        }
    }
    deleteInfoImageOrDesc(infoId) {
        const component = this.editor.getWrapper().find(`#${infoId}`)[0];
        if (component) {
            component.remove();
            this.removeInfoMapper(infoId);
        }
    }
    deleteCtaButton(infoId) {
        const component = this.editor.getWrapper().find(`#${infoId}`)[0];
        if (component) {
            component.remove();
            this.removeInfoMapper(infoId);
        }
    }
    appendComponent(componentDiv) {
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
    addToMapper(infoType) {
        const pageId = globalThis.currentPageId;
        const infoMapper = new InfoContentMapper(pageId);
        infoMapper.addInfoType(infoType);
    }
    updateInfoCtaAttributes(infoId, attribute, value) {
        const infoType = globalThis.infoContentMapper.getInfoContent(infoId);
        if (infoType) {
            const ctaAttributes = infoType.CtaAttributes;
            if (ctaAttributes) {
                this.setNestedProperty(ctaAttributes, attribute, value);
                this.updateInfoMapper(infoId, infoType);
            }
        }
    }
    updateInfoTileAttributes(infoId, tileId, attributePath, // accepts dot notation
    value) {
        var _a;
        const tileInfoSectionAttributes = globalThis.infoContentMapper.getInfoContent(infoId);
        if (tileInfoSectionAttributes) {
            const tile = (_a = tileInfoSectionAttributes.Tiles) === null || _a === void 0 ? void 0 : _a.find((tile) => tile.Id === tileId);
            if (tile) {
                this.setNestedProperty(tile, attributePath, value);
            }
            this.updateInfoMapper(infoId, tileInfoSectionAttributes);
        }
    }
    setNestedProperty(obj, path, value) {
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
    updateInfoMapper(infoId, infoType) {
        const pageId = globalThis.currentPageId;
        const infoMapper = new InfoContentMapper(pageId);
        infoMapper.updateInfoContent(infoId, infoType);
        this.removeEmptyRows(pageId);
    }
    removeInfoMapper(infoId) {
        const pageId = globalThis.currentPageId;
        const infoMapper = new InfoContentMapper(pageId);
        infoMapper.removeInfoContent(infoId);
    }
    removeEmptyRows(pageId) {
        var _a;
        const data = JSON.parse(localStorage.getItem(`data-${pageId}`) || "{}");
        if ((_a = data === null || data === void 0 ? void 0 : data.PageInfoStructure) === null || _a === void 0 ? void 0 : _a.InfoContent) {
            data.PageInfoStructure.InfoContent.forEach((infoContent) => {
                if ((infoContent === null || infoContent === void 0 ? void 0 : infoContent.InfoType) === "TileRow") {
                    if (!infoContent.Tiles || infoContent.Tiles.length === 0) {
                        this.removeInfoMapper(infoContent.InfoId);
                    }
                }
            });
        }
    }
}
//# sourceMappingURL=InfoSectionController.js.map