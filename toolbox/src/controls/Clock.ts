export class Clock {
    private pageId: string;

    constructor(pageId: string) {
        this.pageId = pageId;
        this.updateTime();
    }

    updateTime(): void {
        const now: Date = new Date();
        let hours: number = now.getHours();
        let minutes: string = now.getMinutes().toString().padStart(2, '0');
        const ampm: string = hours >= 12 ? 'pm' : 'am';

        hours = hours % 12;
        hours = hours ? hours : 12;

        const timeString: string = `${hours}:${minutes} ${ampm}`;
        const pageElement: HTMLElement | null = document.getElementById(this.pageId);

        if (pageElement) {
            pageElement.textContent = timeString;
        }
    }
}