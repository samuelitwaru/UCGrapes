import { InfoType } from "../../interfaces/InfoType";

export class InfoContentMapper {
    pageId: any;
    constructor(pageId: any) {
        this.pageId = pageId;
    }

    public contentRow (content: InfoType): any {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        console.log("content", content);
        const row = {
            "InfoId": content.InfoId,
            "InfoType": content.InfoType || "",
            "InfoValue": content.InfoValue || "",
            "CtaAttributes": content?.CtaAttributes,
        }

        return row;
    }

    public addInfoType(content: InfoType): any {
        console.log("content", content);
    
        const storageKey = `data-${this.pageId}`;
        const data: any = JSON.parse(localStorage.getItem(storageKey) || "{}");
    
        if (!data.PageInfoStructure) return;
    
        data.PageInfoStructure.InfoContent ??= [];
    
        data.PageInfoStructure.InfoContent.push(this.contentRow(content));
    
        localStorage.setItem(storageKey, JSON.stringify(data));
    }
    
    moveContentRow(contentId: any, newIndex: number): void {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (!data?.PageInfoStructure?.InfoContent) return;
    
        const contentArray = data.PageInfoStructure.InfoContent;
        const contentRowIndex = contentArray.findIndex((row: any) => row.ContentId === contentId);
        
        if (contentRowIndex === -1 || newIndex < 0 || newIndex >= contentArray.length) return;
    
        const [contentRow] = contentArray.splice(contentRowIndex, 1);
    
        contentArray.splice(newIndex, 0, contentRow);
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }

    updateInfoContent(infoId: any, newContent: InfoType): boolean {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (!data?.PageInfoStructure?.InfoContent) return false;
        const contentArray = data.PageInfoStructure.InfoContent;
        const contentRowIndex = contentArray.findIndex((row: InfoType) => row.InfoId === infoId);
        console.log("contentRowIndex", contentRowIndex);
        if (contentRowIndex === -1) return false;
        console.log("newContent", newContent);
        contentArray[contentRowIndex] = newContent;
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
        return true;
    }

    removeInfoContent(infoId: any): boolean {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (!data?.PageInfoStructure?.InfoContent) return false;

        const contentArray = data.PageInfoStructure.InfoContent;
        const contentRowIndex = contentArray.findIndex((row: InfoType) => row.InfoId === infoId);

        if (contentRowIndex === -1) return false;

        contentArray.splice(contentRowIndex, 1);
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
        return true;
    }

    getInfoContent(infoId: any): InfoType[] | null {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (!data?.PageInfoStructure?.InfoContent) return null;

        const contentArray = data.PageInfoStructure.InfoContent;
        const contentRowIndex = contentArray.findIndex((row: InfoType) => row.InfoId === infoId);

        if (contentRowIndex === -1) return null;

        return contentArray[contentRowIndex].InfoContent;
    }
}