import { I18n } from "i18n-js";

export const i18n = new I18n({
  en: {
    navbar: {
      tree: "Tree",
      publish: {
        label: "Publish",
        modal_title: "Publish",
        modal_description:
          "Are you sure you want to publish? Once published, all currently visible pages will be finalized and visible to residents. This action cannot be undone.",
        notify_residents: "Notify residents about the updates made",
        modal_confirm: "Publish",
        modal_cancel: "Cancel",
        sidebar_mapping_title: "Mapping"
      },
      debug: {
        label: "Debug",
        modal_title: "App Debugging",
        total_urls: "Total URLs",
        total_successful: "Successful",
        total_failed: "Failed",
        full_url: "Full URL",
        status_code: "Status Code",
        status_message: "Status Message",
        affected_tile: "Affected Tile",
        affected_content: "Affected Content",
        affected_cta: "Affected CTA",
      },
      share: {
        label: "Share",
        modal_title: "Share link for a preview",
        modal_description:
          "A shareable link has been generated for you. Copy it and share for previews!",
        copy: "Copy",
        close: "Close",
        copied: "Linked copied to clipboard",
      },
      trash: {
        label: "Trash",
        modal_title: "Trash",
        modal_description:
          "A shareable link has been generated for you. Copy it and share for previews!",
        copy: "Copy",
        close: "Close",
        copied: "Linked copied to clipboard",
      },
      appversion: {
        create_new: "Create new version",
        duplicate: "Duplicate version",
        duplicate_button: "Duplicate",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
      },
    },
    undo: "Undo",
    redo: "Redo",
    sidebar: {
      pages: "Pages",
      templates: {
        label: "Templates",
        click_to_add_template: "Click to add template",
        confirmation_title: "Confirmation",
        confirmation_message:
          "When you continue, all the changes you have made will be cleared.",
      },
      confirmation_accept: "Confirm",
      confirmation_cancel: "Cancel",
      image_upload: {
        modal_title: "Edit Content",
        cancel: "Cancel",
        save: "Save",
        upload_message:
          "<p>Drag and drop or <a href='#' id='browseLink'>browse</a></p>",
      },
      icon_category: {
        general: "General",
        services: "Services",
        health: "Health",
        living: "Living",
      },
      action_list: {
        page: "Pages",
        services: "Services",
        forms: "Forms",
        weblink: "Web link",
        module: "Modules",
        content: "Content",
        call_to_action: "Call to Action",
      },
    },
    default: {
      reception: "Reception",
      mycare: "My Care",
      myliving: "My Living",
      myservice: "My Service",
      location: "Location",
      map: "Map",
      myactivity: "My Activity",
      calendar: "Calendar",
    },
    tile: {
      add_template_right: "Add tile right",
      add_template_bottom: "Add tile below",
      delete_tile: "Delete tile",
      title: "Title",
      add_menu_page: "Add menu page",
      add_content_page: "Add content page",
      information_page: "New Page",
      existing_pages: "Existing Pages",
      call_to_action: "Direct Link",
      forms: "Forms",
      modules: "Modules",
      email: "Email",
      phone: "Phone",
      maps: "Maps",
      calendar: "Calendar",
      services: "Services",
      edit_content: "Edit Content",
      save_button: "Save",
      cancel_button: "Cancel"
    },
    messages: {
      success: {
        published: "App published successfully",
        page_created: "Page created successfully",
      },
      error: {
        page_linking: "Page cannot be linked to itself",
        select_tile: "Select a tile to continue",
        empty_page_name: "Enter page name",
        templates_on_menu_pages: "Templates can only be added to menu pages",
        no_active_page: "No active page",
        empty_version_name: "Version name is required.",
        existing_version_name: "A version with this name already exists.",
        long_version_name: "Version name cannot exceed 50 characters.",
      },
    },
    Messages: "Messages",
    Requests: "Requests",
    NoMessagesYet: "No Messages Yet"
  },

  nl: {
    navbar: {
      tree: "Boom",
      publish: {
        label: "Publiceren",
        modal_title: "Publiceren",
        modal_description:
          "Weet je zeker dat je wilt publiceren? Zodra gepubliceerd, worden alle momenteel zichtbare pagina's afgerond en zichtbaar voor bewoners. Deze actie kan niet ongedaan worden gemaakt.",
        notify_residents:
          "Bewoners op de hoogte stellen van de gemaakte updates",
        modal_confirm: "Publiceren",
        modal_cancel: "Annuleren",
        sidebar_mapping_title: "Indeling",
      },
      debug: {
        label: "Debug",
        modal_title: "App Debugging",
        total_urls: "Totaal aantal URL's",
        total_successful: "Succesvol",
        total_failed: "Mislukt",
        full_url: "Volledige URL",
        status_code: "Statuscode",
        status_message: "Statusbericht",
        affected_tile: "Beïnvloede tegel",
        affected_content: "Beïnvloede inhoud",
        affected_cta: "Beïnvloede CTA",
      },
      share: {
        label: "Delen",
        modal_title: "Deel link voor een voorbeeldweergave",
        modal_description:
          "Er is een deelbare link gegenereerd voor jou. Kopieer deze en deel hem voor previews!",
        copy: "Kopiëren",
        close: "Sluiten",
        copied: "Link gekopieerd naar klembord",
      },
      appversion: {
        create_new: "Nieuwe versie maken",
        duplicate: "Versie dupliceren",
      },
    },
    undo: "Ongedaan maken",
    redo: "Opnieuw",
    sidebar: {
      pages: "Pagina's",
      templates: {
        label: "Sjablonen",
        click_to_add_template: "Klik om een sjabloon toe te voegen",
        confirmation_title: "Bevestiging",
        confirmation_message:
          "Als je doorgaat, worden alle wijzigingen die je hebt gemaakt gewist.",
      },
      confirmation_accept: "Bevestigen",
      confirmation_cancel: "Annuleren",
      image_upload: {
        modal_title: "Inhoud bewerken",
        cancel: "Annuleren",
        save: "Opslaan",
        upload_message:
          "<p>Sleep en plaats of <a href='#' id='browseLink'>blader</a></p>",
      },
      icon_category: {
        general: "Algemeen",
        services: "Diensten",
        health: "Gezondheid",
        living: "Wonen",
      },
      action_list: {
        page: "Pagina's",
        services: "Diensten",
        forms: "Formulieren",
        weblink: "Weblink",
        module: "Modules",
        content: "Inhoud",
        call_to_action: "Call to Action",
      },
    },
    default: {
      reception: "Receptie",
      mycare: "Mijn Zorg",
      myliving: "Mijn Wonen",
      myservice: "Mijn Dienst",
      location: "Locatie",
      map: "Kaart",
      myactivity: "Mijn Activiteit",
      calendar: "Kalender",
    },
    tile: {
      add_template_right: "Tegel rechts toevoegen",
      add_template_bottom: "Tegel hieronder toevoegen",
      delete_tile: "Tegel verwijderen",
      title: "Titel",
      add_menu_page: "Menu­pagina toevoegen",
      add_content_page: "Inhouds­pagina toevoegen",
      forms: "Formulieren",
      modules: "Modules",
      existing_pages: "Bestaande pagina's",
      call_to_action: "Directe link",
      email: "e-mail",
      phone: "Telefoon",
      maps: "Kaarten",
      calendar: "Kalender",
      services: "Diensten",
      information_page: "Nieuwe Pagina",
      edit_content: "Inhoud Bewerken",
      save_button: "Bevestig",
      cancel_button: "Annuleer"


    },
    messages: {
      success: {
        published: "App succesvol gepubliceerd",
        page_created: "Pagina succesvol aangemaakt",
      },
      error: {
        page_linking: "Pagina kan niet aan zichzelf worden gekoppeld",
        select_tile: "Selecteer een tegel om door te gaan",
        empty_page_name: "Voer een paginanaam in",
        templates_on_menu_pages:
          "Sjablonen kunnen alleen aan menupagina's worden toegevoegd",
        no_active_page: "Geen actieve pagina",
        empty_version_name: "Versienaam is verplicht.",
        existing_version_name: "Er bestaat al een versie met deze naam.",
        long_version_name: "Versienaam mag niet langer zijn dan 50 tekens.",
      },
    },
    Messages: "Berichten",
    Requests: "Verzoeken",
    NoMessagesYet: "Nog geen berichten",
  },
});
