export class LoadingManager {
    preloaderElement: HTMLElement;
    _loading: boolean;
    _startTime: number;
    minDuration: number;
    transitionDuration: number;
    constructor(preloaderElement, minDuration = 300) {
      this.preloaderElement = preloaderElement;
      this._loading = false;
      this._startTime = 0;
      this.minDuration = minDuration;
      this.transitionDuration = 200;
    }
  
    get loading() {
      return this._loading;
    }
  
    set loading(value) {
      this._loading = value;
      if (value) {
        this._startTime = performance.now();
        this.showPreloader();
      } else {
        this.hidePreloader();
      }
    }
  
    showPreloader() {
      this.preloaderElement.style.display = "flex";
      requestAnimationFrame(() => {
        this.preloaderElement.style.transition = `opacity ${this.transitionDuration}ms ease-in-out`;
        this.preloaderElement.style.opacity = "1";
      });
    }
  
    hidePreloader() {
      const elapsedTime = performance.now() - this._startTime;
      if (elapsedTime >= this.minDuration) {
        this.preloaderElement.style.transition = `opacity ${this.transitionDuration}ms ease-in-out`;
        this.preloaderElement.style.opacity = "0";
        setTimeout(() => {
          this.preloaderElement.style.display = "none";
        }, this.transitionDuration);
      } else {
        setTimeout(() => {
          this.hidePreloader();
        }, this.minDuration - elapsedTime);
      }
    }
  }