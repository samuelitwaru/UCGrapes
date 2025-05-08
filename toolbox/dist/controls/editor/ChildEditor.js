import { EditorFrame } from "../../ui/components/editor-content/EditorFrame";
import { contentDefaultAttributes } from "../../utils/default-attributes";
import { randomIdGenerator } from "../../utils/helpers";
import { ThemeManager } from "../themes/ThemeManager";
import { UndoRedoManager } from "../toolbox/UndoRedoManager";
import { EditorEvents } from "./EditorEvents";
import { EditorManager } from "./EditorManager";
import { JSONToGrapesJSContent } from "./JSONToGrapesJSContent";
import { JSONToGrapesJSInformation } from "./JSONToGrapesJSInformation";
import { JSONToGrapesJSMenu } from "./JSONToGrapesJSMenu";
import { LoadCalendarData } from "./LoadCalendarData";
import { LoadLocationData } from "./LoadLocationData";
import { LoadMyActivityData } from "./LoadMyActivityData";
import { LoadReceptionData } from "./LoadReceptionData";
import { MapsPageEditor } from "./MapsPageEditor";
import { UrlPageEditor } from "./UrlPageEditor";
export class ChildEditor {
    constructor(pageId, pageData) {
        this.pageId = pageId;
        this.pageData = pageData;
        this.themeManager = new ThemeManager();
        this.editorManager = new EditorManager();
        this.editorEvents = new EditorEvents();
    }
    init(tileAttributes) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        let editorId = `gjs-${this.getEditorId()}`;
        this.pageTitle = (_a = this.pageData) === null || _a === void 0 ? void 0 : _a.PageName;
        this.createNewEditor(editorId);
        const childEditor = this.editorManager.initializeGrapesEditor(editorId);
        window.app.editors[editorId] = childEditor;
        const setUpEditor = (converter) => {
            if (converter) {
                const htmlOutput = converter.generateHTML();
                childEditor.setComponents(htmlOutput);
                localStorage.setItem(`data-${this.pageId}`, JSON.stringify(this.pageData));
            }
            else {
                console.error("Invalid PageType or pageData is undefined:", this.pageData);
            }
        };
        let converter;
        if (((_b = this.pageData) === null || _b === void 0 ? void 0 : _b.PageType) === "Menu" ||
            ((_c = this.pageData) === null || _c === void 0 ? void 0 : _c.PageType) === "MyLiving" ||
            ((_d = this.pageData) === null || _d === void 0 ? void 0 : _d.PageType) === "MyCare" ||
            ((_e = this.pageData) === null || _e === void 0 ? void 0 : _e.PageType) === "MyService") {
            converter = new JSONToGrapesJSMenu(this.pageData);
            setUpEditor(converter);
        }
        else if (((_f = this.pageData) === null || _f === void 0 ? void 0 : _f.PageType) === "Information") {
            converter = new JSONToGrapesJSInformation(this.pageData);
            setUpEditor(converter);
        }
        else if (((_g = this.pageData) === null || _g === void 0 ? void 0 : _g.PageType) === "Location") {
            const locationEditor = new LoadLocationData(childEditor, this.pageData);
            locationEditor.setupEditor();
        }
        else if (((_h = this.pageData) === null || _h === void 0 ? void 0 : _h.PageType) === "Reception") {
            const receptionEditor = new LoadReceptionData(childEditor, this.pageData);
            receptionEditor.setupEditor();
        }
        else if (((_j = this.pageData) === null || _j === void 0 ? void 0 : _j.PageType) === "Content") {
            converter = new JSONToGrapesJSContent(this.pageData);
            setUpEditor(converter);
        }
        else if (((_k = this.pageData) === null || _k === void 0 ? void 0 : _k.PageType) === "WebLink" ||
            ((_l = this.pageData) === null || _l === void 0 ? void 0 : _l.PageType) === "DynamicForm") {
            const urlPageEditor = new UrlPageEditor(childEditor);
            urlPageEditor.initialise(tileAttributes.Action);
        }
        else if (((_m = this.pageData) === null || _m === void 0 ? void 0 : _m.PageType) === "Map") {
            const mapsPageEditor = new MapsPageEditor(childEditor);
            mapsPageEditor.initialise(tileAttributes.Action);
        }
        else if (((_o = this.pageData) === null || _o === void 0 ? void 0 : _o.PageType) === "MyActivity") {
            const activityEditor = new LoadMyActivityData(childEditor);
            activityEditor.load();
        }
        else if (((_p = this.pageData) === null || _p === void 0 ? void 0 : _p.PageType) === "Calendar") {
            const calendarEditor = new LoadCalendarData(childEditor);
            calendarEditor.load();
        }
        this.editorEvents.init(childEditor, this.pageData, editorId);
        this.editorManager.finalizeEditorSetup(childEditor);
        new UndoRedoManager(this.pageData.PageId);
        this.themeManager.applyTheme(this.themeManager.currentTheme);
    }
    createNewEditor(editorId) {
        const frameContainer = document.getElementById("child-container");
        const newEditor = new EditorFrame(editorId, false, this.pageData, this.pageTitle);
        newEditor.render(frameContainer);
    }
    getEditorId() {
        let id = 0;
        const framelist = document.querySelectorAll(".mobile-frame");
        framelist.forEach((frame) => {
            id++;
        });
        return id;
    }
    addImageContent(editor) {
        const components = editor.DomComponents.getWrapper().find(".content-page-wrapper");
        if (components.length > 0) {
            const contentWrapper = components[0];
            contentWrapper.append(`
      <img ${contentDefaultAttributes} id="${randomIdGenerator(5)}" data-gjs-type="product-service-image" draggable="true" src="https://plus.unsplash.com/premium_photo-1686949554005-78d1370ab4f3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2fHx8ZW58MHx8fHx8" alt="Product Service Image" class="content-page-block">
      `);
        }
    }
    addDescriptionContent(editor) {
        const components = editor.DomComponents.getWrapper().find(".content-page-wrapper");
        if (components.length > 0) {
            const contentWrapper = components[0];
            contentWrapper.append(`
      <div ${contentDefaultAttributes} id="${randomIdGenerator(5)}" data-gjs-type="product-service-description" draggable="true" class="content-page-block">
          lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
      </div>
      `);
        }
    }
    updateFrame() {
        this.editorEvents.removeOtherEditors();
        this.editorEvents.activateNavigators();
    }
}
//# sourceMappingURL=ChildEditor.js.map