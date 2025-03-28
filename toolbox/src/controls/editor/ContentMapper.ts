export class ContentMapper {
    pageId: any;
    constructor(pageId: any) {
        this.pageId = pageId;
    }

    public contentRow (content: any): any {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        const row = {
            "ContentType": content.ContentType,
            "ContentValue": content.Content,
        }

        return row;
    }

    moveContentRow(contentId: any, newIndex: number): void {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (!data?.PageContentStructure?.Content) return;
    
        const contentArray = data.PageContentStructure.Content;
        const contentRowIndex = contentArray.findIndex((row: any) => row.ContentId === contentId);
        
        if (contentRowIndex === -1 || newIndex < 0 || newIndex >= contentArray.length) return;
    
        const [contentRow] = contentArray.splice(contentRowIndex, 1);
    
        // Insert the item at the new position
        contentArray.splice(newIndex, 0, contentRow);
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }

    updateContentDescription(contentId: any, newDescription: string): boolean {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (!data?.PageContentStructure?.Content) return false;
    
        const ContentItem = data.PageContentStructure.Content.find((Content: any) => Content.ContentId === contentId);
            
        if (ContentItem) {
            ContentItem.ContentValue = newDescription; 
            
            localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
            return true; 
        }
    
        return false; 
    }

    updateContentImage(contentId: any, newImageUrl: string): boolean {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (!data?.PageContentStructure?.Content) return false;
    
        const ContentItem = data.PageContentStructure.Content.find((Content: any) => Content.ContentId === contentId);
            
        if (ContentItem) {
            ContentItem.ContentValue = newImageUrl; 
            
            localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
            return true; 
        }
    
        return false; 
    }
    
    

    moveCta(CtaId: any, newIndex: number): void {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (!data?.PageContentStructure?.Cta) return;
    
        const contentArray = data.PageContentStructure.Cta;
        const contentRowIndex = contentArray.findIndex((row: any) => row.CtaId === CtaId);
        
        if (contentRowIndex === -1 || newIndex < 0 || newIndex >= contentArray.length) return;
    
        const [contentRow] = contentArray.splice(contentRowIndex, 1);
    
        // Insert the item at the new position
        contentArray.splice(newIndex, 0, contentRow);
    
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }
    

    public addContentCta (cta: any): any {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");

        const ctaButton = {
            "CtaId": cta.CtaId,
            "CtaType": cta.CtaType,
            "CtaLabel": cta.CtaLabel,
            "CtaAction": cta.CtaAction,
            "CtaBGColor": cta.CtaBGColor,
            "CtaButtonType": cta.CtaButtonType,
            "CtaButtonImgUrl": cta.CtaButtonImgUrl,
        }
         if (!data.PageContentStructure.Cta) {
            data.PageContentStructure.Cta = [];
         }

        data?.PageContentStructure?.Cta.push(ctaButton);
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }

    public removeContentCta (ctaId: any): any {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");

        if (data && data.PageContentStructure && data.PageContentStructure.Cta) {
            const ctaIndex = data.PageContentStructure.Cta.findIndex((cta: any) => cta.CtaId === ctaId);
            
            if (ctaIndex !== -1 && data.PageContentStructure.Cta[ctaIndex]) {
                data.PageContentStructure.Cta.splice(ctaIndex, 1);
                
                localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
                return true;
            }
        }
    }

    public updateContentCtaBGColor (ctaId: any, bgColor: any): any {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");

        if (data && data.PageContentStructure && data.PageContentStructure.Cta) {
            const ctaIndex = data.PageContentStructure.Cta.findIndex((cta: any) => cta.CtaId === ctaId);
            
            if (ctaIndex !== -1 && data.PageContentStructure.Cta[ctaIndex]) {
                data.PageContentStructure.Cta[ctaIndex].CtaBGColor = bgColor;
                
                localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
                return true; 
            }
        }
    }

    public updateContentButtonType (ctaId: any, buttonType: any, imageUrl?: any): any {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");

        if (data && data.PageContentStructure && data.PageContentStructure.Cta) {
            const ctaIndex = data.PageContentStructure.Cta.findIndex((cta: any) => cta.CtaId === ctaId);
            
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

    public getContentCta(ctaId: any): any {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");

        if (data && data.PageContentStructure && data.PageContentStructure.Cta) {
            return data.PageContentStructure.Cta.find((cta: any) => cta.CtaId === ctaId);
        }
    }
}