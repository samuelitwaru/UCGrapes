export class Clock {
    constructor(pageId) {
        this.pageId = pageId;
    }
    updateTime() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const timeString = `${hours}:${minutes} ${ampm}`;
        return timeString;
    }
}
//# sourceMappingURL=Clock.js.map