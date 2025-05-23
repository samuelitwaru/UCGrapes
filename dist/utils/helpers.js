var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const randomIdGenerator = (length) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const date = new Date().toISOString().replace(/[-:.TZ]/g, "");
    return result + date;
};
export function imageToBase64(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url);
        const blob = yield response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    });
}
export function rgbToHex(rgb) {
    if (!rgb)
        return "";
    const rgbArray = rgb.match(/\d+/g);
    return rgbArray && rgbArray.length === 3
        ? `#${rgbArray.map((x) => Number(x).toString(16).padStart(2, "0")).join("")}`
        : "";
}
export function truncateString(str, n) {
    return str.length > n ? str.slice(0, n) + "..." : str;
}
//# sourceMappingURL=helpers.js.map