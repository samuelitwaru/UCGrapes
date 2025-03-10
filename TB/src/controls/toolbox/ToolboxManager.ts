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

  public setUpScrollButtons() {
    const scrollContainer = document.getElementById('child-container') as HTMLElement;
    const leftScroll = document.querySelector('.navigator .page-navigator-left') as HTMLElement;
    const rightScroll = document.querySelector('.navigator .page-navigator-right') as HTMLElement;

    const scrollAmount: number = 300;

    const updateButtonVisibility = () => {
      leftScroll.style.display = scrollContainer.scrollLeft > 0 ? 'none' : 'block';
      const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      rightScroll.style.display = scrollContainer.scrollLeft < maxScrollLeft - 5 ? 'none' : 'block';
    };

    leftScroll.onclick = () => {
      scrollContainer.scrollLeft -= scrollAmount;
    }

    rightScroll.onclick = () => {
      scrollContainer.scrollLeft += scrollAmount;
    }

    scrollContainer.addEventListener('scroll', updateButtonVisibility);
    window.addEventListener('resize', updateButtonVisibility);

    updateButtonVisibility();
  }
}
