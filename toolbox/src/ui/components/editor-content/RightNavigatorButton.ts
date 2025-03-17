export class RightNavigatorButton {
    private container: HTMLElement;

    constructor() {
        this.container = document.createElement("div");
        this.init();
    }

    init() {
        this.container.style.display = "none";
        this.container.className = "navigator page-navigator-right";
        this.container.innerHTML = `<span id="scroll-right"><i class="fa fa-arrow-right-long"></i></span>`;

        this.container.addEventListener("click", (e) => {
            // e.preventDefault();
            // const scrollAmount = 300;
            // const scrollContainer = document.querySelector('.frame-list') as HTMLElement;
            // scrollContainer.scrollLeft += scrollAmount;
        })
    }

    render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}