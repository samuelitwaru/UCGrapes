import { DefaultAttributes } from "../../utils/default-attributes";
import { ThemeManager } from "../themes/ThemeManager";
import { i18n } from "../../i18n/i18n"

export class LoadMyActivityData {
    editor: any;
    themeManager: ThemeManager;
    constructor(editor: any) {
        this.editor = editor;
        this.themeManager = new ThemeManager();
    }
     load() {
         this.editor.setComponents(this.htmlData());
     }

     private htmlData() {
         return `
         <div class="tb-chat-container" ${DefaultAttributes}>
            <div class="tb-toggle-buttons"  ${DefaultAttributes}>
                <button style="background-color: ${this.themeManager.getThemeColor('backgroundColor')};border-radius: 6px;"  ${DefaultAttributes}>${i18n.t("Messages")}</button>
                <button style="background-color: #e1e1e1;border-radius: 6px;color: #262626;"  ${DefaultAttributes}>${i18n.t("Requests")}</button>
            </div>
            <div class="tb-chat-body" ${DefaultAttributes}>${i18n.t("NoMessagesYet")}</div>
         </div>
         `;
     }
}