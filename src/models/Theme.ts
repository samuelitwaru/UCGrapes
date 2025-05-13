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
  IconSVG: string;
}

export interface ThemeCtaColor {
  CtaColorName: string;
  CtaColorCode: string;
  CtaColorId: string;
}

export class Theme {
  ThemeId: string;
  ThemeName: string;
  ThemeFontFamily: string;
  ThemeFontSize: number;
  ThemeColors: ThemeColors;
  ThemeCtaColors: ThemeCtaColor;
  ThemeIcons: ThemeIcon[] = [];

  constructor(
    ThemeId: string,
    ThemeName: string,
    ThemeFontFamily: string,
    ThemeFontSize: number,
    ThemeColors: ThemeColors,
    ThemeCtaColors: ThemeCtaColor,
    ThemeIcons: ThemeIcon[] = []
  ) {
    this.ThemeId = ThemeId;
    this.ThemeName = ThemeName;
    this.ThemeFontFamily = ThemeFontFamily;
    this.ThemeFontSize = ThemeFontSize;
    this.ThemeColors = ThemeColors;
    this.ThemeCtaColors = ThemeCtaColors;
    this.ThemeIcons = ThemeIcons;
  }
}
