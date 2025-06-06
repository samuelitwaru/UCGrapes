import { i18n } from "../i18n/i18n";

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

export function capitalizeWords(str:string) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

export function getIconCategories() {
  let categories: { name: string; label: string }[] = [
        {
          name: "Technical Services & Support",
          label: i18n.t("sidebar.icon_category.general"),
        },
        {
          name: "Real Estate & Rental",
          label: i18n.t("sidebar.icon_category.real_estate_rental"),
        },
        {
          name: "Community & Connection",
          label: i18n.t("sidebar.icon_category.community_connection"),
        },
        {
          name: "Building & Furnishing",
          label: i18n.t("sidebar.icon_category.building_furnishing"),
        },
        {
          name: "Services & Hospitality",
          label: i18n.t("sidebar.icon_category.services_hospitality"),
        },
        {
          name: "Mobility & Transport",
          label: i18n.t("sidebar.icon_category.mobility_transport"),
        },
        {
          name: "Care & Wellbeing",
          label: i18n.t("sidebar.icon_category.care_wellbeing"),
        },
        {
          name: "Communication & Media",
          label: i18n.t("sidebar.icon_category.communication_media"),
        },
      ];
      return categories;
}