import ToolboxApp from "../../app";
import { AppConfig } from "../../AppConfig";
import { InfoType, Theme, ThemeColors, ThemeCtaColor, Tile } from "../../types";
import { ColorPalette } from "../../ui/components/tools-section/ColorPalette";
import { CtaColorPalette } from "../../ui/components/tools-section/content-section/CtaColorPalette";
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
      (theme: Theme) => theme.ThemeId === (window as any).app.currentThemeId
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
    this.currentTheme = theme;
    (window as any).app.currentThemeId = theme.ThemeId; 
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

    if (colorPallete) {
      colorPallete.refresh(parent);
    }
  }

  updateCtaColorPallete(ctaColors: ThemeCtaColor) {
    const ctaColorPallete = new CtaColorPalette(ctaColors);
    const container  = document.getElementById('content-page-section') as HTMLElement;
    if (container) {
      ctaColorPallete.refresh(container);
    }
  }

  updateThemeIcons(categoryTitle: string = "General") {
    const menuPageSection = document.getElementById("menu-page-section") as HTMLElement;
    const themeIcons =  new IconListCategories(categoryTitle);
    themeIcons.render(menuPageSection);
  }

  getThemeColor(colorName: string) {

    if (!this.currentTheme || !this.currentTheme.ThemeColors) {
      console.error("ThemeColors is undefined or invalid:", this.currentTheme);
      return null;
    }
    return this.currentTheme.ThemeColors[colorName] || 'transparent';
  }

  getThemeCtaColor(colorName: string) {
    if (!colorName) {
      colorName = "CtaColorOne"
    }
    if (!this.currentTheme || !this.currentTheme.ThemeCtaColors) {
      console.error("ThemeColors is undefined or invalid:", this.currentTheme);
      return null;
    }

    return this.currentTheme.ThemeCtaColors.find((color: any) => color.CtaColorName === colorName)?.CtaColorCode || '#5068a8';
  }

  getThemeIcon(iconName: string) {
    return this.getActiveThemeIcons()?.find((icon: any) => icon.IconName === iconName)?.IconSVG || null;
  }

  getIconCategory(iconName: string) {
    return this.getActiveThemeIcons()?.find((icon: any) => icon.IconName === iconName)?.IconCategory || null;
  }

  async applyTheme (theme: Theme) {
    const iframes = document.querySelectorAll(".mobile-frame iframe") as NodeListOf<HTMLIFrameElement>;
    if (!iframes.length) return;

    const activeVersion = (globalThis as any).activeVersion;
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
                        // tileEl.setAttribute('style', `background-color: ${theme?.ThemeColors?.[tile.BGColor as keyof ThemeColors]};`)
                        tileEl.style.backgroundColor = theme?.ThemeColors?.[tile.BGColor as keyof ThemeColors];
                      }   
                      this.updateTileIcon(tile, tileWrapper);                   
                    }

                    this.updateFrameColor(iframeDoc);
                  }
                });
              }
            });
          });
        }

        if (pageData.PageContentStructure) {
          const ctas = pageData.PageContentStructure?.Cta;
          ctas?.forEach((cta: any, index: number) => {
            iframes.forEach((iframe) => {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc) {
                this.updateFontFamily(iframeDoc, theme.ThemeFontFamily);
                const ctaElement = iframeDoc.querySelector(`#${cta.CtaId}`) as HTMLElement;

                if (ctaElement) {
                  const ctaButton = ctaElement.querySelector('.cta-styled-btn') as HTMLElement;
                  ctaButton.style.backgroundColor = this.getThemeCtaColor(cta.CtaBGColor);
                }

                this.updateFrameColor(iframeDoc);
              }
            });
          });
        }

        if (pageData.PageInfoStructure) {
          const infoContents = pageData.PageInfoStructure?.InfoContent;
          infoContents?.forEach((info: InfoType, index: number) => {
            iframes.forEach((iframe) => {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc) {
                this.updateFontFamily(iframeDoc, theme.ThemeFontFamily);
                const infoElement = iframeDoc.querySelector(`#${info.InfoId}`) as HTMLElement;

                if (infoElement) {
                  if (info.InfoType === "Cta") {
                    const ctaButton = infoElement.querySelector('.cta-styled-btn') as HTMLElement;
                    ctaButton.style.backgroundColor = this.getThemeCtaColor(info?.CtaAttributes?.CtaBGColor!);
                  } else if (info.InfoType === "TileRow") {
                    const tiles = info?.Tiles;
                    tiles?.forEach((tile: Tile) => {
                      const tileWrapper = iframeDoc.getElementById(tile.Id);
                      if (tileWrapper) {
                        const tileEl = tileWrapper.querySelector('.template-block') as HTMLElement;
                        if (tileEl) {
                          if (!tile.BGImageUrl) {
                            tileEl.style.backgroundColor = theme?.ThemeColors?.[tile.BGColor as keyof ThemeColors];                            
                          }
                        }   
                        this.updateTileIcon(tile, tileWrapper);
                      }
                    });
                    
                  }
                  
                }
                this.updateFrameColor(iframeDoc);
              }
            });
          });
        }

      });
    }
  }

  private updateTileIcon(tile: any, tileWrapper: HTMLElement) {
    if (tile && tileWrapper) {
      const iconEl = tileWrapper.querySelector('.tile-icon') as HTMLElement;
      if (iconEl) {
        const iconSVG = iconEl.querySelector('svg');
        if (iconSVG) {
          let newIconSVG = this.getThemeIcon(tile.Icon);
          if (newIconSVG) {
            newIconSVG = newIconSVG.replace('fill="#7c8791"', `fill="${tile.Color}"`);;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newIconSVG.trim();
            const newSVGElement = tempDiv.firstChild as SVGElement;

            if (newSVGElement) {
                iconSVG.remove();
                iconEl.appendChild(newSVGElement);
            }
          }
        }
      }
    }
  }

  private updateFontFamily(iframeDoc: any, fontFamily: string = "Comic Sans MS") {
    try {
      const root = iframeDoc.documentElement;
      root.style.setProperty('--font-family', fontFamily);
    } catch (error) {
      console.error('Error updating font family:', error);
    }
  }

  private updateFrameColor (iframeDoc: any) {
    const myActivityMessageButton = iframeDoc.querySelector('.tb-toggle-buttons')?.children[0] as HTMLElement;
    myActivityMessageButton?.style.setProperty('background-color', this.getThemeColor('backgroundColor'));

    const calendarDateSelector = iframeDoc.querySelector('.tb-date-selector') as HTMLElement;
    calendarDateSelector?.style.setProperty('background-color', this.getThemeColor('backgroundColor'));
  }
}
