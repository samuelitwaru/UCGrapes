class ImageCropper {
    constructor(targetWidth = 532, targetHeight = 250) {
        this.targetWidth = targetWidth;
        this.targetHeight = targetHeight;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Crop image from either File or URL
     * @param {File|string} source - Image file or URL
     * @returns {Promise<Blob>} - Promise resolving to cropped image blob
     */
    async cropImage(source) {
        try {
            let img;
            if (typeof source === 'string') {
                // Handle URL
                img = await this.loadImageFromURL(source);
            } else if (source instanceof File) {
                // Handle File object
                if (!source.type.startsWith('image/')) {
                    throw new Error('File must be an image');
                }
                const imageData = await this.readFileAsDataURL(source);
                img = await this.loadImage(imageData);
            } else {
                throw new Error('Source must be either a File or URL string');
            }

            // Get the original file type or default to 'image/jpeg'
            const fileType = source instanceof File ? source.type : 'image/jpeg';
            return this.cropAndResize(img, fileType);
        } catch (error) {
            throw new Error(`Failed to crop image: ${error.message}`);
        }
    }

    /**
     * Load image from URL
     * @private
     */
    loadImageFromURL(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            // Handle CORS issues
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image from URL'));
            img.src = url;
        });
    }

    /**
     * Read file as Data URL
     * @private
     */
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    /**
     * Load image from Data URL
     * @private
     */
    loadImage(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = dataUrl;
        });
    }

    /**
     * Crop and resize image maintaining aspect ratio
     * @private
     */
    cropAndResize(img, fileType) {
        this.canvas.width = this.targetWidth;
        this.canvas.height = this.targetHeight;

        const sourceAspect = img.width / img.height;
        const targetAspect = this.targetWidth / this.targetHeight;
        
        let sw, sh, sx, sy;
        if (sourceAspect > targetAspect) {
            sh = img.height;
            sw = sh * targetAspect;
            sy = 0;
            sx = (img.width - sw) / 2;
        } else {
            sw = img.width;
            sh = sw / targetAspect;
            sx = 0;
            sy = (img.height - sh) / 2;
        }

        this.ctx.drawImage(img, sx, sy, sw, sh, 0, 0, this.targetWidth, this.targetHeight);

        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => resolve(blob), fileType);
        });
    }

    /**
     * Get the cropped image as a Data URL
     */
    getDataURL() {
        return this.canvas.toDataURL();
    }
}