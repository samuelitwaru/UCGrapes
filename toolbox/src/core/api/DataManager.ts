import { LoadingManager } from "../../controls/LoadingManager";

const environment = "/Comforta_version2DevelopmentNETPostgreSQL";
const baseURL = window.location.origin + (window.location.origin.startsWith("http://localhost") ? environment : "");

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface Service {
  SDT_ProductServiceCollection: any[];
}

interface Page {
  PageId: number;
  PageName: string;
  PageJsonContent?: string;
}

interface Theme {
  ThemeId: string;
}


class DataManager {
  private services: any[];
  private forms: any[];
  private media: any[];
  private pages: Page[];
  private selectedTheme: Theme | null;
  private loadingManager: LoadingManager;

  constructor(services: any[] = [], forms: any[] = [], media: any[] = []) {
    this.services = services;
    this.forms = forms;
    this.media = media;
    this.pages = [];
    this.selectedTheme = null;
    this.loadingManager = new LoadingManager(document.getElementById('preloader')!);
  }

  private async fetchAPI<T>(endpoint: string, options: FetchOptions = {}, skipLoading = false): Promise<T> {
    const defaultOptions: FetchOptions = {
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

  async getPages(): Promise<Page[]> {
    this.pages = await this.fetchAPI<Page[]>('/api/toolbox/pages/list', {}, true);
    return this.pages;
  }

  async getServices(): Promise<any[]> {
    const services = await this.fetchAPI<Service>('/api/toolbox/services', {}, true);
    this.services = services.SDT_ProductServiceCollection;
    return this.services;
  }

  async getSinglePage(pageId: number): Promise<Page> {
    return await this.fetchAPI<Page>(`/api/toolbox/singlepage?Pageid=${pageId}`);
  }

  async deletePage(pageId: number): Promise<void> {
    await this.fetchAPI<void>(`/api/toolbox/deletepage?Pageid=${pageId}`);
  }

  async createNewPage(pageName: string, theme: Theme): Promise<Page> {
    let pageJsonContent = JSON.stringify(theme); // Replace with generateNewPage function
    return await this.fetchAPI<Page>('/api/toolbox/create-page', {
      method: 'POST',
      body: JSON.stringify({ PageName: pageName, PageJsonContent: pageJsonContent }),
    });
  }

  async updatePage(data: Partial<Page>): Promise<void> {
    await this.fetchAPI<void>('/api/toolbox/update-page', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async getMediaFiles(): Promise<any[]> {
    return await this.fetchAPI<any[]>('/api/media/');
  }

  async deleteMedia(mediaId: number): Promise<void> {
    await this.fetchAPI<void>(`/api/media/delete?MediaId=${mediaId}`);
  }

  async uploadFile(fileData: any, fileName: string, fileSize: number, fileType: string): Promise<void> {
    if (!fileData) {
      throw new Error('Please select a file!');
    }

    await this.fetchAPI<void>('/api/media/upload', {
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
}
