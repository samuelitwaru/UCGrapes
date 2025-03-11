export class Media {
    MediaId: string;
    MediaName: string;
    MediaImage?: Uint8Array | null;
    MediaImage_GXI?: string | null;
    MediaSize: number;
    MediaType: string;
    MediaUrl: string
  
    constructor(
      MediaId: string,
      MediaName: string,
      MediaImage: Uint8Array,
      MediaImage_GXI: string,
      MediaSize: number,
      MediaType: string,
      MediaUrl: string,
    ) {
      this.MediaId = MediaId;
      this.MediaName = MediaName;
      this.MediaImage = MediaImage;
      this.MediaImage_GXI = MediaImage_GXI;
      this.MediaSize = MediaSize;
      this.MediaType = MediaType;
      this.MediaUrl = MediaUrl;
    }
  }
