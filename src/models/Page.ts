export class Page {
    PageId: string;
    LocationId: string;
    PageName: string;
    PageJsonContent?: string | null;
    PageGJSHTML?: string | null;
    PageGJSJson?: string | null;
    PageIsPublished?: boolean | null;
    PageIsPredefined: boolean;
    PageIsContentPage?: boolean | null;
    PageIsDynamicForm: boolean;
    PageIsWeblinkPage: boolean;
    PageChildren?: string | null;
    ProductServiceId?: string | null;
    OrganisationId: string;

    PageTileName?: string;
  
    constructor(
      PageId: string,
      LocationId: string,
      trn_pagename: string,
      PageJsonContent: string | null = null,
      PageGJSHTML: string | null = null,
      PageGJSJson: string | null = null,
      PageIsPublished: boolean | null = null,
      PageIsPredefined: boolean,
      PageIsContentPage: boolean | null = null,
      PageIsDynamicForm: boolean,
      PageIsWeblinkPage: boolean,
      PageChildren: string | null = null,
      ProductServiceId: string | null = null,
      OrganisationId: string
    ) {
      this.PageId = PageId;
      this.LocationId = LocationId;
      this.PageName = trn_pagename;
      this.PageJsonContent = PageJsonContent;
      this.PageGJSHTML = PageGJSHTML;
      this.PageGJSJson = PageGJSJson;
      this.PageIsPublished = PageIsPublished;
      this.PageIsPredefined = PageIsPredefined;
      this.PageIsContentPage = PageIsContentPage;
      this.PageIsDynamicForm = PageIsDynamicForm;
      this.PageIsWeblinkPage = PageIsWeblinkPage;
      this.PageChildren = PageChildren;
      this.ProductServiceId = ProductServiceId;
      this.OrganisationId = OrganisationId;
    }
  }
  