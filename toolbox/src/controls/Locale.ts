interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

export class Locale {
  private currentLanguage: string;
  private defaultLanguage: string;
  private translations: Translations;

  constructor(language: string) {
    this.currentLanguage = language;
    this.defaultLanguage = "english";
    this.translations = {};
  }

  async init(): Promise<this> {
    await this.loadTranslations();
    return this;
  }

  private async loadTranslations(): Promise<void> {
    try {
      const languages: string[] = ["english", "dutch"];
      for (const lang of languages) {
        const res = await fetch(
          `${window.location.origin}/Resources/UCGrapes1/toolbox/i18n/${lang}.json`
        );

        if (!res.ok) throw new Error(`Failed to fetch ${lang} translations`);

        const data = await res.json();
        this.translations[lang] = data;
      }
    } catch (error: any) {
      console.error("Failed to load translations:", error);
      throw new Error(`Failed to load translations: ${error.message}`);
    }
  }

  async setLanguage(language: string): Promise<void> {
    if (Object.keys(this.translations).length === 0) {
      await this.loadTranslations();
    }

    const elementsToTranslate: string[] = [
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
      } else {
        console.warn(`Element with id '${elementId}' not found`);
      }
    });
  }

  translateTilesTitles(editor: any): void {
    const tileTitlesToTranslate: string[] = [
      "tile-reception",
      "tile-calendar",
      "tile-mailbox",
      "tile-location",
      "tile-my-care",
      "tile-my-living",
      "tile-my-services",
    ];

    tileTitlesToTranslate.forEach((elementClass) => {
      const components = editor.DomComponents.getWrapper().find(
        `.${elementClass}`
      );
      if (components.length) {
        const newHTML = `<span data-gjs-type="text" class="tile-title ${elementClass}">${this.getTranslation(
          elementClass
        )}</span>`;
        components[0].replaceWith(newHTML);
      }
    });
  }

  private getTranslation(key: string): string {
    if (!this.translations || Object.keys(this.translations).length === 0) {
      console.warn("Translations not yet loaded");
      return key;
    }

    const translation =
      this.translations[this.currentLanguage]?.[key] ||
      this.translations[this.defaultLanguage]?.[key];

    if (!translation) {
      console.warn(`Translation missing for key '${key}'`);
      return key;
    }
    return translation;
  }

  translateUCStrings(): void {
    const tileTitleElement = document.getElementById("tile-title") as HTMLInputElement;
    if (tileTitleElement) {
      tileTitleElement.placeholder = this.getTranslation(
        "enter_title_place_holder"
      );
    }

    const options: { value: string; label: string; selected?: boolean }[] = [
      { value: "Services", label: "icon_category_services" },
      { value: "General", label: "icon_category_general", selected: true },
      { value: "Health", label: "icon_category_health" },
      { value: "Living", label: "icon_category_living" },
    ];

    const select = document.querySelector(".tb-custom-category-selection");
    const button = select?.querySelector(".category-select-button");
    const selectedValue = button?.querySelector(".selected-category-value");

    const closeDropdown = () => {
      if (optionsList) optionsList.classList.remove("show");
      if (button) button.classList.remove("open");
      if (button) button.setAttribute("aria-expanded", "false");
    };

    document.addEventListener("click", (e) => {
      const isClickInside = select?.contains(e.target as Node);
      if (!isClickInside) {
        closeDropdown();
      }
    });

    button?.addEventListener("click", (e) => {
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
        selectedValue!.textContent = this.getTranslation(opt.label);
        option.classList.add("selected");
      }

      option.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedValue!.textContent = this.getTranslation(opt.label);

        const allOptions = optionsList.querySelectorAll(".category-option");
        allOptions.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");

        closeDropdown();
      });

      optionsList.appendChild(option);
    });

    select?.appendChild(optionsList);
  }
}
