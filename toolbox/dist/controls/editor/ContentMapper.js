export class ContentMapper {
    constructor(pageId) {
        this.pageId = pageId;
    }
    contentRow(content) {
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        const row = {
            "ContentType": content.ContentType,
            "ContentValue": content.Content,
        };
        return row;
    }
    moveContentRow(contentId, newIndex) {
        var _a;
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (!((_a = data === null || data === void 0 ? void 0 : data.PageContentStructure) === null || _a === void 0 ? void 0 : _a.Content))
            return;
        const contentArray = data.PageContentStructure.Content;
        const contentRowIndex = contentArray.findIndex((row) => row.ContentId === contentId);
        if (contentRowIndex === -1 || newIndex < 0 || newIndex >= contentArray.length)
            return;
        const [contentRow] = contentArray.splice(contentRowIndex, 1);
        // Insert the item at the new position
        contentArray.splice(newIndex, 0, contentRow);
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }
    updateContentDescription(contentId, newDescription) {
        var _a;
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (!((_a = data === null || data === void 0 ? void 0 : data.PageContentStructure) === null || _a === void 0 ? void 0 : _a.Content))
            return false;
        const ContentItem = data.PageContentStructure.Content.find((Content) => Content.ContentId === contentId);
        if (ContentItem) {
            ContentItem.ContentValue = newDescription;
            localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
            return true;
        }
        return false;
    }
    updateContentImage(contentId, newImageUrl) {
        var _a;
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (!((_a = data === null || data === void 0 ? void 0 : data.PageContentStructure) === null || _a === void 0 ? void 0 : _a.Content))
            return false;
        const ContentItem = data.PageContentStructure.Content.find((Content) => Content.ContentId === contentId);
        if (ContentItem) {
            ContentItem.ContentValue = newImageUrl;
            localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
            return true;
        }
        return false;
    }
    moveCta(CtaId, newIndex) {
        var _a;
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (!((_a = data === null || data === void 0 ? void 0 : data.PageContentStructure) === null || _a === void 0 ? void 0 : _a.Cta))
            return;
        const contentArray = data.PageContentStructure.Cta;
        const contentRowIndex = contentArray.findIndex((row) => row.CtaId === CtaId);
        if (contentRowIndex === -1 || newIndex < 0 || newIndex >= contentArray.length)
            return;
        const [contentRow] = contentArray.splice(contentRowIndex, 1);
        // Insert the item at the new position
        contentArray.splice(newIndex, 0, contentRow);
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }
    addContentCta(cta) {
        var _a;
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        const ctaButton = {
            "CtaId": cta.CtaId,
            "CtaType": cta.CtaType,
            "CtaLabel": cta.CtaLabel,
            "CtaAction": cta.CtaAction,
            "CtaColor": cta.CtaColor,
            "CtaBGColor": cta.CtaBGColor,
            "CtaButtonType": cta.CtaButtonType,
            "CtaButtonImgUrl": cta.CtaButtonImgUrl || "",
        };
        if (!data.PageContentStructure.Cta) {
            data.PageContentStructure.Cta = [];
        }
        (_a = data === null || data === void 0 ? void 0 : data.PageContentStructure) === null || _a === void 0 ? void 0 : _a.Cta.push(ctaButton);
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }
    removeContentCta(ctaId) {
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (data && data.PageContentStructure && data.PageContentStructure.Cta) {
            const ctaIndex = data.PageContentStructure.Cta.findIndex((cta) => cta.CtaId === ctaId);
            if (ctaIndex !== -1 && data.PageContentStructure.Cta[ctaIndex]) {
                data.PageContentStructure.Cta.splice(ctaIndex, 1);
                localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
                return true;
            }
        }
    }
    updateContentCtaBGColor(ctaId, bgColor) {
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (data && data.PageContentStructure && data.PageContentStructure.Cta) {
            const ctaIndex = data.PageContentStructure.Cta.findIndex((cta) => cta.CtaId === ctaId);
            if (ctaIndex !== -1 && data.PageContentStructure.Cta[ctaIndex]) {
                data.PageContentStructure.Cta[ctaIndex].CtaBGColor = bgColor;
                localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
                return true;
            }
        }
    }
    updateContentCtaColor(ctaId, color) {
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (data && data.PageContentStructure && data.PageContentStructure.Cta) {
            const ctaIndex = data.PageContentStructure.Cta.findIndex((cta) => cta.CtaId === ctaId);
            if (ctaIndex !== -1 && data.PageContentStructure.Cta[ctaIndex]) {
                data.PageContentStructure.Cta[ctaIndex].CtaColor = color;
                localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
                return true;
            }
        }
    }
    updateContentButtonType(ctaId, buttonType, imageUrl) {
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (data && data.PageContentStructure && data.PageContentStructure.Cta) {
            const ctaIndex = data.PageContentStructure.Cta.findIndex((cta) => cta.CtaId === ctaId);
            if (ctaIndex !== -1 && data.PageContentStructure.Cta[ctaIndex]) {
                data.PageContentStructure.Cta[ctaIndex].CtaButtonType = buttonType;
                if (imageUrl) {
                    data.PageContentStructure.Cta[ctaIndex].CtaButtonImgUrl = imageUrl;
                }
                localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
                return true;
            }
        }
    }
    updateContentCtaLabel(ctaId, label) {
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (data && data.PageContentStructure && data.PageContentStructure.Cta) {
            const ctaIndex = data.PageContentStructure.Cta.findIndex((cta) => cta.CtaId === ctaId);
            if (ctaIndex !== -1 && data.PageContentStructure.Cta[ctaIndex]) {
                data.PageContentStructure.Cta[ctaIndex].CtaLabel = label;
                localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
                return true;
            }
        }
    }
    getContentCta(ctaId) {
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (data && data.PageContentStructure && data.PageContentStructure.Cta) {
            return data.PageContentStructure.Cta.find((cta) => cta.CtaId === ctaId);
        }
    }
}
//# sourceMappingURL=ContentMapper.js.map