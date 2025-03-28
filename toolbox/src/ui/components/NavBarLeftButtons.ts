import { PublishManager } from "../../controls/toolbox/PublishManager";
import { AppVersionController } from "../../controls/versions/AppVersionController";
import { AppVersionManager } from "../../controls/versions/AppVersionManager";
import { DebugController } from "../../controls/versions/DebugController";
import { ToolBoxService } from "../../services/ToolBoxService";
import { ShareLinkView } from "../views/ShareLinkView";
import { Button } from "./Button";
import { EditActions } from "./EditActions";
import { Modal } from "./Modal";

export class NavbarLeftButtons {
  container: HTMLElement;
  appVersions: AppVersionManager;
  debugController: DebugController;

  constructor() {
    this.appVersions = new AppVersionManager();
    this.debugController = new DebugController();
    this.container = document.getElementById(
      "navbar-buttons-left"
    ) as HTMLElement;
    this.init();
  }

  init() {
    const debugSvg = `
        <svg width="18px" height="18px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.463 12.86l-.005-.07.005.07zm7.264.69l-3.034-3.049 1.014-1.014 3.209 3.225 3.163-3.163 1.014 1.014-3.034 3.034 3.034 3.05-1.014 1.014-3.209-3.225L8.707 17.6l-1.014-1.014 3.034-3.034z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M16.933 5.003V6h1.345l2.843-2.842 1.014 1.014-2.692 2.691.033.085a13.75 13.75 0 0 1 .885 4.912c0 .335-.011.667-.034.995l-.005.075h3.54v1.434h-3.72l-.01.058c-.303 1.653-.891 3.16-1.692 4.429l-.06.094 3.423 3.44-1.017 1.012-3.274-3.29-.099.11c-1.479 1.654-3.395 2.646-5.483 2.646-2.12 0-4.063-1.023-5.552-2.723l-.098-.113-3.209 3.208-1.014-1.014 3.366-3.365-.059-.095c-.772-1.25-1.34-2.725-1.636-4.34l-.01-.057H0V12.93h3.538l-.005-.075a14.23 14.23 0 0 1-.034-.995c0-1.743.31-3.39.863-4.854l.032-.084-2.762-2.776L2.65 3.135 5.5 6h1.427v-.997a5.003 5.003 0 0 1 10.006 0zm-8.572 0V6H15.5v-.997a3.569 3.569 0 0 0-7.138 0zm9.8 2.522l-.034-.09H5.733l-.034.09a12.328 12.328 0 0 0-.766 4.335c0 2.76.862 5.201 2.184 6.92 1.32 1.716 3.036 2.649 4.813 2.649 1.777 0 3.492-.933 4.813-2.65 1.322-1.718 2.184-4.16 2.184-6.919 0-1.574-.28-3.044-.766-4.335z"/>
        </svg>
    `;
    let debugButton = new Button("debug-button", "Debug", {
      labelId: "debug_button_label",
    });
    debugButton.button.style.marginRight = "10px";
    debugButton.button.addEventListener("click", (e) => {
      e.preventDefault();
      this.initialiseDebug();
      this.debugController.init();
    });

    const treeButtonSvg: string = `
        <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.293 2.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1-1.414 1.414L13 5.414V15a1 1 0 1 1-2 0V5.414L9.707 6.707a1 1 0 0 1-1.414-1.414l3-3zM4 11a2 2 0 0 1 2-2h2a1 1 0 0 1 0 2H6v9h12v-9h-2a1 1 0 1 1 0-2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9z" fill="#0D0D0D"/>
        </svg>
    `;
    let treeButton = new Button("open-mapping", "Share", {
      svg: treeButtonSvg,
      variant: "outline",
      labelId: "navbar_tree_label",
    });
    
    debugButton.render(this.container);
    treeButton.render(this.container);

    treeButton.button.addEventListener("click", (e) => {
      e.preventDefault();
      new ShareLinkView().openShareLinkModal();
    });
  }

  initialiseDebug() {
    const debugDiv = document.createElement("div");
    debugDiv.id = "tb-debugging";
    debugDiv.innerHTML = `
      <div class="tb_debug-spinner-container">
          <div class="tb_debug-spinner"></div>
      </div>
      <p style="text-align: center; font-size: 14px; margin-top: 10px">Please wait while we are checking the urls...</p>
    `;

    const modal = new Modal({
      title: "App Debugging",
      width: "800px",
      body: debugDiv,
    });

    modal.open();
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
