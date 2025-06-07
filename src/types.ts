import { DateTime } from "i18n-js";

export interface ActionPage {
  PageId: string;
  PageName: string;
  TileName: string;
  PageType: string;
}

export interface AppVersion {
  AppVersionId: string;
  AppVersionName: string;
  IsActive: boolean;
  ThemeId: string;
}

export interface CallToAction {
  CallToActionType: string;
  CallToActionEmail: string;
  CallToActionPhoneNumber: string;
  CallToActionUrl: string;
  CallToActionName: string;
  CallToActionId: string
}


export interface Category {
  name: string;
  displayName: string;
  label: string;
  options: ActionPage[];
  canCreatePage: boolean;
}

export interface CtaAttributes {
  CtaId: string;
  CtaType: string;
  CtaLabel?: string;
  CtaAction?: string;
  CtaColor?: string;
  CtaBGColor?: string;
  CtaButtonType?: string;
  CtaButtonImgUrl?: string;
  CtaButtonIcon?: string;
  CtaSupplierIsConnected?: boolean;
  CtaConnectedSupplierId?: string;
  Action?: {}
}

export interface DebugResults {
  Summary: {
    TotalUrls: string;
    SuccessCount: string;
    FailureCount: string;
  };
  Pages: {
    Page: string;
    UrlList: {
      Url: string;
      StatusCode: number;
      StatusMessage: string;
      AffectedType: string;
      AffectedName: string;
    }[];
  }[];
}


export interface InfoType {
  InfoId: string;
  InfoType: string;
  InfoValue?: string;
  InfoPositionId?: string;
  CtaAttributes?: CtaAttributes;
  Tiles?: Tile[];
  Images?: Image[];
}

export interface Image {
  InfoImageId: string;
  InfoImageValue?: string;

}

export interface MenuItem {
  id: string;
  label: string;
  name?: string;
  action: (categoryItems?: any[]) => void;
  expandable?: boolean;
}

export interface SelectOptionConfig<DropdownOption> {
  labelField: keyof DropdownOption;
  valueField: keyof DropdownOption;
  placeholder?: string;
}

export interface SupplierList {
  SupplierGenId: string;
  SupplierGenKvkNumber: string;
  SupplierGenTypeId: string;
  SupplierGenCompanyName: string;
  SupplierGenAddressCountry: string;
  SupplierGenAddressCity: string;
  SupplierGenAddressZipCode: string;
  SupplierGenAddressLine1: string;
  SupplierGenAddressLine2: string;
  SupplierGenContactName: string;
  SupplierGenContactPhone: string;
  SupplierGenPhoneCode: string;
  SupplierGenPhoneNumber: string;
  SupplierGenEmail: string;
  SupplierGenWebsite: string;
  OrganisationId: string;
}

export interface Template {
  Id: string;
  Rows: Array<{
    Id: string;
    Tiles: Array<{
      Id: string;
      Name: string;
      Text: string;
      Color: string;
      Align: string;
      Icon: string;
      BGColor: string;
      BGImageUrl: string;
      Opacity: string;
      Action: {
        ObjectType: string;
        ObjectId: string;
        ObjectUrl: string;
      }
    }>
  }>
}

export interface Tile {
  Id: string;
  Name?: string;
  Text?: string;
  Color?: string;
  Align?: string;
  Icon?: string;
  BGColor?: string;
  BGImageUrl?: string;
  OriginalImageUrl?: string;
  Opacity?: number;
  Permissions?: [];
  Action?: {
    ObjectType?: string;
    ObjectId?: string;
    ObjectUrl?: string;
    FormId?: number;
  };
  BGSize?: string,
  BGPosition?: string
  Left?: string;
  Top?: string;
}

export interface TrashItem {
  Type: string;
  Page: any;
  Version: AppVersion;
  DeletedAt: DateTime;
  TrashId: string;
}

export interface TrashItems {
  TrashItems: TrashItem[];
}


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

export interface Theme {
  ThemeId: string;
  ThemeName: string;
  ThemeFontFamily: string;
  ThemeFontSize: number;
  ThemeColors: ThemeColors;
  ThemeCtaColors: ThemeCtaColor;
  ThemeIcons: ThemeIcon[];
}

export interface Form {
  FormId: string;
  ReferenceName: string;
  FormUrl: string;
}

export interface Media {
  MediaId: string;
  MediaName: string;
  MediaImage?: Uint8Array | null;
  MediaImage_GXI?: string | null;
  MediaSize: number;
  MediaType: string;
  MediaUrl: string;
}

export interface Page {
  PageId: string;
  LocationId: string;
  PageName: string;
  PageJsonContent?: string | null;
  PageGJSHTML?: string | null;
  PageGJSJson?: string | null;
  PageIsPublished?: boolean | null;
  PageIsPredefined: boolean;
  PageIsContentPage?: boolean | null;
  PageIsDynamicForm: boolean;
  PageIsWeblinkPage: boolean;
  PageChildren?: string | null;
  ProductServiceId?: string | null;
  OrganisationId: string;
  PageTileName?: string;
}

export interface ProductService {
  ProductServiceId: string;
  LocationId: string;
  OrganisationId: string;
  ProductServiceName: string;
  ProductServiceTileName: string;
  ProductServiceDescription: string;
  ProductServiceImage: Uint8Array;
  ProductServiceImage_GXI?: string | null;
  ProductServiceGroup: string;
  SupplierGenId?: string | null;
  SupplierAGBId?: string | null;
  ProductServiceClass: string;
}

export interface ResizeState {
  isResizing: boolean;
  isDragging: boolean;
  resizingRowHeight: number;
  resizingRow: HTMLDivElement | null;
  resizingRowParent: HTMLDivElement | null;
  resizeYStart: number;
  initialHeight: number;
  templateBlock: HTMLDivElement | null;
  affectedElements: HTMLElement[] | null;
  originalCursors: string[] | null;
  resizeOverlay: HTMLDivElement | null;
  infoSectionSpacer: HTMLDivElement | null;
  frameChildren: HTMLDivElement[];
}

export interface TileHeights {
  min: number;
  medium: number;
  max: number;
  snapThreshold: number;
}

export interface SelectedImage {
  Id: string;
  Url: string;
}

export type ImageType = "info" | "tile" | "content" | "cta";