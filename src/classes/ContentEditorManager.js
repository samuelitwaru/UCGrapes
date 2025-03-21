class ContentEditorManager {
  constructor(e, editor, editorManager) {
    this.editor = editor;
    this.event = e;
    this.editorManager = editorManager;
    this.init();
  }

  async init() {
    this.pages = await this.editorManager.dataManager.getPages();
    this.currentPage = this.pages?.SDT_PageCollection?.find((page) => page.PageId === this.editorManager.currentPageId);
    this.openContentEditModal();
    this.openImageUploadModal();
    this.openDeleteModal();
    this.templateManager = new TemplateManager;
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
            if (this.currentPage) {
              if (this.currentPage.PageName === "Location") {
                this.saveLocationContent(content);
              } else if (this.currentPage.PageName === "Reception") {
                this.saveReceptionContent(content);
              } else {
                this.saveContentPageInfo(content);
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
        let type;
        if (this.currentPage.PageName === "Location") {
          type = 'update-location-image';
        } else if (this.currentPage.PageName === "Reception") {
          type = 'update-reception-image';
        } else {
          type = 'update-content-image';
        } 

        toolboxManager.openFileManager(type);
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

  async saveContentPageInfo(content) {
    const data = {
      ProductServiceId: this.editorManager.currentPageId,
      ProductServiceDescription: content
    }

    const res = await this.editorManager.dataManager.updateDescription(data);
    if (res) {
        const descComponent = this.editor.Components.getWrapper().find("#contentDescription")[0]; 
        if (descComponent) {
            descComponent.replaceWith(`<div ${defaultConstraints} id="contentDescription">${content}</div>`);
        }
    }
  }

  async saveLocationContent(content) {
    const data = {
      LocationDescription: content,
      LocationImageBase64: "",
      ReceptionDescription: "",
      ReceptionImageBase64: ""
    }

    const res = await this.editorManager.dataManager.updateLocationInfo(data);
    if (res) {
        const descComponent = this.editor.Components.getWrapper().find("#contentDescription")[0]; 
        if (descComponent) {
            descComponent.replaceWith(`<div ${defaultConstraints} id="contentDescription">${content}</div>`);
        }
    }
  }

  async saveReceptionContent(content) {
    const data = {
      LocationDescription: "",
      LocationImageBase64: "",
      ReceptionDescription: content,
      ReceptionImageBase64: ""
    }

    const res = await this.editorManager.dataManager.updateLocationInfo(data);
    if (res) {
        const descComponent = this.editor.Components.getWrapper().find("#contentDescription")[0]; 
        if (descComponent) {
            descComponent.replaceWith(`<div ${defaultConstraints} id="contentDescription">${content}</div>`);
        }
    }
  }
}
