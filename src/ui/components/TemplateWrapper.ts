import { TemplateManager } from "../../controls/templates/TemplateManager";
import { i18n } from "../../i18n/i18n";
import { Alert } from "./Alert";
import { ConfirmationBox } from "./ConfirmationBox";

export class TemplateWrapper {
    private templateList: HTMLDivElement;
  
    constructor(templates: { id: string, image: string }[]) {
      this.templateList = document.createElement("div");
      this.templateList.id = "page-templates";
  
      templates.forEach((template, index) => {
        const templateWrapper = document.createElement("div");
        templateWrapper.className = "page-template-wrapper";
        templateWrapper.id = template.id;
  
        const templateBlockNumber = document.createElement("div");
        templateBlockNumber.className = "page-template-block-number";
  
        const templateBlock = document.createElement("div");
        templateBlock.className = "page-template-block";
        templateBlock.title = i18n.t("sidebar.templates.click_to_add_template");
  
        const div = document.createElement("div");
  
        const img = document.createElement("img");
        img.style.width = "100%";
        img.style.height = "100%";
        img.src = template.image;
  
        div.appendChild(img);
  
        templateBlock.appendChild(div);
  
        templateBlockNumber.innerHTML = `${index + 1}`;
  
        templateWrapper.appendChild(templateBlockNumber);
        templateWrapper.appendChild(templateBlock);
  
        templateWrapper.addEventListener("click", (e) => {
          e.preventDefault();
          const editor = (globalThis as any).activeEditor;
          const page = (globalThis as any).pageData;

          if (!editor && !page?.PageId) {
            new Alert("error", i18n.t("messages.error.no_active_page"));
            return;
          }

          if (!page || page.PageType !== "Menu") {
            new Alert("error", i18n.t("messages.error.templates_on_menu_pages"));
            return;
          }

          const title = i18n.t("sidebar.templates.confirmation_title");
          const message = i18n.t("sidebar.templates.confirmation_message");
      
          const handleConfirmation = async () => {
            new TemplateManager(page.PageId, editor, templateWrapper.id)
          }
          const confirmationBox = new ConfirmationBox(
              message,
              title,
              handleConfirmation,
          );
          confirmationBox.render(document.body);          
        });

        this.templateList.appendChild(templateWrapper);
      });
    }
  
    render(container: HTMLElement) {
      container.appendChild(this.templateList);      
    }
  }
  
  
//   const templates = [
//       { image: "https://example.com/template1.jpg" },
//       { image: "https://example.com/template2.jpg" },
//       { image: "https://example.com/template3.jpg" }
//     ];
    
//     // Create a TemplateWrapper instance with a list of templates
//     const templateWrapper = new TemplateWrapper(templates);
  
//     templateWrapper.render(document.body);