class ContentEditorManager {
  constructor(e, editor, editorManager) {
    this.editor = editor;
    this.event = e;
    this.editorManager = editorManager;
    this.init();
  }

  init() {
    this.openContentEditModal();
    this.openImageUploadModal();
    this.openDeleteModal();
    this.templateManager = new TemplateManager
  }

  openContentEditModal() {
    const editorTrigger = this.event.target.closest(".tb-edit-content-icon");
    if (editorTrigger) {
      const popupId = "edit-content-modal";
      const title = "Edit Content";
      const htmlBody = `<div id="editor">
                            ${this.getDescription()}
                        </div>`;
        const handleConfirm = async (event) => {
            const content = document.querySelector("#editor .ql-editor").innerHTML;
            const data = {
                ProductServiceId: this.editorManager.currentPageId,
                ProductServiceDescription: content
            }

            const res = await this.editorManager.dataManager.updateDescription(data);
            if (res) {
                const descComponent = this.editor.Components.getWrapper().find("#contentDescription")[0]; // Assuming you have a method to get the description component
                if (descComponent) {
                    descComponent.replaceWith(`<div ${defaultConstraints} id="contentDescription">${content}</div>`);
                }
            }
            
            editModal.closePopup();
        };

      const editModal = new FormPopupModal(popupId, title, htmlBody, handleConfirm);
      editModal.show();

      const quill = new Quill("#editor", {
        modules: {
          toolbar: [
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
          ],
        },
        theme: "snow",
      });
    }
  }

  openImageUploadModal() {
    const editorTrigger = this.event.target.closest(".tb-edit-image-icon");
    if (editorTrigger) {
        const toolboxManager = this.editorManager.toolsSection;
        toolboxManager.openFileManager('update-content-image');
    }
  }

  openDeleteModal() {
    const deleteTrigger = this.event.target.closest(".tb-delete-image-icon");
    if (deleteTrigger) {
        const handleConfirm = async (event) => {
            const data = {
                ProductServiceId: this.editorManager.currentPageId,
            }

            const res = await this.editorManager.dataManager.deleteContentImage(data);
            if (res) {
                const descImageComponent = this.editor.Components.getWrapper().find("#product-service-image")[0];
                if (descImageComponent) {
                    const parentComponent = descImageComponent.parent();
                    if (parentComponent) {
                        parentComponent.remove();
                    }
                }
            }
            editModal.closePopup();
        };
        const popupId = "delete-desc-image";
        const title = "Delete content image";
        const htmlBody = "Are you sure you want to delete this image?";
        const editModal = new FormPopupModal(popupId, title, htmlBody, handleConfirm);
        editModal.show();
    }
  }

  getDescription () {
    const description = this.event.target.closest(".content-page-block");
    if (description) {
        const descComponent = this.editor.Components.getWrapper().find("#contentDescription")[0];
        if (descComponent) {
            console.log(descComponent.getEl().innerHTML);
            return descComponent.getEl().innerHTML;
        }
    }
  }
}
