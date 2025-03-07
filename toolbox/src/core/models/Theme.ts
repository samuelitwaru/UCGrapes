export class Theme {
    ThemeId: string;
    ThemeName: string;
    ThemeFontFamily: string;
    ThemeFontSize: number;
  
    constructor(
      ThemeId: string,
      ThemeName: string,
      ThemeFontFamily: string,
      ThemeFontSize: number
    ) {
      this.ThemeId = ThemeId;
      this.ThemeName = ThemeName;
      this.ThemeFontFamily = ThemeFontFamily;
      this.ThemeFontSize = ThemeFontSize;
    }
  }