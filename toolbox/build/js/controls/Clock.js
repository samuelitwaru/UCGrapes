"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clock = void 0;
class Clock {
    constructor(pageId) {
        this.pageId = pageId;
        this.updateTime();
    }
    updateTime() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const timeString = `${hours}:${minutes} ${ampm}`;
        const pageElement = document.getElementById(this.pageId);
        if (pageElement) {
            pageElement.textContent = timeString;
        }
    }
}
exports.Clock = Clock;
