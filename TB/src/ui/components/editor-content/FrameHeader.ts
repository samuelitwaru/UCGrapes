import { Clock } from "../../../controls/Clock";

export class FrameHeader {
    private container: HTMLElement;

    constructor() {
        this.container = document.createElement('div');
        this.init();
    }

    init() {
        this.container.classList.add('header');
        
        const clock: any = new Clock('clock');
        const clockSpan = document.createElement('span');
        clockSpan.id = 'clock';
        clockSpan.textContent = clock.updateTime();

        const iconsSpan = document.createElement('span');
        iconsSpan.classList.add('icons');

        const signalIcon = document.createElement('i');
        signalIcon.classList.add('fas', 'fa-signal');

        const wifiIcon = document.createElement('i');
        wifiIcon.classList.add('fas', 'fa-wifi');

        const batteryIcon = document.createElement('i');
        batteryIcon.classList.add('fas', 'fa-battery');

        iconsSpan.appendChild(signalIcon);
        iconsSpan.appendChild(wifiIcon);
        iconsSpan.appendChild(batteryIcon);

        this.container.appendChild(clockSpan);
        this.container.appendChild(iconsSpan);
    }

    render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}