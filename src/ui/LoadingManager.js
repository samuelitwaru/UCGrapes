"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingManager = void 0;
var LoadingManager = /** @class */ (function () {
    function LoadingManager(preloaderElement, minDuration) {
        if (minDuration === void 0) { minDuration = 300; }
        this.preloaderElement = preloaderElement;
        this._loading = false;
        this._startTime = 0;
        this.minDuration = minDuration;
        this.transitionDuration = 200;
    }
    Object.defineProperty(LoadingManager.prototype, "loading", {
        get: function () {
            return this._loading;
        },
        set: function (value) {
            this._loading = value;
            if (value) {
                this._startTime = performance.now();
                this.showPreloader();
            }
            else {
                this.hidePreloader();
            }
        },
        enumerable: false,
        configurable: true
    });
    LoadingManager.prototype.showPreloader = function () {
        var _this = this;
        this.preloaderElement.style.display = "flex";
        requestAnimationFrame(function () {
            _this.preloaderElement.style.transition = "opacity ".concat(_this.transitionDuration, "ms ease-in-out");
            _this.preloaderElement.style.opacity = "1";
        });
    };
    LoadingManager.prototype.hidePreloader = function () {
        var _this = this;
        var elapsedTime = performance.now() - this._startTime;
        if (elapsedTime >= this.minDuration) {
            this.preloaderElement.style.transition = "opacity ".concat(this.transitionDuration, "ms ease-in-out");
            this.preloaderElement.style.opacity = "0";
            setTimeout(function () {
                _this.preloaderElement.style.display = "none";
            }, this.transitionDuration);
        }
        else {
            setTimeout(function () {
                _this.hidePreloader();
            }, this.minDuration - elapsedTime);
        }
    };
    return LoadingManager;
}());
exports.LoadingManager = LoadingManager;
