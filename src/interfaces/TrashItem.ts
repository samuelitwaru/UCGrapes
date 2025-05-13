import { DateTime } from "i18n-js";
import { AppVersion } from "./AppVersion ";

export interface TrashItem {
    Type: string;
    Page: any;
    Version: AppVersion;
    DeletedAt: DateTime;
    TrashId: string;
}