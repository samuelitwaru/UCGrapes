import { EditorFrame } from "../../ui/components/editor-content/EditorFrame";
import { contentDefaultAttributes } from "../../utils/default-attributes";
import { randomIdGenerator } from "../../utils/helpers";
import { ThemeManager } from "../themes/ThemeManager";
import { UndoRedoManager } from "../toolbox/UndoRedoManager";
import { EditorEvents } from "./EditorEvents";
import { EditorManager } from "./EditorManager";
import { JSONToGrapesJSContent } from "./JSONToGrapesJSContent";
import { JSONToGrapesJSMenu } from "./JSONToGrapesJSMenu";
import { LoadCalendarData } from "./LoadCalendarData";
import { LoadLocationData } from "./LoadLocationData";
import { LoadMyActivityData } from "./LoadMyActivityData";
import { LoadReceptionData } from "./LoadReceptionData";
import { MapsPageEditor } from "./MapsPageEditor";
import { UrlPageEditor } from "./UrlPageEditor";

export class ChildEditor {
  editorManager: EditorManager;
  editorEvents: EditorEvents;
  pageId: any;
  pageData: any;
  themeManager: any;
  pageTitle: any;

  constructor(pageId: any, pageData?: any) {
    this.pageId = pageId;
    this.pageData = pageData;
    this.themeManager = new ThemeManager();
    this.editorManager = new EditorManager();
    this.editorEvents = new EditorEvents();
  }

  init(tileAttributes: any) {
    let editorId: any = `gjs-${this.getEditorId()}`;
    this.pageTitle = tileAttributes.Text;
    this.createNewEditor(editorId);
    const childEditor = this.editorManager.initializeGrapesEditor(editorId);

    const setUpEditor = (converter: any) => {
      if (converter) {
        const htmlOutput = converter.generateHTML();
        childEditor.setComponents(htmlOutput);
        localStorage.setItem(
          `data-${this.pageId}`,
          JSON.stringify(this.pageData)
        );
      } else {
        console.error(
          "Invalid PageType or pageData is undefined:",
          this.pageData
        );
      }
    }
    let converter;
    console.log("PageType:", this.pageData?.PageType);
    console.log("PageType:", this.pageData);
    if (
        this.pageData?.PageType === "Menu" ||
        this.pageData?.PageType === "MyLiving" ||
        this.pageData?.PageType === "MyCare" ||
        this.pageData?.PageType === "MyService" 
      ) {
      converter = new JSONToGrapesJSMenu(this.pageData);
      setUpEditor(converter);
    } else if (this.pageData?.PageType === "Location") {
      const locationEditor = new LoadLocationData(childEditor, this.pageData);
      locationEditor.setupEditor();
    } else if (this.pageData?.PageType === "Reception") {
      const receptionEditor = new LoadReceptionData(childEditor, this.pageData);
      receptionEditor.setupEditor();
    } else if (this.pageData?.PageType === "Content") {
      converter = new JSONToGrapesJSContent(this.pageData);
      setUpEditor(converter);
    } else if (
      this.pageData?.PageType === "WebLink" ||
      this.pageData?.PageType === "DynamicForm"
    ) {
      const urlPageEditor = new UrlPageEditor(childEditor);
      urlPageEditor.initialise(tileAttributes.Action);
    }else if (
      this.pageData?.PageType === "Maps"
    ) {
      const mapsPageEditor = new MapsPageEditor(childEditor);
      mapsPageEditor.initialise(tileAttributes.Action);
    } else if (this.pageData?.PageType === "MyActivity") {
      console.log("MyActivity")
      const activityEditor = new LoadMyActivityData(childEditor);
      activityEditor.load();
    } else if (this.pageData?.PageType === "Calendar") {
      const calendarEditor = new LoadCalendarData(childEditor);
      calendarEditor.load();
    }

    this.editorEvents.init(childEditor, this.pageData, editorId);
    this.editorManager.finalizeEditorSetup(childEditor);
    new UndoRedoManager(this.pageData.PageId);
    this.themeManager.applyTheme(this.themeManager.currentTheme);
  }

  createNewEditor(editorId: string) {
    const frameContainer = document.getElementById(
      "child-container"
    ) as HTMLElement;
    const newEditor = new EditorFrame(editorId, false, this.pageData, this.pageTitle);
    newEditor.render(frameContainer);
  }

  getEditorId(): number {
    let id = 0;
    const framelist = document.querySelectorAll(".mobile-frame");
    framelist.forEach((frame: any) => {
      id++;
    });
    return id;
  }

  addImageContent(editor: any) {
    const components = editor.DomComponents.getWrapper().find(
      ".content-page-wrapper"
    );
    if (components.length > 0) {
      const contentWrapper = components[0];
      contentWrapper.append(`
      <img ${contentDefaultAttributes} id="${randomIdGenerator(
        5
      )}" data-gjs-type="product-service-image" draggable="true" src="https://plus.unsplash.com/premium_photo-1686949554005-78d1370ab4f3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2fHx8ZW58MHx8fHx8" alt="Product Service Image" class="content-page-block">
      `);
    }
  }

  addDescriptionContent(editor: any) {
    const components = editor.DomComponents.getWrapper().find(
      ".content-page-wrapper"
    );
    if (components.length > 0) {
      const contentWrapper = components[0];
      contentWrapper.append(`
      <div ${contentDefaultAttributes} id="${randomIdGenerator(
        5
      )}" data-gjs-type="product-service-description" draggable="true" class="content-page-block">
          lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
      </div>
      `);
    }
  }
}
