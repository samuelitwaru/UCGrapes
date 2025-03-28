import { PublishManager } from "../../controls/toolbox/PublishManager";
import { AppVersionManager } from "../../controls/versions/AppVersionManager";
import { ToolBoxService } from "../../services/ToolBoxService";
import { Button } from "./Button";
import { EditActions } from "./EditActions";
import { Modal } from "./Modal";
import { ThemeSelection } from "./ThemeSelection";
import { VersionSelectionView } from "../views/VersionSelectionView";
import { TreeComponent } from "./TreeComponent";

export class NavbarButtons {
  container: HTMLElement;
  appVersions: AppVersionManager;

  constructor() {
    this.appVersions = new AppVersionManager();
    this.container = document.getElementById("navbar-buttons") as HTMLElement;
    this.init();
  }

  init() {
    const editActions = new EditActions();

    const themeSelection = new ThemeSelection();
    const versionSelection = new VersionSelectionView();
    const treeButtonSvg: string = `<svg xmlns="http://www.w3.org/2000/svg" width="18.818" height="16" viewBox="0 0 18.818 18">
        <path id="Path_993" data-name="Path 993" d="M19.545,5a3.283,3.283,0,0,0-3.273,3.273A3.228,3.228,0,0,0,16.784,10l-2.541,3.177H10.427a3.273,3.273,0,1,0,0,1.636h3.816L16.784,18a3.229,3.229,0,0,0-.511,1.732,3.273,3.273,0,1,0,3.273-3.273,3.207,3.207,0,0,0-1.563.419L15.685,14l2.3-2.873a3.207,3.207,0,0,0,1.563.419,3.273,3.273,0,0,0,0-6.545Zm0,1.636a1.636,1.636,0,1,1-1.636,1.636A1.623,1.623,0,0,1,19.545,6.636ZM7.273,12.364A1.636,1.636,0,1,1,5.636,14,1.623,1.623,0,0,1,7.273,12.364Zm12.273,5.727a1.636,1.636,0,1,1-1.636,1.636A1.623,1.623,0,0,1,19.545,18.091Z" transform="translate(-4 -5)"></path>
        </svg>`;

    let treeButton = new Button("open-mapping", "Tree", {
      svg: treeButtonSvg,
      variant: "outline",
      labelId: "navbar_tree_label",
    });

    treeButton.button.addEventListener("click", (e) => {
      e.preventDefault()
      const toolSection = document.getElementById('tools-section') as HTMLDivElement
      const mappingSection = document.querySelector('#mapping-section') as HTMLDListElement
      toolSection.style.display = "none"
      mappingSection.style.display = "block"

      const treeComp = new TreeComponent(this.appVersions) 
  
    })

    const publishButtonSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 13 18">
        <path id="Path_958" data-name="Path 958" d="M13.5,3.594l-.519.507L7.925,9.263l1.038,1.06,3.814-3.9V18.644h1.444V6.429l3.814,3.9,1.038-1.06L14.019,4.1ZM7,20.119v1.475H20V20.119Z" transform="translate(-7 -3.594)" fill="#fff"></path>
      </svg>`;

    let publishButton = new Button("publish", "Publish", {
      svg: publishButtonSvg,
      labelId: "navbar_tree_label",
    });

    editActions.render(this.container);
    versionSelection.render(this.container);
    themeSelection.render(this.container);
    treeButton.render(this.container);
    publishButton.render(this.container);

    publishButton.button.addEventListener("click", (e) => {
      e.preventDefault();
      new PublishManager().openModal();
    });
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
