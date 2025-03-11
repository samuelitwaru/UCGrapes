export class Clock {
    private pageId: string;

    constructor(pageId: string) {
        this.pageId = pageId;
    }

    updateTime() {
        const now: Date = new Date();
        let hours: number = now.getHours();
        let minutes: string = now.getMinutes().toString().padStart(2, '0');
        const ampm: string = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12;

        const timeString: string = `${hours}:${minutes} ${ampm}`;

        return timeString;
    }
}