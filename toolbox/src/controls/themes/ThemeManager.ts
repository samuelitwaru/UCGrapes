import ToolboxApp from "../../app";
import { AppConfig } from "../../AppConfig";
import { Theme, ThemeColors, ThemeCtaColor } from "../../models/Theme";
import { ColorPalette } from "../../ui/components/tools-section/ColorPalette";
import { CtaColorPalette } from "../../ui/components/tools-section/content-section/CtaColorPalette";
import { ContentSection } from "../../ui/components/tools-section/ContentSection";
import { IconList } from "../../ui/components/tools-section/icon-list/IconList";
import { IconListCategories } from "../../ui/components/tools-section/icon-list/IconListCategories";
import { AppVersionManager } from "../versions/AppVersionManager";

export class ThemeManager {
  private config: AppConfig;
  currentTheme: Theme | any;

  themes: any[] = [];
  appVersionManager: any;

  constructor() {
    this.config = AppConfig.getInstance();
    this.appVersionManager = new AppVersionManager();
    this.setThemes(this.config.themes);
  }

  setThemes(themes: any[]) {
    this.themes = themes;
    this.currentTheme = this.getThemes().find(
      (theme: Theme) => theme.ThemeId === this.config.currentThemeId
    );
  }

  getThemes() {
    return this.themes;
  }

  getActiveThemeIcons() {
    return this.currentTheme ? this.currentTheme.ThemeIcons : [];
  }

  getActiveThemeColors() {
    return this.currentTheme ? this.currentTheme.ThemeColors : {};
  }

  getActiveThemeCtaColors() {
    return this.currentTheme ? this.currentTheme.ThemeCtaColors : {};
  }

  setTheme(theme: Theme) {
    this.config.currentThemeId = theme.ThemeId;
    this.updateColorPallete(theme.ThemeColors);
    this.updateCtaColorPallete(theme.ThemeCtaColors);
    this.updateThemeIcons();
    this.applyTheme(theme);
  }

  updateColorPallete(colors: ThemeColors) {
    const colorPallete = new ColorPalette(colors, "theme-color-palette");
    const parent = document.querySelector(
      ".sidebar-section .theme-section"
    ) as HTMLElement;

    colorPallete.refresh(parent);
  }

  updateCtaColorPallete(ctaColors: ThemeCtaColor) {
    const ctaColorPallete = new CtaColorPalette(ctaColors);
    const container  = document.getElementById('content-page-section') as HTMLElement;
    ctaColorPallete.refresh(container);
  }

  updateThemeIcons() {
    const iconsList = document.getElementById("icons-list") as HTMLElement;
    iconsList.classList.add("icons-list");
    iconsList.id = "icons-list";
    iconsList.innerHTML = "";

    const themeIcons = new IconList(this, "General");
    themeIcons.render(iconsList);
  }

  getThemeColor(colorName: string) {

    if (!this.currentTheme || !this.currentTheme.ThemeColors) {
      console.error("ThemeColors is undefined or invalid:", this.currentTheme);
      return null;
    }

    return this.currentTheme.ThemeColors[colorName] || 'transparent';
  }

  getThemeCtaColor(colorName: string) {

    if (!this.currentTheme || !this.currentTheme.ThemeCtaColors) {
      console.error("ThemeColors is undefined or invalid:", this.currentTheme);
      return null;
    }

    return this.currentTheme.ThemeCtaColors.find((color: any) => color.CtaColorName === colorName)?.CtaColorCode || '#5068a8';
  }

  async applyTheme (theme: Theme) {
    const iframes = document.querySelectorAll(".mobile-frame iframe") as NodeListOf<HTMLIFrameElement>;
    if (!iframes.length) return;

    const activeVersion = await this.appVersionManager.getActiveVersion();
    if (activeVersion) {
      const pages = activeVersion.Pages;
      pages.forEach(async (page: any) => {
        const pageId = page.PageId;
        const localStorageKey = `data-${pageId}`;
        const pageData = JSON.parse(localStorage.getItem(localStorageKey) || "{}");
        
        if (pageData.PageMenuStructure) {
          const rows = pageData.PageMenuStructure?.Rows;
          rows.forEach((row: any) => {
            row.Tiles.forEach((tile: any) => {
              if (tile.BGColor) {
                iframes.forEach((iframe) => {
                  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                  if (iframeDoc) {
                    this.updateFontFamily(iframeDoc, theme.ThemeFontFamily);
                    const tileWrapper = iframeDoc.getElementById(tile.Id);
                    if (tileWrapper) {
                      const tileEl = tileWrapper.querySelector('.template-block') as HTMLElement;
                      if (tileEl) {
                        tileEl.setAttribute('style', `background-color: ${theme?.ThemeColors?.[tile.BGColor as keyof ThemeColors]};`)
                      }                      
                    }
                  }
                });
              }
            });
          });
        }
      });
    }
  }

  updateFontFamily(iframeDoc: any, fontFamily: string = "Comic Sans MS") {
    try {
      const root = iframeDoc.documentElement;
      root.style.setProperty('--font-family', fontFamily);
    } catch (error) {
      console.error('Error updating font family:', error);
    }
  }
}
