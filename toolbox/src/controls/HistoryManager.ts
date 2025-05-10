import { ToolboxManager } from "./toolbox/ToolboxManager";

export class HistoryManager {
  // Static store shared across all instances
  private static pagesStore: Record<
    string,
    {
      history: any[];
      currentIndex: number;
    }
  > = {};

  // Instance properties
  currentPageId: string;
  limit: number;

  // Getter for pages to always access the static store
  get pages() {
    return HistoryManager.pagesStore;
  }

  constructor(currentPageId: string) {
    this.currentPageId = currentPageId;
    this.limit = 50;

    // Only add the page if it doesn't exist yet
    if (!this.pages[currentPageId]) {
      this.addPage(currentPageId);
    }
  }

  addPage(pageId: string = this.currentPageId) {
    if (!this.pages[pageId]) {
      this.pages[pageId] = {
        history: [], // Start with empty history
        currentIndex: -1, // No current state
      };
    }
  }

  get currentState() {
    if (!this.currentPageId || !this.pages[this.currentPageId]) return null;
    const page = this.pages[this.currentPageId];
    return page.history[page.currentIndex];
  }

  addState(newState: any) {
    if (!this.currentPageId) return null;

    if (!this.pages[this.currentPageId]) {
      this.addPage(this.currentPageId);
    }

    const page = this.pages[this.currentPageId];

    // Handle initial state
    if (page.history.length === 0) {
      page.history.push(JSON.parse(JSON.stringify(newState)));
      page.currentIndex = 0;
      return this.currentState;
    }

    // Rest of your existing logic...
    if (page.currentIndex < page.history.length - 1) {
      page.history = page.history.slice(0, page.currentIndex + 1);
    }

    // Only add state if it's different from current
    const currentState = page.history[page.currentIndex];
    if (JSON.stringify(currentState) === JSON.stringify(newState)) {
      return this.currentState;
    }

    page.history.push(JSON.parse(JSON.stringify(newState)));

    if (page.history.length > this.limit) {
      page.history.shift();
    } else {
      page.currentIndex++;
    }

    new ToolboxManager().unDoReDo();
    return this.currentState;
  }

  canUndo() {
    if (!this.currentPageId || !this.pages[this.currentPageId]) return false;
    return this.pages[this.currentPageId].currentIndex > 0;
  }

  canRedo() {
    if (!this.currentPageId || !this.pages[this.currentPageId]) return false;
    const page = this.pages[this.currentPageId];
    return page.currentIndex < page.history.length - 1;
  }

  undo() {
    if (this.canUndo()) {
      this.pages[this.currentPageId].currentIndex--;
      return this.currentState;
    }
    return null;
  }

  redo() {
    if (this.canRedo()) {
      this.pages[this.currentPageId].currentIndex++;
      return this.currentState;
    }
    return null;
  }

  getHistoryStatus() {
    if (!this.currentPageId || !this.pages[this.currentPageId])
      return "No page selected";
    const page = this.pages[this.currentPageId];
    return `History: ${page.currentIndex + 1}/${page.history.length}`;
  }

  getPageData(pageId: string) {
    if (!this.pages[pageId]) {
      this.addPage(pageId);
    }

    if (this.pages[pageId]) {
      return this.pages[pageId].history[this.pages[pageId].currentIndex];
    }
    return null;
  }

  getAllHistory() {
    return this.pages;
  }

  // Static method to access the pages store directly
  static getAllPages() {
    return HistoryManager.pagesStore;
  }

  // Reset all history (useful for testing)
  static clearAllHistory() {
    HistoryManager.pagesStore = {};
  }
}
