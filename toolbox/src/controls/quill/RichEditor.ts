export class RichEditor {
  editor: any;
  e: MouseEvent;

  constructor(e: MouseEvent, editor: any) {
    this.e = e;
    this.editor = editor;
  }

  activateEditor () {
    const  activateButton = (this.e.target as Element).closest("#activate-editor");
    if (activateButton) {
      const editableDesc = activateButton.closest(".content-page-block") as HTMLElement;
      const toolbar = activateButton.closest(".tb-toolbar") as HTMLElement;
      if (editableDesc && toolbar) {
        const toolbarComponent = this.editor.Components.getWrapper().find("#" + toolbar.id);
        if (toolbarComponent) {
          toolbarComponent.setStyle({"display": "block"});
        }        
      }
    }
  }  
}
