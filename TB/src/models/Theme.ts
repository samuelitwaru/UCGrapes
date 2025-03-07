export interface ThemeColors {
  accentColor: string;
  backgroundColor: string;
  borderColor: string;
  buttonBGColor: string;
  buttonTextColor: string;
  cardBgColor: string;
  cardTextColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
}

export interface ThemeIcon {
  IconId: string;
  IconName: string;
  IconCategory: string;
  IconSVG: SVGAElement;
}

export class Theme {
  ThemeId: string;
  ThemeName: string;
  ThemeFontFamily: string;
  ThemeFontSize: number;
  ThemeColors: ThemeColors;
  ThemeIcons: ThemeIcon[] = [];

  constructor(
    ThemeId: string,
    ThemeName: string,
    ThemeFontFamily: string,
    ThemeFontSize: number,
    ThemeColors: ThemeColors,
    ThemeIcons: ThemeIcon[] = []
  ) {
    this.ThemeId = ThemeId;
    this.ThemeName = ThemeName;
    this.ThemeFontFamily = ThemeFontFamily;
    this.ThemeFontSize = ThemeFontSize;
    this.ThemeColors = ThemeColors;
    this.ThemeIcons = ThemeIcons;
  }
}
