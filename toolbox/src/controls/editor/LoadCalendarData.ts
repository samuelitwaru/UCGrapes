import { DefaultAttributes } from "../../utils/default-attributes";

export class LoadCalendarData {
    editor: any;
    constructor(editor: any) {
        this.editor = editor;
    }
     load() {
        this.editor.setComponents(this.htmlData());
     }

     private htmlData() {
         return `
            <div class="tb-date-selector" ${DefaultAttributes}>
                <span class="tb-arrow"  ${DefaultAttributes}>❮</span>
                <span class="tb-date-text" id="current-date"  ${DefaultAttributes}> ${ this.formatDate() }</span>
                <span class="tb-arrow"  ${DefaultAttributes}>❯</span>
            </div>

            <div class="tb-schedule" id="schedule-container" ${DefaultAttributes}>
            <div class="tb-time-slot" ${DefaultAttributes}>
                <div class="tb-time" ${DefaultAttributes}>6:00</div>
                <div class="tb-events" ${DefaultAttributes}></div>
            </div>
            <div class="tb-time-slot" ${DefaultAttributes}>
                <div class="tb-time" ${DefaultAttributes}>7:00</div>
                <div class="tb-events" ${DefaultAttributes}></div>
            </div>
            <div class="tb-time-slot" ${DefaultAttributes}>
                <div class="tb-time" ${DefaultAttributes}>8:00</div>
                <div class="tb-events" ${DefaultAttributes}></div>
                <div class="tb-current-time-indicator" ${DefaultAttributes}></div>
                <div class="tb-current-time-dot" ${DefaultAttributes}></div>
            </div>
            <div class="tb-time-slot" ${DefaultAttributes}>
                <div class="tb-time" ${DefaultAttributes}>9:00</div>
                <div class="tb-events" ${DefaultAttributes}></div>
            </div>
            <div class="tb-time-slot" ${DefaultAttributes}>
                <div class="tb-time" ${DefaultAttributes}>10:00</div>
                <div class="tb-events" ${DefaultAttributes}></div>
            </div>
            <div class="tb-time-slot" ${DefaultAttributes}>
                <div class="tb-time" ${DefaultAttributes}>11:00</div>
                <div class="tb-events" ${DefaultAttributes}></div>
            </div>
            <div class="tb-time-slot" ${DefaultAttributes}>
                <div class="tb-time" ${DefaultAttributes}>12:00</div>
                <div class="tb-events" ${DefaultAttributes}></div>
            </div>
            <div class="tb-time-slot" ${DefaultAttributes}>
                <div class="tb-time" ${DefaultAttributes}>13:00</div>
                <div class="tb-events" ${DefaultAttributes}></div>
            </div>
            <div class="tb-time-slot" ${DefaultAttributes}>
                <div class="tb-time" ${DefaultAttributes}>14:00</div>
                <div class="tb-events" ${DefaultAttributes}></div>
            </div>
         `;
     }

     private formatDate(): string {
        const date: string = new Date().toLocaleDateString('en-GB', {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).replace(/(\d{2} \w{3}) (\d{4})/, "$1, $2");

        return date;
     }
}