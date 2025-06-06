import { AppConfig } from "../AppConfig";
import { LoadingManager } from "../controls/LoadingManager";
import { Theme } from "../types";
import { environment } from "../utils/env";


export const baseURL =
  window.location.origin +
  (window.location.origin.startsWith("http://localhost") ? environment : "");

export class ToolBoxService {
  private config: AppConfig;
  services: any[] = [];
  forms: any[] = [];
  loadingManager: any;
  preloaderEl: HTMLElement = document.getElementById("preloader")!;

  constructor() {
    this.config = AppConfig.getInstance();
    this.init();
  }

  init() {
    this.services = this.config.services;
    this.forms = (window as any).app.forms;
    this.loadingManager = new LoadingManager(this.preloaderEl);
  }
  // Helper method to handle API calls
  async fetchAPI(endpoint: string, options = {}, skipLoading = false) {
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      if (!skipLoading) {
        this.loadingManager.loading = true;
      }

      const response = await fetch(`${baseURL}${endpoint}`, {
        ...defaultOptions,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json()

      if (data?.error && data.error?.Message == "Not Authenticated") {
        location.reload()
      }

      return await data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    } finally {
      if (!skipLoading) {
        this.loadingManager.loading = false;
      }
    }
  }

  async debugApp(urlList: any) {
    const response = await this.fetchAPI(
      "/api/toolbox/v2/debug",
      {
        method: "POST",
        body: JSON.stringify({
          PageUrlList: urlList,
        }),
      },
      true
    );

    return response;
  }

  async getVersions() {
    const response = await this.fetchAPI(
      "/api/toolbox/v2/appversions",
      {},
      true
    );
    return response;
  }

  async getVersion() {
    const response = await this.fetchAPI(
      "/api/toolbox/v2/appversion",
      {},
      true
    );
    return response;
  }

  async createVersion(versionName: any) {
    const response = await this.fetchAPI("/api/toolbox/v2/create-appversion", {
      method: "POST",
      body: JSON.stringify({
        AppVersionName: versionName,
      }),
    });

    return response;
  }

  async duplicateVersion(appVersionId: string, versionName: any) {
    const response = await this.fetchAPI("/api/toolbox/v2/copy-appversion", {
      method: "POST",
      body: JSON.stringify({
        AppVersionId: appVersionId,
        AppVersionName: versionName,
      }),
    });

    return response;
  }

  async renameVersion(appVersionId: string, versionName: any) {
    const response = await this.fetchAPI("/api/toolbox/v2/update-appversion", {
      method: "POST",
      body: JSON.stringify({
        AppVersionId: appVersionId,
        AppVersionName: versionName,
      }),
    });

    return response;
  }

  async activateVersion(versionId: any) {
    const response = await this.fetchAPI(
      "/api/toolbox/v2/activate-appversion",
      {
        method: "POST",
        body: JSON.stringify({
          AppVersionId: versionId,
        }),
      }
    );

    return response;
  }

  async deleteVersion(appVersionId: string) {
    return await this.fetchAPI("/api/toolbox/v2/delete-version", {
      method: "POST",
      body: JSON.stringify({
        AppVersionId: appVersionId,
      }),
    });
  }
  

  async createMenuPage(appVersionId: string, pageName: string) {
    const response = await this.fetchAPI("/api/toolbox/v2/create-menu-page", {
      method: "POST",
      body: JSON.stringify({
        appVersionId: appVersionId,
        pageName: pageName,
      }),
    });

    return response;
  }

  async createInfoPage(appVersionId: string, pageName: string) {
    const response = await this.fetchAPI("/api/toolbox/v2/create-info-page", {
      method: "POST",
      body: JSON.stringify({
        appVersionId: appVersionId,
        pageName: pageName,
      }),
    });

    return response;
  }

  async createLinkPage(
    appVersionId: string,
    pageName: string,
    url: string,
    formId: any
  ) {
    const response = await this.fetchAPI("/api/toolbox/v2/create-link-page", {
      method: "POST",
      body: JSON.stringify({
        appVersionId: appVersionId,
        pageName: pageName,
        url: url,
        WWPFormId: formId,
      }),
    });

    return response;
  }

  async createServicePage(appVersionId: string, productServiceId: string) {
    const response = await this.fetchAPI(
      "/api/toolbox/v2/create-service-page",
      {
        method: "POST",
        body: JSON.stringify({
          appVersionId: appVersionId,
          ProductServiceId: productServiceId,
        }),
      }
    );
    return response;
  }

  async createContentPage(appVersionId: string, pageName: string) {
    const response = await this.fetchAPI(
      "/api/toolbox/v2/create-content-page",
      {
        method: "POST",
        body: JSON.stringify({
          appVersionId: appVersionId,
          PageName: pageName,
        }),
      }
    );
    return response;
  }

  async createServiceCTA(payload: any) {
    const response = await this.fetchAPI("/api/toolbox/v2/create-service-cta", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response;
  }

  async autoSavePage(pageData: any) {
    const response = await this.fetchAPI(
      "/api/toolbox/v2/save-page",
      {
        method: "POST",
        body: JSON.stringify(pageData),
      },
      true
    );
    return response;
  }

  async savePageThumbnail(PageId: any, PageThumbnailData: any) {
    const response = await this.fetchAPI(
      "/api/toolbox/v2/save-page-thumbnail",
      {
        method: "POST",
        body: JSON.stringify({
          PageId: PageId,
          PageThumbnailData: PageThumbnailData,
        }),
      },
      true
    );
    return response;
  }

  async updatePageTitle(pageData: any) {
    const response = await this.fetchAPI(
      "/api/toolbox/v2/update-page-title",
      {
        method: "POST",
        body: JSON.stringify(pageData),
      },
      true
    );

    return response;
  }

  async publishAppVersion(appVersionId: string, notify = false) {
    return await this.fetchAPI("/api/toolbox/v2/publish-appversion", {
      method: "POST",
      body: JSON.stringify({
        AppVersionId: appVersionId,
        Notify: notify,
      }),
    });
  }

  // Pages API methods
  async getPages() {
    const response = await this.fetchAPI("/api/toolbox/pages/list", {}, true);
    return response.SDT_PageCollection;
  }

  async getServices() {
    const services = await this.fetchAPI("/api/toolbox/services", {}, true);
    this.services = services.SDT_ProductServiceCollection;
    return this.services;
  }

  // get forms of a supplier
  async getSupplierForms(supplierId: string | number) {
    return await this.fetchAPI(
      `/api/toolbox/v2/supplier-forms?Supplierid=${supplierId}`,
      {},
      true
    );
  }

  async getSinglePage(pageId: string | number) {
    return await this.fetchAPI(`/api/toolbox/singlepage?Pageid=${pageId}`);
  }

  async deletePage(appVersionId: string, pageId: string) {
    return await this.fetchAPI("/api/toolbox/V2/delete-page", {
      method: "POST",
      body: JSON.stringify({
        AppVersionId: appVersionId,
        PageId: pageId,
      }),
    });
  }

  async getPagesService() {
    return await this.fetchAPI("/api/toolbox/pages/tree");
  }

  async createNewPage(pageName: string, theme: Theme) {
    let pageJsonContent = {};
    return await this.fetchAPI("/api/toolbox/create-page", {
      method: "POST",
      body: JSON.stringify({
        PageName: pageName,
        PageJsonContent: JSON.stringify(pageJsonContent),
      }),
    });
  }

  async updatePage(data: string[]) {
    return await this.fetchAPI(
      "/api/toolbox/update-page",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true
    ); // Pass true to skip loading
  }

  async updatePagesBatch(payload: string) {
    return await this.fetchAPI("/api/toolbox/update-pages-batch", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async addPageChild(
    childPageId: string | number,
    currentPageId: string | number
  ) {
    return await this.fetchAPI("/api/toolbox/add-page-children", {
      method: "POST",
      body: JSON.stringify({
        ParentPageId: currentPageId,
        ChildPageId: childPageId,
      }),
    });
  }

  // async createServicePage(pageId: string | number) {
  //   return await this.fetchAPI("/api/toolbox/create-content-page", {
  //     method: "POST",
  //     body: JSON.stringify({ PageId: pageId }),
  //   });
  // }

  async createDynamicFormPage(formId: string | number, pageName: string) {
    return await this.fetchAPI("/api/toolbox/create-dynamic-form-page", {
      method: "POST",
      body: JSON.stringify({ FormId: formId, PageName: pageName }),
    });
  }

  // Theme API methods
  async getLocationTheme() {
    return await this.fetchAPI("/api/toolbox/location-theme");
  }

  async updateAppVersionTheme(appVersionId:string, themeId: string) {
    
    return await this.fetchAPI("/api/toolbox/update-appversion-theme", {
      method: "POST",
      body: JSON.stringify({ AppVersionId:appVersionId, ThemeId: themeId }),
    });
  }

  // Media API methods
  async getMediaFiles() {
    const response = await this.fetchAPI("/api/toolbox/media", {}, true);
    return response.SDT_MediaCollection;
  }

  async deleteMedia(mediaId: string | number) {
    return await this.fetchAPI(`/api/media/delete?MediaId=${mediaId}`);
  }

  async uploadFile(
    fileData: string,
    fileName: string,
    fileSize: number,
    fileType: string
  ) {
    if (!fileData) {
      throw new Error("Please select a file!");
    }

    return await this.fetchAPI(
      "/api/media/upload",
      {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: JSON.stringify({
          MediaName: fileName,
          MediaImageData: fileData,
          MediaSize: fileSize,
          MediaType: fileType,
        }),
      },
      true
    );
  }

  async uploadCroppedFile(
    fileData: string,
    fileName: string,
    fileSize: number,
    fileType: string
  ) {
    if (!fileData) {
      throw new Error("Please select a file!");
    }

    return await this.fetchAPI(
      "/api/media/upload/cropped",
      {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: JSON.stringify({
          MediaName: fileName,
          MediaImageData: fileData,
          MediaSize: fileSize,
          MediaType: fileType,
        }),
      },
      true
    );
  }

  async uploadLogo(logoUrl: string) {
    return await this.fetchAPI("/api/media/upload/logo", {
      method: "POST",
      body: JSON.stringify({ LogoUrl: logoUrl }),
    });
  }

  async uploadProfileImage(profileImageUrl: string) {
    return await this.fetchAPI("/api/media/upload/profile", {
      method: "POST",
      body: JSON.stringify({ ProfileImageUrl: profileImageUrl }),
    });
  }

  // Content API methods
  async getContentPageData(productServiceId: string | number) {
    return await this.fetchAPI(
      `/api/productservice?Productserviceid=${productServiceId}`,
      {},
      true
    );
  }

  async updateDescription(data: any) {
    return await this.fetchAPI("/api/toolbox/v2/update-service", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateContentImage(data: any) {
    return await this.fetchAPI("/api/toolbox/v2/update-service", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteContentImage(data: any) {
    return await this.fetchAPI("/api/toolbox/v2/delete-service-image", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getLocationData() {
    return await this.fetchAPI("/api/toolbox/v2/get-location", {}, true);
  }

  async updateLocationInfo(data: any) {
    return await this.fetchAPI("/api/toolbox/v2/update-location", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTrashItems() {
    return await this.fetchAPI("/api/toolbox/v2/get-trash", {}, true);
  }

  async restoreTrash(type: string, trashId: any) {
    return await this.fetchAPI("/api/toolbox/v2/restore-trash", {
      method: "POST",
      body: JSON.stringify({
        Type: type,
        TrashId: trashId,
      }),
    });
  }

  async deleteTrashForver(type: string, trashId: any) {
    return await this.fetchAPI("/api/toolbox/v2/delete-trash", {
      method: "POST",
      body: JSON.stringify({
        Type: type,
        TrashId: trashId,
      }),
    });
  }
}
