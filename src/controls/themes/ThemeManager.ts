import ToolboxApp from "../../app";
import { AppConfig } from "../../AppConfig";
import { InfoType, Theme, ThemeColors, ThemeCtaColor, Tile } from "../../types";
import { ColorPalette } from "../../ui/components/tools-section/ColorPalette";
import { CtaColorPalette } from "../../ui/components/tools-section/content-section/CtaColorPalette";
import { IconList } from "../../ui/components/tools-section/icon-list/IconList";
import { IconListCategories } from "../../ui/components/tools-section/icon-list/IconListCategories";
import { AppVersionManager } from "../versions/AppVersionManager";

interface WindowApp {
  currentThemeId: string;
}

interface GlobalThis {
  activeVersion?: {
    ThemeId: string;
    Pages: Array<{
      PageId: string;
    }>;
  };
}

interface PageData {
  PageContentStructure?: {
    Cta?: Array<{
      CtaId: string;
      CtaBGColor: string;
    }>;
  };
  PageInfoStructure?: {
    InfoContent?: InfoType[];
  };
}

export class ThemeManager {
  private readonly config: AppConfig;
  private _currentTheme: Theme | null = null;
  private _themes: Theme[] = [];
  private readonly appVersionManager: AppVersionManager;

  constructor() {
    this.config = AppConfig.getInstance();
    this.appVersionManager = new AppVersionManager();
    this.setThemes(this.config.themes);
  }

  get currentTheme(): Theme | null {
    return this._currentTheme;
  }

  setThemes(themes: Theme[]): void {
    this._themes = themes;
    this._currentTheme = this.getThemes().find(
      (theme: Theme) => theme.ThemeId === this.getWindowAppCurrentThemeId()
    ) || null;
    if(this._currentTheme) {
      window.DynamicFormSubmitButtonColor = this._currentTheme.ThemeColors.backgroundColor;
    }
  }

  getThemes(): Theme[] {
    return this._themes;
  }

  getThemeById(themeId: string): Theme | undefined {
    return this._themes.find((theme: Theme) => theme.ThemeId === themeId);
  }

  getActiveThemeIcons(): any[] {
    return this._currentTheme?.ThemeIcons || [];
  }

  getActiveThemeColors(): ThemeColors | Record<string, never>{
    return this._currentTheme?.ThemeColors || {};
  }

  getActiveThemeCtaColors(): ThemeCtaColor | Record<string, never> {
    return this._currentTheme?.ThemeCtaColors || {};
  }

  setTheme(theme: Theme): void {
    this._currentTheme = theme;
    this.appVersionManager.getUpdatedActiveVersion();
    this.setWindowAppCurrentThemeId(theme.ThemeId);
    this.config.currentThemeId = theme.ThemeId;
    this.applyTheme(theme.ThemeId);
    if(this._currentTheme) {
      window.DynamicFormSubmitButtonColor = this._currentTheme.ThemeColors.backgroundColor;
      if(window.DynamicFormSubmitButton) {
        window.DynamicFormSubmitButton.style.backgroundColor = window.DynamicFormSubmitButtonColor;
      }
    }
  }

  updateColorPallete(colors: ThemeColors): void {
    try {
      const colorPallete = new ColorPalette(colors, "theme-color-palette");
      const parent = document.querySelector(
        ".sidebar-section.theme-section"
      ) as HTMLElement;

      if (colorPallete && parent) {
        colorPallete.refresh(parent);
      }
    } catch (error) {
      console.error('Error updating color palette:', error);
    }
  }

  updateCtaColorPallete(ctaColors: ThemeCtaColor): void {
    try {
      const ctaColorPallete = new CtaColorPalette(ctaColors);
      const container = document.getElementById('content-page-section') as HTMLElement;
      if (container) {
        ctaColorPallete.refresh(container);
      }
    } catch (error) {
      console.error('Error updating CTA color palette:', error);
    }
  }

  updateThemeIcons(categoryTitle: string = "General"): void {
    try {
      const menuPageSection = document.getElementById("menu-page-section") as HTMLElement;
      if (menuPageSection) {
        const themeIcons = new IconListCategories(categoryTitle);
        themeIcons.render(menuPageSection);
      }
    } catch (error) {
      console.error('Error updating theme icons:', error);
    }
  }

  getThemeColor(colorName: string): string | null {
    if (!this._currentTheme || !this._currentTheme.ThemeColors) {
      console.error("ThemeColors is undefined or invalid:", this._currentTheme);
      return null;
    }
    return this._currentTheme.ThemeColors[colorName as keyof ThemeColors] || 'transparent';
  }

  getThemeCtaColor(colorName: string = "ctaColor1"): string {
    if (!this._currentTheme || !this._currentTheme.ThemeCtaColors) {
      console.error("ThemeColors is undefined or invalid:", this._currentTheme);
      return '#5068a8';
    }

    const ctaColors = Array.isArray(this._currentTheme.ThemeCtaColors) 
      ? this._currentTheme.ThemeCtaColors 
      : [];
    return ctaColors.find((color: any) => color.CtaColorName === colorName)?.CtaColorCode || '#5068a8';
  }

  getThemeIcon(iconName: string): string | null {
    const icons = this.getActiveThemeIcons();
    return icons?.find((icon: any) => icon.IconName === iconName)?.IconSVG || null;
  }

  getIconCategory(iconName: string): string | null {
    const icons = this.getActiveThemeIcons();
    return icons?.find((icon: any) => icon.IconName === iconName)?.IconCategory || null;
  }

  async applyTheme(themeId?: string): Promise<void> {
    try {
      const newThemeId = themeId || this.getGlobalActiveVersionThemeId();
      if (!newThemeId) return;

      const theme: Theme | undefined = this.getThemeById(newThemeId);
      if (!theme) return;

      const iframes = document.querySelectorAll(".mobile-frame iframe") as NodeListOf<HTMLIFrameElement>;
      if (!iframes.length) return;

      const activeVersion = this.getGlobalActiveVersion();
      
      if (activeVersion?.Pages) {
        for (const page of activeVersion.Pages) {
          await this.processPage(page, iframes, theme);
        }
        
        this.updateColorPallete(theme.ThemeColors);
        this.updateCtaColorPallete(theme.ThemeCtaColors);
        this.updateThemeIcons();
      }
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }

  private async processPage(page: { PageId: string }, iframes: NodeListOf<HTMLIFrameElement>, theme: Theme): Promise<void> {
    try {
      const pageId = page.PageId;
      const localStorageKey = `data-${pageId}`;
      const pageDataStr = localStorage.getItem(localStorageKey);
      const pageData: PageData = pageDataStr ? JSON.parse(pageDataStr) : {};

      if (pageData.PageContentStructure?.Cta) {
        this.processPageContentCtas(pageData.PageContentStructure.Cta, iframes, theme);
      }

      if (pageData.PageInfoStructure?.InfoContent) {
        this.processPageInfoContent(pageData.PageInfoStructure.InfoContent, iframes, theme);
      }
    } catch (error) {
      console.error(`Error processing page ${page.PageId}:`, error);
    }
  }

  private processPageContentCtas(ctas: Array<{ CtaId: string; CtaBGColor: string }>, iframes: NodeListOf<HTMLIFrameElement>, theme: Theme): void {
    ctas.forEach((cta) => {
      iframes.forEach((iframe) => {
        try {
          const iframeDoc = this.getIframeDocument(iframe);
          if (iframeDoc) {
            this.updateFontFamily(iframeDoc, theme.ThemeFontFamily);
            const ctaElement = iframeDoc.querySelector(`#${cta.CtaId}`) as HTMLElement;

            if (ctaElement) {
              const ctaButton = ctaElement.querySelector('.cta-styled-btn') as HTMLElement;
              if (ctaButton) {
                ctaButton.style.backgroundColor = this.getThemeCtaColor(cta.CtaBGColor);
              }
            }

            this.updateFrameColor(iframeDoc);
          }
        } catch (error) {
          console.error('Error processing CTA:', error);
        }
      });
    });
  }

  private processPageInfoContent(infoContents: InfoType[], iframes: NodeListOf<HTMLIFrameElement>, theme: Theme): void {
    infoContents.forEach((info: InfoType) => {
      iframes.forEach((iframe) => {
        try {
          const iframeDoc = this.getIframeDocument(iframe);
          if (iframeDoc) {
            this.updateFontFamily(iframeDoc, theme.ThemeFontFamily);
            const infoElement = iframeDoc.querySelector(`#${info.InfoId}`) as HTMLElement;

            if (infoElement) {
              if (info.InfoType === "Cta") {
                const ctaButton = infoElement.querySelector('.cta-styled-btn') as HTMLElement;
                if (ctaButton && info.CtaAttributes?.CtaBGColor) {
                  ctaButton.style.backgroundColor = this.getThemeCtaColor(info.CtaAttributes.CtaBGColor);
                }
              } else if (info.InfoType === "TileRow" && info.Tiles) {
                this.processTiles(info.Tiles, iframeDoc, theme);
              }
            }
            this.updateFrameColor(iframeDoc);
          }
        } catch (error) {
          console.error('Error processing info content:', error);
        }
      });
    });
  }

  private processTiles(tiles: Tile[], iframeDoc: Document, theme: Theme): void {
    tiles.forEach((tile: Tile) => {
      try {
        const tileWrapper = iframeDoc.getElementById(tile.Id);
        if (tileWrapper) {
          const tileEl = tileWrapper.querySelector('.template-block') as HTMLElement;
          if (tileEl && !tile.BGImageUrl && tile.BGColor) {
            const bgColor = theme.ThemeColors?.[tile.BGColor as keyof ThemeColors];
            if (bgColor) {
              tileEl.style.backgroundColor = bgColor;
            }
          }
          this.updateTileIcon(tile, tileWrapper);
        }
      } catch (error) {
        console.error('Error processing tile:', error);
      }
    });
  }

  private updateTileIcon(tile: Tile, tileWrapper: HTMLElement): void {
    if (!tile || !tileWrapper) return;

    try {
      const iconEl = tileWrapper.querySelector('.tile-icon') as HTMLElement;
      if (!iconEl) return;

      const iconSVG = iconEl.querySelector('svg');
      if (!iconSVG || !tile.Icon) return;

      let newIconSVG = this.getThemeIcon(tile.Icon);
      if (!newIconSVG) return;

      if (tile.Color) {
        newIconSVG = newIconSVG.replace('fill="#7c8791"', `fill="${tile.Color}"`);
      }

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newIconSVG.trim();
      const newSVGElement = tempDiv.firstChild as SVGElement;

      if (newSVGElement) {
        iconSVG.remove();
        iconEl.appendChild(newSVGElement);
      }
    } catch (error) {
      console.error('Error updating tile icon:', error);
    }
  }

  private updateFontFamily(iframeDoc: Document, fontFamily: string = "Comic Sans MS"): void {
    try {
      const root = iframeDoc.documentElement;
      if (root) {
        root.style.setProperty('--font-family', fontFamily);
      }
    } catch (error) {
      console.error('Error updating font family:', error);
    }
  }

  private updateFrameColor(iframeDoc: Document): void {
    try {
      const backgroundColor = this.getThemeColor('backgroundColor');
      if (!backgroundColor) return;

      const toggleButtons = iframeDoc.querySelector('.tb-toggle-buttons');
      const myActivityMessageButton = toggleButtons?.children[0] as HTMLElement;
      if (myActivityMessageButton) {
        myActivityMessageButton.style.setProperty('background-color', backgroundColor);
      }

      const calendarDateSelector = iframeDoc.querySelector('.tb-date-selector') as HTMLElement;
      if (calendarDateSelector) {
        calendarDateSelector.style.setProperty('background-color', backgroundColor);
      }
    } catch (error) {
      console.error('Error updating frame color:', error);
    }
  }

  private getIframeDocument(iframe: HTMLIFrameElement): Document | null {
    try {
      return iframe.contentDocument || iframe.contentWindow?.document || null;
    } catch (error) {
      console.error('Error accessing iframe document:', error);
      return null;
    }
  }

  private getWindowAppCurrentThemeId(): string | undefined {
    try {
      return ((window as any).app as WindowApp)?.currentThemeId;
    } catch (error) {
      console.error('Error accessing window.app.currentThemeId:', error);
      return undefined;
    }
  }

  private setWindowAppCurrentThemeId(themeId: string): void {
    try {
      if ((window as any).app) {
        ((window as any).app as WindowApp).currentThemeId = themeId;
      }
    } catch (error) {
      console.error('Error setting window.app.currentThemeId:', error);
    }
  }

  private getGlobalActiveVersion(): GlobalThis['activeVersion'] | undefined {
    try {
      return ((globalThis as any) as GlobalThis).activeVersion;
    } catch (error) {
      console.error('Error accessing globalThis.activeVersion:', error);
      return undefined;
    }
  }

  private getGlobalActiveVersionThemeId(): string | undefined {
    try {
      return this.getGlobalActiveVersion()?.ThemeId;
    } catch (error) {
      console.error('Error accessing globalThis.activeVersion.ThemeId:', error);
      return undefined;
    }
  }
}