export class Button {
    private button: HTMLButtonElement;

    constructor(
        id: string,
        text: string, 
        options: {
            svg?: SVGElement,
            variant?: 'outline' | 'primary',
            labelId?: string,
        } = {}
    ) {
        this.button = document.createElement('button');
        this.button.id = id;
        this.button.className = `tb-btn tb-btn-${options.variant || 'primary'}`; 
    
        if (options.svg) {
            this.button.appendChild(options.svg);
        }

        const span = document.createElement('span');
        if (options.labelId) {
            span.id = options.labelId;            
        }
        span.textContent = text;

        this.button.appendChild(span);
    }

    render(container: HTMLElement) {
        container.appendChild(this.button);
    }
}

// const treeButton = new Button(
//     'open-mapping', 
//     'Tree', 
//     { 
//       labelId: 'navbar_tree_label' 
//     }
// );

// treeButton.render(document.body);