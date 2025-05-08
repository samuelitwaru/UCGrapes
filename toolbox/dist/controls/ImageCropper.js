var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class ImageCropper {
    constructor(targetWidth = 532, targetHeight = 250) {
        this.targetWidth = targetWidth;
        this.targetHeight = targetHeight;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }
    processImage(source) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let img;
                if (typeof source === 'string') {
                    img = yield this.loadImageFromURL(source);
                }
                else if (source instanceof File) {
                    if (!source.type.startsWith('image/')) {
                        throw new Error('File must be an image');
                    }
                    const imageData = yield this.readFileAsDataURL(source);
                    img = yield this.loadImage(imageData);
                }
                else {
                    throw new Error('Source must be either a File or URL string');
                }
                if (img.width <= this.targetWidth && img.height <= this.targetHeight) {
                    return source instanceof File ? source : this.dataURLToBlob(img.src);
                }
                return this.resizeImage(img, source instanceof File ? source.type : 'image/jpeg');
            }
            catch (error) {
                throw new Error(`Failed to process image: ${error.message}`);
            }
        });
    }
    loadImageFromURL(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image from URL'));
            img.src = url;
        });
    }
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => { var _a; return resolve((_a = e.target) === null || _a === void 0 ? void 0 : _a.result); };
            reader.onerror = () => reject(new Error('Failed to read file as DataURL'));
            reader.readAsDataURL(file);
        });
    }
    loadImage(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = dataUrl;
        });
    }
    resizeImage(img, fileType) {
        if (!this.ctx)
            throw new Error('Canvas context is not available');
        this.canvas.width = this.targetWidth;
        this.canvas.height = this.targetHeight;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, 0, 0, this.targetWidth, this.targetHeight);
        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                if (blob)
                    resolve(blob);
            }, fileType);
        });
    }
    dataURLToBlob(dataURL) {
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        return new Blob([arrayBuffer], { type: mimeString });
    }
}
//# sourceMappingURL=ImageCropper.js.map