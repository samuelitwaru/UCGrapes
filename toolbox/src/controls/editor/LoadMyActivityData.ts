import { DefaultAttributes } from "../../utils/default-attributes";
import { i18n } from "../../i18n/i18n"

export class LoadMyActivityData {
    editor: any;
    constructor(editor: any) {
        this.editor = editor;
    }
     load() {
         this.editor.setComponents(this.htmlData());
     }

     private htmlData() {
         return `
         <div class="tb-chat-container" ${DefaultAttributes}>
            <div class="tb-toggle-buttons"  ${DefaultAttributes}>
                <button style="background-color: #5068a8;border-radius: 6px;"  ${DefaultAttributes}>Messages${i18n.t("app_messages")}</button>
                <button style="background-color: #e1e1e1;border-radius: 6px;color: #262626;"  ${DefaultAttributes}>Requests${i18n.t("app_Requests")}</button>
            </div>
            <div class="tb-chat-body" ${DefaultAttributes}>No messages yet</div>
         </div>
         `;
     }
}