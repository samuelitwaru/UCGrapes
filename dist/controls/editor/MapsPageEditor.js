var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { DefaultAttributes } from "../../utils/default-attributes";
export class MapsPageEditor {
    constructor(editor) {
        this.editor = editor;
    }
    initialise(tileAction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.editor.DomComponents.clear();
                // Get User's Location
                navigator.geolocation.getCurrentPosition((position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    this.createMapComponent(lat, lng);
                }, (error) => {
                    console.error("Geolocation error:", error.message);
                    // Fallback to Utrecht coordinates when geolocation fails
                    const utrechtLat = 52.0907;
                    const utrechtLng = 5.1214;
                    this.createMapComponent(utrechtLat, utrechtLng);
                });
            }
            catch (error) {
                console.error("Error setting up iframe component:", error.message);
                // Fallback to Utrecht if there's any other error
                const utrechtLat = 52.0907;
                const utrechtLng = 5.1214;
                this.createMapComponent(utrechtLat, utrechtLng);
            }
        });
    }
    createMapComponent(lat, lng) {
        var _a;
        const linkUrl = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBBaQo7_sF2xk3uNIyKp_Z-4BbaTebGGa4&center=${lat},${lng}&zoom=18`;
        // Add the iframe component to the editor
        const component = this.editor.addComponents(`
      <div ${DefaultAttributes} id="frame-container" style="position: relative; width: 100%; height: 100vh; overflow: hidden;">
        <div ${DefaultAttributes} id="map-preloader" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000;">
          <img ${DefaultAttributes} src="/Resources/UCGrapes1/src/images/spinner.gif" width="32" height="32" alt="Loading...">
        </div>
        <iframe 
          id="map-frame"
          src="${linkUrl}"
          width="100%"
          height="100%"
          frameborder="0"
          allowfullscreen="true"
          loading="lazy"
          ${DefaultAttributes}
          style="display: block; border: none; height: 100vh;">
        </iframe>
      </div>
    `)[0];
        // Get the iframe DOM element
        const iframe = (_a = component.find('#map-frame')[0]) === null || _a === void 0 ? void 0 : _a.getEl();
        if (iframe) {
            // Add event listener directly to the DOM element
            iframe.onload = () => {
                const preloader = component.find('#map-preloader')[0];
                if (preloader) {
                    preloader.getEl().style.display = 'none';
                }
            };
        }
        // Fallback to hide preloader if onload doesn't trigger
        setTimeout(() => {
            const preloader = component.find('#map-preloader')[0];
            if (preloader) {
                preloader.getEl().style.display = 'none';
            }
        }, 2000);
    }
}
//# sourceMappingURL=MapsPageEditor.js.map