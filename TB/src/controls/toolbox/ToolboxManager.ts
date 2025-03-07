import { NavbarButtons } from "../../ui/components/NavbarButtons";
import { ToolsSection } from "../../ui/components/ToolsSection";


export class ToolboxManager {
  constructor() {
  }

  public setUpNavBar() {
    const navBar = document.getElementById('tb-navbar') as HTMLElement;
    
    const navbarTitle = document.getElementById('navbar_title') as HTMLElement;
    navbarTitle.textContent = 'App toolbox';

    let navBarButtons = new NavbarButtons();

    navBarButtons.render(navBar);
  }

  public setUpSideBar() {
    const sideBar = document.getElementById('tb-sidebar') as HTMLElement;

    const toolsSection = new ToolsSection();
    toolsSection.render(sideBar);
  }
}
