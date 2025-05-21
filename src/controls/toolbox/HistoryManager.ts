import { ToolboxManager } from "./ToolboxManager";

export class HistoryManager {
  private static pagesStore: Record<
    string,
    {
      history: any[];
      currentIndex: number;
    }
  > = {};

  currentPageId: string;
  limit: number;

  get pages() {
    return HistoryManager.pagesStore;
  }

  constructor(currentPageId: string) {
    this.currentPageId = currentPageId;
    this.limit = 50;

    if (!this.pages[currentPageId]) {
      this.addPage(currentPageId);
    }
  }

  addPage(pageId: string = this.currentPageId) {
    if (!this.pages[pageId]) {
      this.pages[pageId] = {
        history: [], 
        currentIndex: -1, 
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

    if (page.history.length === 0) {
      page.history.push(JSON.parse(JSON.stringify(newState)));
      page.currentIndex = 0;
      return this.currentState;
    }

    if (page.currentIndex < page.history.length - 1) {
      page.history = page.history.slice(0, page.currentIndex + 1);
    }

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

  static getAllPages() {
    return HistoryManager.pagesStore;
  }

  static clearAllHistory() {
    HistoryManager.pagesStore = {};
  }
}
