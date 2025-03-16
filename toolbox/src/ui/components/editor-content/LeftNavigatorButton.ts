export class LeftNavigatorButton {
    private container: HTMLElement;

    constructor() {
        this.container = document.createElement("div");
        this.init();
    }

    init() {
        this.container.style.display = "none";
        this.container.className = "navigator page-navigator-left";
        this.container.innerHTML = `<span id="scroll-left"><i class="fa fa-arrow-left-long"></i></span>`;

        this.container.addEventListener("click", (e) => {
            // e.preventDefault();
            // const scrollAmount = 300;
            // const scrollContainer = document.querySelector('.frame-list') as HTMLElement;
            // const firstItem = scrollContainer.querySelector('.frame-list > *') as HTMLElement; // Select the first child
            
            // if (firstItem) {
            //     scrollContainer.scrollLeft = firstItem.offsetLeft - scrollContainer.offsetLeft;
            // }
        })
    }

    render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}