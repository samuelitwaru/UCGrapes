import ToolboxApp from "../../app";
import { AppConfig } from "../../AppConfig";
import { Theme, ThemeColors } from "../../models/Theme";
import { ColorPalette } from "../../ui/components/tools-section/ColorPalette";
import { IconList } from "../../ui/components/tools-section/icon-list/IconList";
import { IconListCategories } from "../../ui/components/tools-section/icon-list/IconListCategories";

export class ThemeManager {
  private config: AppConfig;
  
  themes: any[] = [];

  constructor() {
    this.config = AppConfig.getInstance();
    this.setThemes(this.config.themes);
  }

  setThemes(themes: any[]) {
    this.themes = themes;
  }

  getThemes() {
    return this.themes;
  }

  getActiveTheme() {
    return this.getThemes().find((theme: Theme) => theme.ThemeId === this.config.currentThemeId);
  }
  
  getActiveThemeIcons() {
    const activeTheme = this.getActiveTheme();
    return activeTheme ? activeTheme.ThemeIcons : [];
  }
  
  getActiveThemeColors() {
    const activeTheme = this.getActiveTheme();
    return activeTheme ? activeTheme.ThemeColors : {};
  }

  setTheme(theme: Theme) {
    this.config.currentThemeId = theme.ThemeId;
    this.updateColorPallete(theme.ThemeColors);
    this.updateThemeIcons();
  }

  updateColorPallete (colors: ThemeColors) {
    const colorPallete = new ColorPalette(colors, 'theme-color-palette');
    const parent = document.querySelector(".sidebar-section .theme-section") as HTMLElement;

    colorPallete.refresh(parent);
  }

  updateThemeIcons() {
    const iconsList = document.getElementById("icons-list") as HTMLElement;
    iconsList.classList.add("icons-list");
    iconsList.id = "icons-list";
    iconsList.innerHTML = "";

    const themeIcons = new IconList(this, 'General');
    themeIcons.render(iconsList);
  }
}