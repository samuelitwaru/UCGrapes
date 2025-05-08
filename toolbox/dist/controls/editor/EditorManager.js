var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AppConfig } from "../../AppConfig";
import { ToolBoxService } from "../../services/ToolBoxService";
import { FrameList } from "../../ui/components/editor-content/FrameList";
import { LeftNavigatorButton } from "../../ui/components/editor-content/LeftNavigatorButton";
import { RightNavigatorButton } from "../../ui/components/editor-content/RightNavigatorButton";
import { ThemeManager } from "../themes/ThemeManager";
import { UndoRedoManager } from "../toolbox/UndoRedoManager";
import { AppVersionManager } from "../versions/AppVersionManager";
import { EditorEvents } from "./EditorEvents";
import { JSONToGrapesJSMenu } from "./JSONToGrapesJSMenu";
export class EditorManager {
    constructor() {
        this.editors = [];
        this.config = AppConfig.getInstance();
        this.organisationLogo = this.config.organisationLogo;
        this.appVersion = new AppVersionManager();
        this.themeManager = new ThemeManager();
        this.toolboxService = new ToolBoxService();
        this.editorEvents = new EditorEvents();
        this.jsonToGrapes = new JSONToGrapesJSMenu(this);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const version = yield this.appVersion.getActiveVersion();
            console.log("testing", version);
            this.homepage = version === null || version === void 0 ? void 0 : version.Pages.find((page) => page.PageName === "Home");
            const mainContainer = document.getElementById('main-content');
            mainContainer.innerHTML = "";
            this.setUpEditorFrame();
            this.setUpEditor();
        });
    }
    setUpEditorFrame() {
        const leftNavigatorButton = new LeftNavigatorButton();
        const rightNavigatorButton = new RightNavigatorButton();
        const frameList = new FrameList(`gjs-0`);
        const thumbsContainer = document.createElement("div");
        thumbsContainer.style.justifyContent = "center";
        thumbsContainer.style.display = "flex";
        thumbsContainer.style.flexDirection = "row";
        thumbsContainer.style.alignItems = "center";
        thumbsContainer.style.gap = "0.4rem";
        thumbsContainer.className = "editor-thumbs-list";
        thumbsContainer.id = "editor-thumbs-list";
        const editorFrameArea = document.getElementById("main-content");
        const mainEditorSection = document.createElement("div");
        mainEditorSection.className = "editor-main-section";
        mainEditorSection.style.display = "flex";
        mainEditorSection.style.justifyContent = "center";
        mainEditorSection.style.alignItems = "center";
        mainEditorSection.style.flexDirection = "column";
        mainEditorSection.style.width = "100%";
        frameList.render(mainEditorSection);
        mainEditorSection.appendChild(thumbsContainer);
        // leftNavigatorButton.render(editorFrameArea);
        editorFrameArea.appendChild(mainEditorSection);
        // rightNavigatorButton.render(editorFrameArea);
        this.setClientWidth(frameList.container);
    }
    setClientWidth(container) {
        const frame = container.querySelector(".mobile-frame");
        if (frame) {
            globalThis.deviceWidth = frame.clientWidth;
            globalThis.deviceHeight = frame.clientHeight;
        }
    }
    setUpEditor() {
        return __awaiter(this, void 0, void 0, function* () {
            const editor = this.initializeGrapesEditor(`gjs-0`);
            console.log(window.app.editors);
            window.app.editors[`gjs-0`] = editor;
            this.finalizeEditorSetup(editor);
            yield this.loadHomePage(editor);
            this.activateHomeEditor(`gjs-0`);
            this.themeManager.applyTheme(this.themeManager.currentTheme);
        });
    }
    loadHomePage(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const converter = new JSONToGrapesJSMenu(this.homepage);
            const htmlOutput = converter.generateHTML();
            editor.setComponents(htmlOutput);
            this.editorEvents.init(editor, this.homepage, `gjs-0`, true);
            localStorage.setItem(`data-${(_a = this.homepage) === null || _a === void 0 ? void 0 : _a.PageId}`, JSON.stringify(this.homepage));
            new UndoRedoManager(this.homepage.PageId);
        });
    }
    initializeGrapesEditor(editorId) {
        return grapesjs.init({
            container: `#${editorId}`,
            fromElement: true,
            height: "100%",
            width: "auto",
            canvas: {
                styles: [
                    "/Resources/UCGrapes1/src/css/toolbox.css",
                    "/DVelop/Bootstrap/Shared/fontawesome_vlatest/css/all.min.css?202521714271081",
                    "https://fonts.googleapis.com/css2?family=Inter:opsz@14..32&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap",
                ],
            },
            baseCss: " ",
            dragMode: "normal",
            panels: { defaults: [] },
            sidebarManager: false,
            storageManager: false,
            modal: false,
            commands: false,
            hoverable: false,
            highlightable: false,
            selectable: false,
            richTextEditor: {},
        });
    }
    finalizeEditorSetup(editor) {
        const wrapper = editor.getWrapper();
        wrapper.set({
            selectable: false,
            droppable: false,
            draggable: false,
            hoverable: false,
        });
        const canvas = editor.Canvas.getElement();
        if (canvas) {
            canvas.style.setProperty("height", "calc(100% - 100px)", "important");
        }
        const canvasBody = editor.Canvas.getBody();
        if (canvasBody) {
            canvasBody.style.setProperty("background-color", "#EFEEEC", "important");
        }
    }
    activateHomeEditor(frameId) {
        const homeFrame = document.getElementById(`${frameId}-frame`);
        homeFrame.classList.add("active-editor");
    }
}
//# sourceMappingURL=EditorManager.js.map