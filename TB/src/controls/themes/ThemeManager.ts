import { AppConfig } from "../../AppConfig";
import { Theme } from "../../models/Theme";

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
    return this.getThemes().find((theme: Theme) => theme.ThemeName === "Modern");
  }
  
  getActiveThemeIcons() {
    const activeTheme = this.getActiveTheme();
    return activeTheme ? activeTheme.ThemeIcons : [];
  }
  
  getActiveThemeColors() {
    const activeTheme = this.getActiveTheme();
    return activeTheme ? activeTheme.ThemeColors : {};
  }
}