import { ToolboxManager } from './controls/toolbox/ToolboxManager';

class ToolboxApp {
  private toolboxManager: ToolboxManager;

  constructor() {
    this.toolboxManager = new ToolboxManager();
    
    this.initialise();
  } 

  initialise(): void {
    this.toolboxManager.setUpNavBar();
    this.toolboxManager.setUpSideBar();
  }
}

export default ToolboxApp;
