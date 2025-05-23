export class InfoContentMapper {
    constructor(pageId) {
        this.pageId = pageId;
    }
    contentRow(content) {
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        const row = {
            "InfoId": content.InfoId,
            "InfoType": content.InfoType || "",
            "InfoValue": content.InfoValue || "",
            "CtaAttributes": content === null || content === void 0 ? void 0 : content.CtaAttributes,
            "Tiles": content === null || content === void 0 ? void 0 : content.Tiles,
        };
        return row;
    }
    addInfoType(content) {
        var _a;
        var _b;
        const storageKey = `data-${this.pageId}`;
        const data = JSON.parse(localStorage.getItem(storageKey) || "{}");
        if (!data.PageInfoStructure)
            return;
        (_a = (_b = data.PageInfoStructure).InfoContent) !== null && _a !== void 0 ? _a : (_b.InfoContent = []);
        data.PageInfoStructure.InfoContent.push(this.contentRow(content));
        localStorage.setItem(storageKey, JSON.stringify(data));
    }
    moveContentRow(contentId, newIndex) {
        var _a;
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (!((_a = data === null || data === void 0 ? void 0 : data.PageInfoStructure) === null || _a === void 0 ? void 0 : _a.InfoContent))
            return;
        const contentArray = data.PageInfoStructure.InfoContent;
        const contentRowIndex = contentArray.findIndex((row) => row.ContentId === contentId);
        if (contentRowIndex === -1 || newIndex < 0 || newIndex >= contentArray.length)
            return;
        const [contentRow] = contentArray.splice(contentRowIndex, 1);
        contentArray.splice(newIndex, 0, contentRow);
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }
    updateInfoContent(infoId, newContent) {
        var _a;
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (!((_a = data === null || data === void 0 ? void 0 : data.PageInfoStructure) === null || _a === void 0 ? void 0 : _a.InfoContent))
            return false;
        const contentArray = data.PageInfoStructure.InfoContent;
        const contentRowIndex = contentArray.findIndex((row) => row.InfoId === infoId);
        if (contentRowIndex === -1)
            return false;
        contentArray[contentRowIndex] = newContent;
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
        return true;
    }
    removeInfoContent(infoId) {
        var _a;
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (!((_a = data === null || data === void 0 ? void 0 : data.PageInfoStructure) === null || _a === void 0 ? void 0 : _a.InfoContent))
            return false;
        const contentArray = data.PageInfoStructure.InfoContent;
        const contentRowIndex = contentArray.findIndex((row) => row.InfoId === infoId);
        if (contentRowIndex === -1)
            return false;
        contentArray.splice(contentRowIndex, 1);
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
        return true;
    }
    getInfoContent(infoId) {
        var _a;
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (!((_a = data === null || data === void 0 ? void 0 : data.PageInfoStructure) === null || _a === void 0 ? void 0 : _a.InfoContent))
            return null;
        const contentArray = data.PageInfoStructure.InfoContent;
        const contentRowIndex = contentArray.findIndex((row) => row.InfoId === infoId);
        if (contentRowIndex === -1)
            return null;
        return contentArray[contentRowIndex];
    }
}
//# sourceMappingURL=InfoContentMapper.js.map