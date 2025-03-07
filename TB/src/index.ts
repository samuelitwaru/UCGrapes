import ToolboxApp from "./app";

class App {
  constructor() {
    new ToolboxApp();
  }
}

// Expose the App class globally
(window as any).App = App;
