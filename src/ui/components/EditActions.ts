import { i18n } from "../../i18n/i18n";

export class EditActions {
    private undoButton: HTMLButtonElement;
    private redoButton: HTMLButtonElement;
    private container: HTMLDivElement;
  
    constructor() {
      this.container = document.createElement('div');
  
      this.undoButton = document.createElement("button");
      this.redoButton = document.createElement("button");
      this.init();
    }
  
    private init(): void {
      this.container.classList.add("edit-actions");
  
      this.undoButton.id = "undo";
      this.undoButton.disabled = true;
      this.undoButton.className = "btn-transparent";
      this.undoButton.title =  `${i18n.t("undo")} (ctrl+z)`;
      this.undoButton.innerHTML = "<span class='fa fa-undo'></span>";
  
      this.redoButton.id = "redo";
      this.redoButton.disabled = true;
      this.redoButton.className = "btn-transparent";
      this.redoButton.title = `${i18n.t("undo")} (ctrl+shift+z)`;
      this.redoButton.innerHTML = "<span class='fa fa-redo'></span>";
  
      this.container.appendChild(this.undoButton);
      this.container.appendChild(this.redoButton);
    }
  
    render(container: HTMLElement) {
        container.appendChild(this.container);
    }
  }
  
  