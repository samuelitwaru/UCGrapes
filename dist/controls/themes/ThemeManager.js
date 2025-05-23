var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AppConfig } from "../../AppConfig";
import { ColorPalette } from "../../ui/components/tools-section/ColorPalette";
import { CtaColorPalette } from "../../ui/components/tools-section/content-section/CtaColorPalette";
import { IconListCategories } from "../../ui/components/tools-section/icon-list/IconListCategories";
import { AppVersionManager } from "../versions/AppVersionManager";
export class ThemeManager {
    constructor() {
        this.themes = [];
        this.config = AppConfig.getInstance();
        this.appVersionManager = new AppVersionManager();
        this.setThemes(this.config.themes);
    }
    setThemes(themes) {
        this.themes = themes;
        this.currentTheme = this.getThemes().find((theme) => theme.ThemeId === window.app.currentThemeId);
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
    setTheme(theme) {
        this.currentTheme = theme;
        this.config.currentThemeId = theme.ThemeId;
        this.updateColorPallete(theme.ThemeColors);
        this.updateCtaColorPallete(theme.ThemeCtaColors);
        this.updateThemeIcons();
        this.applyTheme(theme);
    }
    updateColorPallete(colors) {
        const colorPallete = new ColorPalette(colors, "theme-color-palette");
        const parent = document.querySelector(".sidebar-section .theme-section");
        if (colorPallete) {
            colorPallete.refresh(parent);
        }
    }
    updateCtaColorPallete(ctaColors) {
        const ctaColorPallete = new CtaColorPalette(ctaColors);
        const container = document.getElementById('content-page-section');
        if (container) {
            ctaColorPallete.refresh(container);
        }
    }
    updateThemeIcons(categoryTitle = "General") {
        const menuPageSection = document.getElementById("menu-page-section");
        const themeIcons = new IconListCategories(categoryTitle);
        themeIcons.render(menuPageSection);
    }
    getThemeColor(colorName) {
        if (!this.currentTheme || !this.currentTheme.ThemeColors) {
            console.error("ThemeColors is undefined or invalid:", this.currentTheme);
            return null;
        }
        return this.currentTheme.ThemeColors[colorName] || 'transparent';
    }
    getThemeCtaColor(colorName) {
        var _a;
        if (!colorName) {
            colorName = "CtaColorOne";
        }
        if (!this.currentTheme || !this.currentTheme.ThemeCtaColors) {
            console.error("ThemeColors is undefined or invalid:", this.currentTheme);
            return null;
        }
        return ((_a = this.currentTheme.ThemeCtaColors.find((color) => color.CtaColorName === colorName)) === null || _a === void 0 ? void 0 : _a.CtaColorCode) || '#5068a8';
    }
    getThemeIcon(iconName) {
        var _a, _b;
        return ((_b = (_a = this.getActiveThemeIcons()) === null || _a === void 0 ? void 0 : _a.find((icon) => icon.IconName === iconName)) === null || _b === void 0 ? void 0 : _b.IconSVG) || null;
    }
    getIconCategory(iconName) {
        var _a, _b;
        return ((_b = (_a = this.getActiveThemeIcons()) === null || _a === void 0 ? void 0 : _a.find((icon) => icon.IconName === iconName)) === null || _b === void 0 ? void 0 : _b.IconCategory) || null;
    }
    applyTheme(theme) {
        return __awaiter(this, void 0, void 0, function* () {
            const iframes = document.querySelectorAll(".mobile-frame iframe");
            if (!iframes.length)
                return;
            const activeVersion = globalThis.activeVersion;
            if (activeVersion) {
                const pages = activeVersion.Pages;
                pages.forEach((page) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c;
                    const pageId = page.PageId;
                    const localStorageKey = `data-${pageId}`;
                    const pageData = JSON.parse(localStorage.getItem(localStorageKey) || "{}");
                    if (pageData.PageMenuStructure) {
                        const rows = (_a = pageData.PageMenuStructure) === null || _a === void 0 ? void 0 : _a.Rows;
                        rows.forEach((row) => {
                            row.Tiles.forEach((tile) => {
                                if (tile.BGColor) {
                                    iframes.forEach((iframe) => {
                                        var _a, _b;
                                        const iframeDoc = iframe.contentDocument || ((_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.document);
                                        if (iframeDoc) {
                                            this.updateFontFamily(iframeDoc, theme.ThemeFontFamily);
                                            const tileWrapper = iframeDoc.getElementById(tile.Id);
                                            if (tileWrapper) {
                                                const tileEl = tileWrapper.querySelector('.template-block');
                                                if (tileEl) {
                                                    // tileEl.setAttribute('style', `background-color: ${theme?.ThemeColors?.[tile.BGColor as keyof ThemeColors]};`)
                                                    tileEl.style.backgroundColor = (_b = theme === null || theme === void 0 ? void 0 : theme.ThemeColors) === null || _b === void 0 ? void 0 : _b[tile.BGColor];
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
                        const ctas = (_b = pageData.PageContentStructure) === null || _b === void 0 ? void 0 : _b.Cta;
                        ctas === null || ctas === void 0 ? void 0 : ctas.forEach((cta, index) => {
                            iframes.forEach((iframe) => {
                                var _a;
                                const iframeDoc = iframe.contentDocument || ((_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.document);
                                if (iframeDoc) {
                                    this.updateFontFamily(iframeDoc, theme.ThemeFontFamily);
                                    const ctaElement = iframeDoc.querySelector(`#${cta.CtaId}`);
                                    if (ctaElement) {
                                        const ctaButton = ctaElement.querySelector('.cta-styled-btn');
                                        ctaButton.style.backgroundColor = this.getThemeCtaColor(cta.CtaBGColor);
                                    }
                                    this.updateFrameColor(iframeDoc);
                                }
                            });
                        });
                    }
                    if (pageData.PageInfoStructure) {
                        const infoContents = (_c = pageData.PageInfoStructure) === null || _c === void 0 ? void 0 : _c.InfoContent;
                        infoContents === null || infoContents === void 0 ? void 0 : infoContents.forEach((info, index) => {
                            iframes.forEach((iframe) => {
                                var _a, _b;
                                const iframeDoc = iframe.contentDocument || ((_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.document);
                                if (iframeDoc) {
                                    this.updateFontFamily(iframeDoc, theme.ThemeFontFamily);
                                    const infoElement = iframeDoc.querySelector(`#${info.InfoId}`);
                                    if (infoElement) {
                                        if (info.InfoType === "Cta") {
                                            const ctaButton = infoElement.querySelector('.cta-styled-btn');
                                            ctaButton.style.backgroundColor = this.getThemeCtaColor((_b = info === null || info === void 0 ? void 0 : info.CtaAttributes) === null || _b === void 0 ? void 0 : _b.CtaBGColor);
                                        }
                                        else if (info.InfoType === "TileRow") {
                                            const tiles = info === null || info === void 0 ? void 0 : info.Tiles;
                                            tiles === null || tiles === void 0 ? void 0 : tiles.forEach((tile) => {
                                                var _a;
                                                const tileWrapper = iframeDoc.getElementById(tile.Id);
                                                if (tileWrapper) {
                                                    const tileEl = tileWrapper.querySelector('.template-block');
                                                    if (tileEl) {
                                                        tileEl.style.backgroundColor = (_a = theme === null || theme === void 0 ? void 0 : theme.ThemeColors) === null || _a === void 0 ? void 0 : _a[tile.BGColor];
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
                }));
            }
        });
    }
    updateTileIcon(tile, tileWrapper) {
        if (tile && tileWrapper) {
            const iconEl = tileWrapper.querySelector('.tile-icon');
            if (iconEl) {
                const iconSVG = iconEl.querySelector('svg');
                if (iconSVG) {
                    let newIconSVG = this.getThemeIcon(tile.Icon);
                    if (newIconSVG) {
                        newIconSVG = newIconSVG.replace('fill="#7c8791"', `fill="${tile.Color}"`);
                        ;
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newIconSVG.trim();
                        const newSVGElement = tempDiv.firstChild;
                        if (newSVGElement) {
                            iconSVG.remove();
                            iconEl.appendChild(newSVGElement);
                        }
                    }
                }
            }
        }
    }
    updateFontFamily(iframeDoc, fontFamily = "Comic Sans MS") {
        try {
            const root = iframeDoc.documentElement;
            root.style.setProperty('--font-family', fontFamily);
        }
        catch (error) {
            console.error('Error updating font family:', error);
        }
    }
    updateFrameColor(iframeDoc) {
        var _a;
        const myActivityMessageButton = (_a = iframeDoc.querySelector('.tb-toggle-buttons')) === null || _a === void 0 ? void 0 : _a.children[0];
        myActivityMessageButton === null || myActivityMessageButton === void 0 ? void 0 : myActivityMessageButton.style.setProperty('background-color', this.getThemeColor('backgroundColor'));
        const calendarDateSelector = iframeDoc.querySelector('.tb-date-selector');
        calendarDateSelector === null || calendarDateSelector === void 0 ? void 0 : calendarDateSelector.style.setProperty('background-color', this.getThemeColor('backgroundColor'));
    }
}
//# sourceMappingURL=ThemeManager.js.map