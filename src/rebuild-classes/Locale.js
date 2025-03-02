export class Locale {
    constructor(language) {
      this.currentLanguage = language;
      this.defaultLanguage = "english";
      this.translations = {};
    }
  
    async init() {
      await this.loadTranslations();
      return this; // Allow chaining
    }
  
    async loadTranslations() {
      try {
        const languages = ["english", "dutch"];
        for (const lang of languages) {
          const response = await fetch(
            `${window.location.origin}/Resources/UCGrapes1/src/i18n/${lang}.json`
          );
          if (!response.ok)
            throw new Error(`Failed to load ${lang} translations`);
          const data = await response.json();
          this.translations[lang] = data;
        }
      } catch (error) {
        console.error("Error loading translations:", error);
        throw new Error(`Failed to load translations: ${error.message}`);
      }
    }
  
    async setLanguage(language) {
      // Wait for translations to be loaded
      if (Object.keys(this.translations).length === 0) {
        await this.loadTranslations();
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
        } else {
          console.warn(`Element with id '${elementId}' not found`);
        }
      });
  
    }
  
    translateTilesTitles(editor){
      
      const tileTitlesToTranslate = [
        "tile-reception", "tile-calendar", "tile-mailbox", "tile-location",
        "tile-my-care", "tile-my-living", "tile-my-services"
      ]
  
      tileTitlesToTranslate.forEach(elementClass => {
        const components = editor.DomComponents.getWrapper().find(`.${elementClass}`);
        if (components.length) {
          const newHTML = `<span data-gjs-type="text" class="tile-title ${elementClass}">${this.getTranslation(elementClass)}</span>`
          components[0].replaceWith(newHTML);
        } 
      })
    }
  
    getTranslation(key) {
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
  
    translateUCStrings() {
      document.getElementById("tile-title").placeholder = this.getTranslation(
        "enter_title_place_holder"
      );
  
      const options = [
        {
          value: "Services",
          label: "icon_category_services",
        },
        {
          value: "General",
          label: "icon_category_general",
          selected: true,
        },
        {
          value: "Health",
          label: "icon_category_health",
        },
        {
          value: "Living",
          label: "icon_category_living",
        },
      ];
  
      const select = document.querySelector(".tb-custom-category-selection");
      const button = select.querySelector(".category-select-button");
      const selectedValue = button.querySelector(".selected-category-value");
  
      const closeDropdown = () => {
        optionsList.classList.remove("show");
        button.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
      };
      
      // Handle outside clicks
      document.addEventListener("click", (e) => {
        const isClickInside = select.contains(e.target);
        
        if (!isClickInside) {
          closeDropdown();
        }
      });
      
      // Toggle dropdown visibility
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent the document click handler from immediately closing the dropdown
        const isOpen = optionsList.classList.contains("show");
        optionsList.classList.toggle("show");
        button.classList.toggle("open");
        button.setAttribute("aria-expanded", !isOpen);
      });
      
      const optionsList = document.createElement("div");
      optionsList.classList.add("category-options-list");
      optionsList.setAttribute("role", "listbox");
      optionsList.innerHTML = "";
      
      // Populate themes into the dropdown
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
      
          // Mark as selected
          const allOptions = optionsList.querySelectorAll(".category-option");
          allOptions.forEach((opt) => opt.classList.remove("selected"));
          option.classList.add("selected");
      
          // Close the dropdown
          closeDropdown();
        });
      
        // Append option to the options list
        optionsList.appendChild(option);
      });
      
      select.appendChild(optionsList);
      
      // Cleanup function to remove event listeners when needed
      const cleanup = () => {
        document.removeEventListener("click", closeDropdown);
      };
    }
  }
  