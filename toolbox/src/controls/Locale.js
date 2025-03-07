var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Locale {
    constructor(language) {
        this.currentLanguage = language;
        this.defaultLanguage = "english";
        this.translations = {};
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadTranslations();
            return this;
        });
    }
    loadTranslations() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const languages = ["english", "dutch"];
                for (const lang of languages) {
                    const res = yield fetch(`${window.location.origin}/Resources/UCGrapes1/toolbox/i18n/${lang}.json`);
                    if (!res.ok)
                        throw new Error(`Failed to fetch ${lang} translations`);
                    const data = yield res.json();
                    this.translations[lang] = data;
                }
            }
            catch (error) {
                console.error("Failed to load translations:", error);
                throw new Error(`Failed to load translations: ${error.message}`);
            }
        });
    }
    setLanguage(language) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Object.keys(this.translations).length === 0) {
                yield this.loadTranslations();
            }
            const elementsToTranslate = [
                "navbar_title",
                "navbar_tree_label",
                "navbar_publish_label",
                "sidebar_tabs_pages_label",
                "sidebar_tabs_templates_label",
                "sidebar_select_action_label",
                "new_page_submit_label",
                "template_added_success_message",
                "theme_applied_success_message",
                "page_loaded_success_message",
                "no_tile_selected_error_message",
                "error_loading_data_message",
                "failed_to_save_current_page_message",
                "tile_has_bg_image_error_message",
                "error_applying_theme_message",
                "no_icon_selected_error_message",
                "error_save_message",
                "accept_popup",
                "close_popup",
                "sidebar_mapping_title",
                "alert_type_success",
                "alert_type_error",
                "cancel_btn",
                "save_btn",
                "publish_confirm_title",
                "publish_confirm_message",
                "nofity_residents_on_publish",
                "publish_confirm_button",
                "publish_cancel_button",
                "enter_title_place_holder",
            ];
            elementsToTranslate.forEach((elementId) => {
                const element = document.getElementById(elementId);
                if (element) {
                    element.innerText = this.getTranslation(elementId);
                }
                else {
                    console.warn(`Element with id '${elementId}' not found`);
                }
            });
        });
    }
    translateTilesTitles(editor) {
        const tileTitlesToTranslate = [
            "tile-reception",
            "tile-calendar",
            "tile-mailbox",
            "tile-location",
            "tile-my-care",
            "tile-my-living",
            "tile-my-services",
        ];
        tileTitlesToTranslate.forEach((elementClass) => {
            const components = editor.DomComponents.getWrapper().find(`.${elementClass}`);
            if (components.length) {
                const newHTML = `<span data-gjs-type="text" class="tile-title ${elementClass}">${this.getTranslation(elementClass)}</span>`;
                components[0].replaceWith(newHTML);
            }
        });
    }
    getTranslation(key) {
        var _a, _b;
        if (!this.translations || Object.keys(this.translations).length === 0) {
            console.warn("Translations not yet loaded");
            return key;
        }
        const translation = ((_a = this.translations[this.currentLanguage]) === null || _a === void 0 ? void 0 : _a[key]) ||
            ((_b = this.translations[this.defaultLanguage]) === null || _b === void 0 ? void 0 : _b[key]);
        if (!translation) {
            console.warn(`Translation missing for key '${key}'`);
            return key;
        }
        return translation;
    }
    translateUCStrings() {
        const tileTitleElement = document.getElementById("tile-title");
        if (tileTitleElement) {
            tileTitleElement.placeholder = this.getTranslation("enter_title_place_holder");
        }
        const options = [
            { value: "Services", label: "icon_category_services" },
            { value: "General", label: "icon_category_general", selected: true },
            { value: "Health", label: "icon_category_health" },
            { value: "Living", label: "icon_category_living" },
        ];
        const select = document.querySelector(".tb-custom-category-selection");
        const button = select === null || select === void 0 ? void 0 : select.querySelector(".category-select-button");
        const selectedValue = button === null || button === void 0 ? void 0 : button.querySelector(".selected-category-value");
        const closeDropdown = () => {
            if (optionsList)
                optionsList.classList.remove("show");
            if (button)
                button.classList.remove("open");
            if (button)
                button.setAttribute("aria-expanded", "false");
        };
        document.addEventListener("click", (e) => {
            const isClickInside = select === null || select === void 0 ? void 0 : select.contains(e.target);
            if (!isClickInside) {
                closeDropdown();
            }
        });
        button === null || button === void 0 ? void 0 : button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = optionsList.classList.contains("show");
            optionsList.classList.toggle("show");
            button.classList.toggle("open");
            button.setAttribute("aria-expanded", `${!isOpen}`);
        });
        const optionsList = document.createElement("div");
        optionsList.classList.add("category-options-list");
        optionsList.setAttribute("role", "listbox");
        optionsList.innerHTML = "";
        options.forEach((opt, index) => {
            const option = document.createElement("div");
            option.classList.add("category-option");
            option.setAttribute("role", "option");
            option.setAttribute("data-value", opt.value);
            option.textContent = this.getTranslation(opt.label);
            if (opt.selected) {
                selectedValue.textContent = this.getTranslation(opt.label);
                option.classList.add("selected");
            }
            option.addEventListener("click", (e) => {
                e.stopPropagation();
                selectedValue.textContent = this.getTranslation(opt.label);
                const allOptions = optionsList.querySelectorAll(".category-option");
                allOptions.forEach((opt) => opt.classList.remove("selected"));
                option.classList.add("selected");
                closeDropdown();
            });
            optionsList.appendChild(option);
        });
        select === null || select === void 0 ? void 0 : select.appendChild(optionsList);
    }
}
//# sourceMappingURL=Locale.js.map