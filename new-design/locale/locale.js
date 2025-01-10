const translations = {
    english: {
      navbar_title: "The App toolbox builder",
      navbar_tree_label: "Tree",
      navbar_publish_label: "Publish",
      sidebar_tabs_pages_label: "Pages",
      sidebar_tabs_templates_label: "Templates",
      sidebar_select_action_label: "Select Action",
      new_page_submit_label: "Submit",
      template_added_success_message: "Template added successfully!",
      theme_applied_success_message: "Theme applied successfully",
      page_loaded_success_message: "Page loaded successfully",
      no_tile_selected_error_message: "Select a tile to continue...",
      error_loading_data_message: "Error loading data",
      failed_to_save_current_page_message: "Failed to save current page",
      tile_has_bg_image_error_message: "The tile has no background image",
      error_applying_theme_message: "Error applying theme",
      no_icon_selected_error_message: "No icon selected",
      error_save_message: "Failed to save current page",
      confirmation_modal_title: "Confirmation",
      confirmation_modal_message:
        "When you continue, all the changes you have made will be cleared.",
      accept_popup: "Ok",
      close_popup: "Close",
      sidebar_mapping_title: "MAPPING",
      alert_type_success: "Success",
      alert_type_error: "Error",
      file_upload_modal_title: "Upload",
      upload_section_text: `<p>Drag and drop or <a href="#" id="browseLink">browse</a></p>`,
      cancel_btn: "Cancel",
      save_btn: "Save",
      category_page: "Page",
      category_services_or_page: "Service/Product Page",
      category_predefined_page: "Predefined Page",
      category_dynamic_form: "Dynamic Form",
      category_call_to_action: "Call to Action",
      cta_button_exists: "Cta button already exists!",
      please_select_cta_button: "Please select Cta button",
      publish_confirm_title: "Confirm Publish",
      publish_confirm_message:
        "Are you sure you want to publish? Once published, all currently visible pages will be finalized and visible to residents. This action cannot be undone.",
      nofity_residents_on_publish: "Notify residents on about the updates made.",
      publish_confirm_button: "Publish",
      publish_cancel_button: "Cancel",
      enter_title_place_holder: "Enter title",
      icon_category_services: "Services",
      icon_category_general:  "General",
      icon_category_health: "Health",
      icon_category_living: "Living",
      click_to_load_template: "Click to load template",
      tile_title: "Title",
      delete_media_modal_title: "Delete Media",
      delete_media_modal_message: "Are you sure you want to delete this media file?",
      failed_to_delete_media: "Failed to delete media file. Please try again.",
      delete_btn: "Delete",
      not_authenticated_message: "You are not authenticated. Please login to continue.",
      no_home_page_found: "No home page found.",
      error_during_deleting_media: "An error occurred while deleting the media file.",
      media_deleted_successfully: "Media file deleted successfully.",
      error_creating_page: "An error occurred while creating the page.",
  
    },
    dutch: {
      navbar_title: "De app gereedschapskist bouwer",
      navbar_tree_label: "Boom",
      navbar_publish_label: "Publiceren",
      sidebar_tabs_pages_label: "Pagina's",
      sidebar_tabs_templates_label: "Sjablonen",
      sidebar_select_action_label: "Selecteer Actie",
      new_page_submit_label: "Indienen",
      template_added_success_message: "Sjabloon succesvol toegevoegd!",
      theme_applied_success_message: "Thema succesvol toegepast",
      page_loaded_success_message: "Pagina succesvol geladen",
      no_tile_selected_error_message: "Selecteer een tegel om door te gaan...",
      error_loading_data_message: "Fout bij het laden van gegevens",
      failed_to_save_current_page_message:
        "Het opslaan van de huidige pagina is mislukt",
      tile_has_bg_image_error_message:
        "De tegel heeft geen achtergrondafbeelding",
      error_applying_theme_message: "Fout bij het toepassen van het thema",
      no_icon_selected_error_message: "Geen pictogram geselecteerd",
      error_save_message: "Het opslaan van de huidige pagina is mislukt",
      confirmation_modal_title: "Bevestiging",
      confirmation_modal_message:
        "Als u doorgaat, worden alle aangebrachte wijzigingen gewist.",
      accept_popup: "Oké",
      close_popup: "Sluiten",
      sidebar_mapping_title: "KOPPELING",
      alert_type_success: "Succes",
      alert_type_error: "Fout",
      file_upload_modal_title: "Uploaden",
      upload_section_text: `<p>Slepen en neerzetten of <a href="#" id="browseLink">bladeren</a></p>`,
      cancel_btn: "Annuleren",
      save_btn: "Opslaan",
      category_page: "Pagina",
      category_services_or_page: "Dienst/Productpagina",
      category_predefined_page: "Vooraf Gedefinieerde Pagina",
      category_dynamic_form: "Dynamisch Formulier",
      category_call_to_action: "Oproep tot Actie",
      cta_button_exists: "Cta button al bestaat!",
      please_select_cta_button: "Selecteer alstublieft de Cta-knop",
      publish_confirm_title: "Publicatie Bevestigen",
      publish_confirm_message:
      "Weet je zeker dat je wilt publiceren? Zodra gepubliceerd, worden alle momenteel zichtbare pagina's gefinaliseerd en zichtbaar voor bewoners. Deze actie kan niet ongedaan worden gemaakt.",
      nofity_residents_on_publish: "Meld bewoners de updates die zijn aangebracht.",
      publish_confirm_button: "Publiceren",
      publish_cancel_button: "Annuleren",
      enter_title_place_holder: "Voer titel in",
      icon_category_services: "Diensten",
      icon_category_general:  "Algemeen",
      icon_category_health: "Gezondheid",
      icon_category_living: "Wonen",
      click_to_load_template: "Klik om sjabloon te laden",
      tile_title: "Titel",
      delete_media_modal_title: "Verwijder media",
      delete_media_modal_message: "Weet je zeker dat je dit mediabestand wilt verwijderen?",
      failed_to_delete_media: "Mislukt om mediabestand te verwijderen. Probeer het opnieuw.",
      delete_btn: "Verwijderen",
      not_authenticated_message: "Je bent niet geauthenticeerd. Log in om door te gaan.",
      no_home_page_found: "Geen startpagina gevonden.",
      error_during_deleting_media: "Er is een fout opgetreden bij het verwijderen van het mediabestand.",
      media_deleted_successfully: "Mediabestand succesvol verwijderd.",
      error_creating_page: "Er is een fout opgetreden bij het aanmaken van de pagina.",
    },
  };
  
  class Locale {
    constructor(language) {
        if (!translations[language]) {
            throw new Error(`Unsupported language: ${language}`);
        }
        this.currentLanguage = language;
        this.defaultLanguage = "english";
    }
  
    setLanguage() {
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
  
    getTranslation(key) {
        // Check if key exists in current language
        if (translations[this.currentLanguage]?.[key]) {
            return translations[this.currentLanguage][key];
        }
  
        // Fallback to default language
        if (translations[this.defaultLanguage]?.[key]) {
            console.warn(
                `Translation missing for key '${key}' in ${this.currentLanguage}, using ${this.defaultLanguage}`
            );
            return translations[this.defaultLanguage][key];
        }
  
        // Return key as last resort
        console.error(`Translation key '${key}' not found in any language`);
        return key;
    }
  
    translateUCStrings() {
        document.getElementById("tile-title").placeholder = this.getTranslation("enter_title_place_holder");
  
        const options = [{
                value: "Services",
                label: "icon_category_services"
            },
            {
                value: "General",
                label: "icon_category_general",
                selected: true
            },
            {
                value: "Health",
                label: "icon_category_health"
            },
            {
                value: "Living",
                label: "icon_category_living"
            },
        ];
  
        const selectElement = document.getElementById("theme_icon_category");
        if (selectElement) {
            const optionHTML = options.map(opt => `
            <option value="${opt.value}" ${opt.selected ? "selected" : ""}>
                ${this.getTranslation(opt.label)}
            </option>
        `).join("");
  
            selectElement.innerHTML = optionHTML;
        }
    }
  }
  