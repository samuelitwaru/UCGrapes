export class PageMapper {
    editor: any;
    wrapper: any;
    container: any;

    constructor(editor:any) {
        this.editor = editor
        this.wrapper = this.editor.getWrapper();
        const containers = this.wrapper.find('.container-column-info')
        if(containers.length) {
            this.container = containers[0]
        }
        this.map()
    }

    map() {
        if(!this.container)return

        // console.log(this.container.getEl().childNodes)

    }
}