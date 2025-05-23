export class LoadingManager {
    private preloaderElement: HTMLElement;
    private minDuration: number;
    private _loading: boolean;
    private _startTime: number;
    private transitionDuration: number;

    constructor(preloaderElement: HTMLElement, minDuration: number = 300) {
        this.preloaderElement = preloaderElement;
        this.minDuration = minDuration;
        this._loading = false;
        this._startTime = 0;
        this.transitionDuration = 200;
    }

    get loading(): boolean {
        return this._loading;
    }

    set loading(value: boolean) {
        this._loading = value;
        if (value) {
            this._startTime = performance.now();
            this.showPreloader();
        } else {
            this.hidePreloader();
        }
    }

    private showPreloader(): void {
        this.preloaderElement.style.display = 'flex';
        requestAnimationFrame(() => {
            this.preloaderElement.style.transform = `opacity ${this.transitionDuration}ms ease-in-out 0s`;
            this.preloaderElement.style.opacity = '1';
        });
    }

    private hidePreloader(): void {
        const elapsedTime = performance.now() - this._startTime;
        if (elapsedTime >= this.minDuration) {
            this.preloaderElement.style.transition = `opacity ${this.transitionDuration}ms ease-in-out`;
            this.preloaderElement.style.opacity = "0";
            setTimeout(() => {
                this.preloaderElement.style.display = 'none';
            }, this.transitionDuration);
        } else {
            setTimeout(() => {
                this.hidePreloader();
            }, this.minDuration - elapsedTime);
        }
    }
}