class LoadingManager {
    constructor(preloaderElement) {
        this.preloaderElement = preloaderElement;
        this._loading = false;
    }

    get loading() {
        return this._loading;
    }

    set loading(value) {
        this._loading = value;
        this.updatePreloaderVisibility();
    }

    updatePreloaderVisibility() {
        if (this._loading) {
            this.preloaderElement.style.display = 'flex';
        } else {
            this.preloaderElement.style.display = 'none';
        }
    }
}
