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
        let pageData = `
        <div class="tb-date-selector" ${DefaultAttributes}>
          <span class="tb-arrow" ${DefaultAttributes}>❮</span>
          <span class="tb-date-text" id="current-date" ${DefaultAttributes}> ${this.formatDate()}</span>
          <span class="tb-arrow" ${DefaultAttributes}>❯</span>
        </div>
        <div class="tb-schedule" id="schedule-container" ${DefaultAttributes}>
      `;
      
      for (let hour = 0; hour < 24; hour++) {
          const formattedHour = hour.toString().padStart(2, "0") + ":00";
          pageData += `
            <div class="tb-time-slot" ${DefaultAttributes}>
              <div class="tb-time" ${DefaultAttributes}>${formattedHour}</div>
              <div class="tb-events" ${DefaultAttributes}></div>
              ${hour === new Date().getHours() ? `
                <div class="tb-current-time-indicator" ${DefaultAttributes}></div>
                <div class="tb-current-time-dot" ${DefaultAttributes}></div>` : ''}
            </div>
          `;
      }    
      pageData += `</div>`;

      return pageData;
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