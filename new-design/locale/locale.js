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
    category_dynamic_form: "Dynamic Form",
    category_call_to_action: "Call to Action",
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
    category_dynamic_form: "Dynamisch Formulier",
    category_call_to_action: "Oproep tot Actie",
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
    console.log(`Setting translation to: ${this.currentLanguage}`);

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
}
