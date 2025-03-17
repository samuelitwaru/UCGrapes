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

    public addContentCta (cta: any): any {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");

        const ctaButton = {
            "CtaId": cta.CtaId,
            "CtaType": cta.CtaType,
            "CtaLabel": cta.CtaLabel,
            "CtaAction": cta.CtaAction,
            "CtaBGColor": cta.CtaBGColor,
            "CtaButtonType": cta.CtaButtonType
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

    public getContentCta(ctaId: any): any {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");

        if (data && data.PageContentStructure && data.PageContentStructure.Cta) {
            return data.PageContentStructure.Cta.find((cta: any) => cta.CtaId === ctaId);
        }
    }
}