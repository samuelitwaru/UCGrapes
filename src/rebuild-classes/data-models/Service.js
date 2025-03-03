"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
var ProductService = /** @class */ (function () {
    function ProductService(ProductServiceId, LocationId, OrganisationId, ProductServiceName, ProductServiceTileName, ProductServiceDescription, ProductServiceImage, ProductServiceImage_GXI, ProductServiceGroup, SupplierGenId, SupplierAGBId, ProductServiceClass) {
        if (ProductServiceImage_GXI === void 0) { ProductServiceImage_GXI = null; }
        if (SupplierGenId === void 0) { SupplierGenId = null; }
        if (SupplierAGBId === void 0) { SupplierAGBId = null; }
        this.ProductServiceId = ProductServiceId;
        this.LocationId = LocationId;
        this.OrganisationId = OrganisationId;
        this.ProductServiceName = ProductServiceName;
        this.ProductServiceTileName = ProductServiceTileName;
        this.ProductServiceDescription = ProductServiceDescription;
        this.ProductServiceImage = ProductServiceImage;
        this.ProductServiceImage_GXI = ProductServiceImage_GXI;
        this.ProductServiceGroup = ProductServiceGroup;
        this.SupplierGenId = SupplierGenId;
        this.SupplierAGBId = SupplierAGBId;
        this.ProductServiceClass = ProductServiceClass;
    }
    return ProductService;
}());
exports.ProductService = ProductService;
