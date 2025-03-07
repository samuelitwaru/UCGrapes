export class TitleInputSection {
    input: HTMLInputElement;

    constructor() {
        this.input = document.createElement('input');
        this.init();
    }

    init() {
        this.input.type = 'text';
        this.input.placeholder = 'Enter a title';
        this.input.classList.add("tb-form-control");
        this.input.id = "tile-title";

        this.input.addEventListener('input', (e) => {
            // console.log(this.input.value);
        })
    }

    render(container: HTMLElement) {
        container.appendChild(this.input);        
    }
}