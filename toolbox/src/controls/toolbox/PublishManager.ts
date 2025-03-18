import { ToolBoxService } from "../../services/ToolBoxService";
import { Modal } from "../../ui/components/Modal";

export class PublishManager {
  toolboxService: any;
  constructor() {
    this.toolboxService = new ToolBoxService();
  }

  openModal() {
    const div = document.createElement("div");
    const p = document.createElement("p");
    p.innerText = "Are you sure you want to publish? Once published, all currently visible pages will be finalized and visible to residents. This action cannot be undone.";
    
    const label = document.createElement("label") as HTMLLabelElement;
    label.className = "notify_residents";

    const input = document.createElement("input") as HTMLInputElement;
    input.type = "checkbox";
    input.id = "notify_residents";
    input.name = "notify_residents";

    const span = document.createElement("span") as HTMLSpanElement;
    span.innerText = "Notify residents on about the updates made.";

    label.appendChild(input);
    label.appendChild(span);

    const submitSection = document.createElement("div");
    submitSection.classList.add("popup-footer");
    submitSection.style.marginBottom = "-12px";

    const saveBtn = this.createButton(
      "submit_publish",
      "tb-btn-primary",
      "Publish"
    );
    const cancelBtn = this.createButton(
      "cancel_publish",
      "tb-btn-secondary",
      "Cancel"
    );

    submitSection.appendChild(saveBtn);
    submitSection.appendChild(cancelBtn);

    div.appendChild(p);
    div.appendChild(label);
    div.appendChild(submitSection);

    const modal = new Modal({
      title: "Confirm Publish",
      width: "500px",
      body: div,
    });

    modal.open();

    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Publishing...", input.checked);
    //   this.processData()
    //   this.toolboxService.createVersion().then((res) => {
    //     modal.close();
    //     this.refreshVersionList();
    //   });
    });

    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.close();
    });
  }
  public processData() {
    // process the data from here
  }

  private createButton(id: string, className: string, text: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.id = id;
    btn.classList.add('tb-btn', className);
    btn.innerText = text;
    return btn;
 }
}
