const environment = "/Comforta_version2DevelopmentNETPostgreSQL";
const baseURL = window.location.origin + (window.location.origin.startsWith("http://localhost") ? environment : "");

class DataManager {
  constructor(services = [], forms = [], media = []) {
    this.services = services;
    this.forms = forms;
    this.media = media;
    this.pages = [];
    this.selectedTheme = null;
    this.loadingManager = new LoadingManager(document.getElementById('preloader'));
  }

  // Helper method to handle API calls
  async fetchAPI(endpoint, options = {}, skipLoading = false) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
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
  
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    } finally {
      if (!skipLoading) {
        this.loadingManager.loading = false;
      }
    }
  }
  

  // Pages API methods
  async getPages() {
    this.pages = await this.fetchAPI('/api/toolbox/pages/list', {}, true);
    return this.pages;
  }

  async getServices() {
    const services = await this.fetchAPI('/api/toolbox/services', {}, true);
    this.services = services.SDT_ProductServiceCollection;
    return this.services;
  }

  async getSinglePage(pageId) {
    return await this.fetchAPI(`/api/toolbox/singlepage?Pageid=${pageId}`);
  }

  async deletePage(pageId) {
    return await this.fetchAPI(`/api/toolbox/deletepage?Pageid=${pageId}`);
  }

  async getPagesService() {
    return await this.fetchAPI('/api/toolbox/pages/tree');
  }

  async createNewPage(pageName, theme) {
    let pageJsonContent = generateNewPage(theme)
    return await this.fetchAPI('/api/toolbox/create-page', {
      method: 'POST',
      body: JSON.stringify({ PageName: pageName, PageJsonContent: JSON.stringify(pageJsonContent) }),
    });
  }

  async updatePage(data) {
    return await this.fetchAPI('/api/toolbox/update-page', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true); // Pass true to skip loading
  }

  async updatePagesBatch(payload) {
    return await this.fetchAPI('/api/toolbox/update-pages-batch', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async addPageChild(childPageId, currentPageId) {
    return await this.fetchAPI('/api/toolbox/add-page-children', {
      method: 'POST',
      body: JSON.stringify({
        ParentPageId: currentPageId,
        ChildPageId: childPageId,
      }),
    });
  }

  async createContentPage(pageId) {
    return await this.fetchAPI('/api/toolbox/create-content-page', {
      method: 'POST',
      body: JSON.stringify({ PageId: pageId }),
    });
  }

  async createDynamicFormPage(formId, pageName) {
    return await this.fetchAPI('/api/toolbox/create-dynamic-form-page', {
      method: 'POST',
      body: JSON.stringify({ FormId: formId, PageName: pageName }),
    });
  }

  // Theme API methods
  async getLocationTheme() {
    return await this.fetchAPI('/api/toolbox/location-theme');
  }

  async updateLocationTheme() {
    if (!this.selectedTheme?.ThemeId) {
      throw new Error('No theme selected');
    }

    return await this.fetchAPI('/api/toolbox/update-location-theme', {
      method: 'POST',
      body: JSON.stringify({ ThemeId: this.selectedTheme.ThemeId }),
    });
  }

  // Media API methods
  async getMediaFiles() {
    return await this.fetchAPI('/api/media/');
  }

  async deleteMedia(mediaId) {
    return await this.fetchAPI(`/api/media/delete?MediaId=${mediaId}`);
  }

  async uploadFile(fileData, fileName, fileSize, fileType) {
    if (!fileData) {
      throw new Error('Please select a file!');
    }

    return await this.fetchAPI('/api/media/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: JSON.stringify({
        MediaName: fileName,
        MediaImageData: fileData,
        MediaSize: fileSize,
        MediaType: fileType,
      }),
    }, true);
  }

  async uploadLogo(logoUrl) {
    return await this.fetchAPI('/api/media/upload/logo', {
      method: 'POST',
      body: JSON.stringify({ LogoUrl: logoUrl }),
    });
  }

  async uploadProfileImage(profileImageUrl) {
    return await this.fetchAPI('/api/media/upload/profile', {
      method: 'POST',
      body: JSON.stringify({ ProfileImageUrl: profileImageUrl }),
    });
  }

  // Content API methods
  async getContentPageData(productServiceId) {
    return await this.fetchAPI(`/api/productservice?Productserviceid=${productServiceId}`);
  }
}
