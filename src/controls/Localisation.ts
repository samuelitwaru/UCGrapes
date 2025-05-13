import {I18n} from "i18n-js";

export class Localisation {
    async loadTranslations(i18n: any, locale: any) {
        const response = await fetch(`../i18n/${locale}.json`);
        const translations = await response.json();
    
        i18n.store(translations);
    }
}


// const i18n = new I18n();

// export {i18n, loadTranslations};