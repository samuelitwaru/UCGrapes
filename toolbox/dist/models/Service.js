export class ProductService {
    constructor(ProductServiceId, LocationId, OrganisationId, ProductServiceName, ProductServiceTileName, ProductServiceDescription, ProductServiceImage, ProductServiceImage_GXI = null, ProductServiceGroup, SupplierGenId = null, SupplierAGBId = null, ProductServiceClass) {
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
}
//# sourceMappingURL=Service.js.map