
export class ProductService {
    ProductServiceId: string;
    LocationId: string;
    OrganisationId: string;
    ProductServiceName: string;
    ProductServiceTileName: string;
    ProductServiceDescription: string;
    ProductServiceImage: Uint8Array;
    ProductServiceImage_GXI?: string | null;
    ProductServiceGroup: string;
    SupplierGenId?: string | null;
    SupplierAGBId?: string | null;
    ProductServiceClass: string;
  
    constructor(
      ProductServiceId: string,
      LocationId: string,
      OrganisationId: string,
      ProductServiceName: string,
      ProductServiceTileName: string,
      ProductServiceDescription: string,
      ProductServiceImage: Uint8Array,
      ProductServiceImage_GXI: string | null = null,
      ProductServiceGroup: string,
      SupplierGenId: string | null = null,
      SupplierAGBId: string | null = null,
      ProductServiceClass: string
    ) {
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