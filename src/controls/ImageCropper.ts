export class ImageCropper {
    private targetWidth: number;
    private targetHeight: number;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;

    constructor(targetWidth: number = 532, targetHeight: number = 250) {
        this.targetWidth = targetWidth;
        this.targetHeight = targetHeight;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    async processImage(source: string | File): Promise<Blob | File> {
        try {
            let img: HTMLImageElement;
            if (typeof source === 'string') {
                img = await this.loadImageFromURL(source);
            } else if (source instanceof File) {
                if (!source.type.startsWith('image/')) {
                    throw new Error('File must be an image');
                }
                const imageData = await this.readFileAsDataURL(source);
                img = await this.loadImage(imageData);
            } else {
                throw new Error('Source must be either a File or URL string');
            }

            if (img.width <= this.targetWidth && img.height <= this.targetHeight) {
                return source instanceof File ? source : this.dataURLToBlob(img.src);
            }

            return this.resizeImage(img, source instanceof File ? source.type : 'image/jpeg');
        } catch (error) {
            throw new Error(`Failed to process image: ${(error as Error).message}`);
        }
    }

    private loadImageFromURL(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image from URL'));
            img.src = url;
        });
    }

    private readFileAsDataURL(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read file as DataURL'));
            reader.readAsDataURL(file);
        });
    }

    private loadImage(dataUrl: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = dataUrl;
        });
    }

    private resizeImage(img: HTMLImageElement, fileType: string): Promise<Blob> {
        if (!this.ctx) throw new Error('Canvas context is not available');
        
        this.canvas.width = this.targetWidth;
        this.canvas.height = this.targetHeight;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, 0, 0, this.targetWidth, this.targetHeight);
        
        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                if (blob) resolve(blob);
            }, fileType);
        });
    }

    private dataURLToBlob(dataURL: string): Blob {
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
