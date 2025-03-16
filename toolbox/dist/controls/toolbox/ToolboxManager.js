import { NavbarButtons } from "../../ui/components/NavbarButtons";
import { ToolsSection } from "../../ui/components/ToolsSection";
export class ToolboxManager {
    constructor() {
    }
    setUpNavBar() {
        const navBar = document.getElementById('tb-navbar');
        const navbarTitle = document.getElementById('navbar_title');
        navbarTitle.textContent = 'App toolbox';
        let navBarButtons = new NavbarButtons();
        navBarButtons.render(navBar);
    }
    setUpSideBar() {
        const sideBar = document.getElementById('tb-sidebar');
        const toolsSection = new ToolsSection();
        toolsSection.render(sideBar);
    }
}
//# sourceMappingURL=ToolboxManager.js.map