import { DeletePageButton } from "../../../controls/editor/DeletePageButton";
import { FrameHeader } from "./FrameHeader";
import { HomeAppBar } from "./HomeAppBar";
import { PageAppBar } from "./PageAppBar";

export class EditorFrame {
  private container: HTMLElement;
  private id: string;
  private isHome: boolean;
  private pageName?: string;
  pageData: any;
  isNewPage: boolean = false;

  constructor(
    id: string,
    isHome: boolean = false,
    pageData: any,
    pageName?: string,
    isNewPage: boolean = false
  ) {
    this.container = document.createElement("div");
    this.id = id;
    this.isHome = isHome;
    this.pageName = pageName;
    this.pageData = pageData;
    this.isNewPage = isNewPage;
    this.init();
  }

  init() {
    // Setup container
    this.container.className = "mobile-frame";
    this.container.id = `${this.id}-frame`;
    this.container.setAttribute("data-pageid", this.pageData.PageId);

    // Render frame header
    const frameHeader = new FrameHeader();
    frameHeader.render(this.container);

    const appBar = this.isHome
      ? new HomeAppBar()
      : new PageAppBar(this.id, this.pageName, this.isNewPage);
    appBar.render(this.container);

    // Create and append editor container
    const editor = document.createElement("div");
    editor.id = this.id;
    this.container.appendChild(editor);

    new DeletePageButton(this.pageData, this.container);
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
