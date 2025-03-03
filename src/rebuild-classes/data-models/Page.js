"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Page = void 0;
var Page = /** @class */ (function () {
    function Page(PageId, LocationId, trn_pagename, PageJsonContent, PageGJSHTML, PageGJSJson, PageIsPublished, PageIsPredefined, PageIsContentPage, PageIsDynamicForm, PageIsWeblinkPage, PageChildren, ProductServiceId, OrganisationId) {
        if (PageJsonContent === void 0) { PageJsonContent = null; }
        if (PageGJSHTML === void 0) { PageGJSHTML = null; }
        if (PageGJSJson === void 0) { PageGJSJson = null; }
        if (PageIsPublished === void 0) { PageIsPublished = null; }
        if (PageIsContentPage === void 0) { PageIsContentPage = null; }
        if (PageChildren === void 0) { PageChildren = null; }
        if (ProductServiceId === void 0) { ProductServiceId = null; }
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
    return Page;
}());
exports.Page = Page;
