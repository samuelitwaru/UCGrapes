interface ThemeIcon {
    IconId: string;
    IconName: string;
    IconCategory: string;
    IconSVG: SVGAElement;
}
export class Theme {
    constructor(ThemeId, ThemeName, ThemeFontFamily, ThemeFontSize, ThemeIcons: ThemeIcon[]) {
        this.ThemeId = ThemeId;
        this.ThemeName = ThemeName;
        this.ThemeFontFamily = ThemeFontFamily;
        this.ThemeFontSize = ThemeFontSize;
        
    }
}
