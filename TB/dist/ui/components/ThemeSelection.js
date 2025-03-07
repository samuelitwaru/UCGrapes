export class ThemeSelection {
    constructor() {
        this.container = document.createElement('div');
        this.init();
    }
    init() {
        this.container.classList.add('tb-custom-theme-selection');
        const button = document.createElement('button');
        button.classList.add('theme-select-button');
        button.setAttribute('aria-haspopup', 'listbox');
        const span = document.createElement('span');
        span.classList.add('selected-theme-value');
        span.textContent = 'Select Theme';
        button.appendChild(span);
        this.container.appendChild(button);
    }
    render(container) {
        container.appendChild(this.container);
    }
}
//# sourceMappingURL=ThemeSelection.js.map