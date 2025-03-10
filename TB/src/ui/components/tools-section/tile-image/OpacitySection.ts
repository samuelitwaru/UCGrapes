export class OpacitySection {
    container: HTMLElement;

    constructor() {
        this.container = document.createElement('div');
        this.init();
    }

    init() {
        this.container.className = 'bg-section';

        const addImageBtn = document.createElement('button');
        addImageBtn.className = 'add-image';
        addImageBtn.id = 'image-bg';
        addImageBtn.innerHTML = `
            <span class="plus">
               <i class="fa fa-plus"></i>
            </span>
            <span class="image-icon">
                <i class="fa fa-image"></i>
            </span>
        `;

        const sliderWrapper = document.createElement('div');
        sliderWrapper.className = 'slider-wrapper';
        sliderWrapper.id = 'slider-wrapper'
        sliderWrapper.innerHTML = `
            <input
                type="range"
                id="bg-opacity"
                min="0"
                max="100"
                value="80"
                oninput="document.getElementById('valueDisplay').textContent = this.value + ' %'">
            <span class="value-display" id="valueDisplay">0%</span>
        `;

        this.container.appendChild(addImageBtn);
        this.container.appendChild(sliderWrapper);        
    }

    render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}