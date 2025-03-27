export const randomIdGenerator = (length: number) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const date = new Date().toISOString().replace(/[-:.TZ]/g, "");
  return result + date;
};

export async function imageToBase64(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function rgbToHex(rgb: string): string {
  if (!rgb) return ""; 

  const rgbArray = rgb.match(/\d+/g); 
  return rgbArray && rgbArray.length === 3
    ? `#${rgbArray.map((x) => Number(x).toString(16).padStart(2, "0")).join("")}`
    : "";
}

export function truncateString(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + "..." : str;
}