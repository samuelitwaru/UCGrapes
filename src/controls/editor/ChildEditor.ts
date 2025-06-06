import { EditorFrame } from "../../ui/components/editor-content/EditorFrame";
import { contentDefaultAttributes } from "../../utils/default-attributes";
import { randomIdGenerator } from "../../utils/helpers";
import { ThemeManager } from "../themes/ThemeManager";
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
  editorManager: EditorManager;
  editorEvents: EditorEvents;
  pageId: any;
  pageData: any;
  themeManager: any;
  pageTitle: any;
  isNewPage: boolean;

  constructor(pageId: any, pageData?: any, isNewPage: boolean = false) {
    this.pageId = pageId;
    this.pageData = pageData;
    this.isNewPage = isNewPage;
    this.themeManager = new ThemeManager();
    this.editorManager = new EditorManager();
    this.editorEvents = new EditorEvents();
  }

  init(attributes: any) {
    let editorId: any = `gjs-${this.getEditorId()}`;
    this.pageTitle = this.pageData?.PageName;
    this.createNewEditor(editorId);
    const childEditor = this.editorManager.initializeGrapesEditor(editorId);
    (window as any).app.editors[editorId] = childEditor;

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
    };
    let converter;
    if (
      this.pageData?.PageType === "Menu" ||
      this.pageData?.PageType === "MyLiving" ||
      this.pageData?.PageType === "MyCare" ||
      this.pageData?.PageType === "MyService"
    ) {
      converter = new JSONToGrapesJSMenu(this.pageData);
      setUpEditor(converter);
    } else if (this.pageData?.PageType === "Information") {
      converter = new JSONToGrapesJSInformation(this.pageData, this.isNewPage);
      setUpEditor(converter);
    } else if (this.pageData?.PageType === "Location") {
      const locationEditor = new LoadLocationData(childEditor, this.pageData);
      locationEditor.setupEditor();
    } else if (this.pageData?.PageType === "Reception") {
      const receptionEditor = new LoadReceptionData(childEditor, this.pageData);
      receptionEditor.setupEditor();
    } else if (
      this.pageData?.PageType === "WebLink" ||
      this.pageData?.PageType === "DynamicForm"
    ) {
      const urlPageEditor = new UrlPageEditor(childEditor);
      if (this.pageData?.PageLinkStructure?.Url) {
        urlPageEditor.initialise(this.pageData.PageLinkStructure.Url);
      } else {
        console.error(
          "Missing URL for WebLink/DynamicForm page:",
          this.pageData
        );
        urlPageEditor.initialise("htps://www.example.com"); 
      }
    } else if (this.pageData?.PageType === "Map") {
      const mapsPageEditor = new MapsPageEditor(childEditor);
      mapsPageEditor.initialise(attributes.Action);
    } else if (this.pageData?.PageType === "MyActivity") {
      const activityEditor = new LoadMyActivityData(childEditor);
      activityEditor.load();
    } else if (this.pageData?.PageType === "Calendar") {
      const calendarEditor = new LoadCalendarData(childEditor);
      calendarEditor.load();
    }

    this.editorEvents.init(childEditor, this.pageData, editorId, false, this.isNewPage);
    this.editorManager.finalizeEditorSetup(childEditor);
    this.themeManager.applyTheme(this.themeManager.currentTheme);
    this.updatePositions();
  }

  createNewEditor(editorId: string) {
    const frameContainer = document.getElementById(
      "child-container"
    ) as HTMLElement;
    const newEditor = new EditorFrame(
      editorId,
      false,
      this.pageData,
      this.pageTitle,
      this.isNewPage
    );

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

  refreshPage() {}

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

  private updateFrame() {
    this.editorEvents.removeOtherEditors();
    this.editorEvents.activateNavigators();
  }

  private updatePositions() {
    const childContainer = document.getElementById(
      "child-container"
    ) as HTMLDivElement;
    childContainer.scrollLeft =
      childContainer.scrollWidth - childContainer.clientWidth;
    childContainer.style.justifyContent = "right";
  }
}
