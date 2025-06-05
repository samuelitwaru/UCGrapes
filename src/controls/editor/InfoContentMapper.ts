import { InfoType } from "../../types";
import { HistoryManager } from "../toolbox/HistoryManager";
import { ToolboxManager } from "../toolbox/ToolboxManager";

export class InfoContentMapper {
  pageId: any;
  historyManager: HistoryManager;
  constructor(pageId: any) {
    this.pageId = pageId;
    this.historyManager = new HistoryManager(this.pageId);
  }

  private saveData(data: any): void {
    const storageKey = `data-${this.pageId}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
    this.historyManager.addState(data);
    // call auto save to DB:
    const toolboxManager = new ToolboxManager();
    toolboxManager.savePages();
  }

  public contentRow(content: InfoType): any {
    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );
    const row = {
      InfoId: content.InfoId,
      InfoType: content.InfoType || "",
      InfoValue: content.InfoValue || "",
      InfoNextSectionId: content.InfoPositionId || "",
      CtaAttributes: content?.CtaAttributes,
      Tiles: content?.Tiles,
      Images: content?.Images,
    };

    return row;
  }

  public addInfoType(content: InfoType): any {
    const storageKey = `data-${this.pageId}`;
    const data: any = JSON.parse(localStorage.getItem(storageKey) || "{}");

    if (!data.PageInfoStructure) return;

    data.PageInfoStructure.InfoContent ??= [];

    const newSection = this.contentRow(content);
    const nextSectionId = newSection.InfoNextSectionId;

    // Find the index of the section with id matching InfoNextSection
    const targetIndex = data.PageInfoStructure.InfoContent.findIndex(
      (section: any) => section.InfoId === nextSectionId
    );

    delete newSection.InfoNextSectionId;

    if (targetIndex !== -1) {
      // Insert at the target index
      delete newSection.InfoNextSectionId;
      data.PageInfoStructure.InfoContent.splice(targetIndex, 0, newSection);
    } else {
      // If no match found, fallback to push
      data.PageInfoStructure.InfoContent.push(newSection);
    }

    this.saveData(data);
  }

  moveContentRow(contentId: any, newIndex: number): void {
    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );
    if (!data?.PageInfoStructure?.InfoContent) return;

    const contentArray = data.PageInfoStructure.InfoContent;
    const contentRowIndex = contentArray.findIndex(
      (row: any) => row.InfoId === contentId
    );

    if (
      contentRowIndex === -1 ||
      newIndex < 0 ||
      newIndex >= contentArray.length
    )
      return;

    const [contentRow] = contentArray.splice(contentRowIndex, 1);

    contentArray.splice(newIndex, 0, contentRow);
    this.saveData(data);
  }

  updateInfoContent(infoId: any, newContent: InfoType): boolean {
    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );
    if (!data?.PageInfoStructure?.InfoContent) return false;
    const contentArray = data.PageInfoStructure.InfoContent;
    const contentRowIndex = contentArray.findIndex(
      (row: InfoType) => row.InfoId === infoId
    );
    if (contentRowIndex === -1) return false;
    contentArray[contentRowIndex] = newContent;
    this.saveData(data);

    return true;
  }

  removeInfoContent(infoId: any): boolean {
    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );
    if (!data?.PageInfoStructure?.InfoContent) return false;

    const contentArray = data.PageInfoStructure.InfoContent;
    const contentRowIndex = contentArray.findIndex(
      (row: InfoType) => row.InfoId === infoId
    );

    if (contentRowIndex === -1) return false;

    contentArray.splice(contentRowIndex, 1);
    this.saveData(data);

    // trigger a grapes js deselect event
    const grapesJsEditor = (globalThis as any).activeEditor;
    if (grapesJsEditor) {
      const selectedComponent = grapesJsEditor.getSelected();
      if (selectedComponent) {
        grapesJsEditor.select(null);
        (globalThis as any).selectedComponent = null;
      }
    }

    return true;
  }

  getInfoContent(infoId: any): InfoType | null {
    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );
    if (!data?.PageInfoStructure?.InfoContent) return null;

    const contentArray = data.PageInfoStructure.InfoContent;
    const contentRowIndex = contentArray.findIndex(
      (row: InfoType) => row.InfoId === infoId
    );

    if (contentRowIndex === -1) return null;

    return contentArray[contentRowIndex];
  }
}