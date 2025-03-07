"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Page = void 0;
class Page {
    constructor(PageId, LocationId, trn_pagename, PageJsonContent = null, PageGJSHTML = null, PageGJSJson = null, PageIsPublished = null, PageIsPredefined, PageIsContentPage = null, PageIsDynamicForm, PageIsWeblinkPage, PageChildren = null, ProductServiceId = null, OrganisationId) {
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
exports.Page = Page;
