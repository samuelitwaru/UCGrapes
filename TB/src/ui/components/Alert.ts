export class Alert {
    private alertElement: HTMLDivElement;
    private alertContainer: HTMLDivElement;
    private closeTimeout: number | null = null;

    constructor(status: "error" | "success", message: string, duration: number = 5000) {
        this.alertContainer = document.createElement("div");
        this.alertContainer.className = "tb-alerts-container";
        this.alertContainer.id = "tb-alerts-container";

        this.alertElement = document.createElement("div");
        this.alertElement.className = `tb-alert ${status}`;
        this.alertElement.style.display = "flex";
        this.alertElement.style.opacity = "0"
        this.alertElement.id = Math.random().toString(36);

        const alertHeader = document.createElement("div");
        alertHeader.className = "tb-alert-header";

        const strong = document.createElement("strong");
        strong.textContent = status.charAt(0).toUpperCase() + status.slice(1);

        const closeButton = document.createElement("span");
        closeButton.className = "tb-alert-close-btn";
        closeButton.textContent = "✖";
        closeButton.addEventListener("click", () => this.close());

        alertHeader.appendChild(strong);
        alertHeader.appendChild(closeButton);

        const paragraph = document.createElement("p");
        paragraph.textContent = message;

        this.alertElement.appendChild(alertHeader);
        this.alertElement.appendChild(paragraph);

        this.alertContainer.appendChild(this.alertElement);

        document.body.appendChild(this.alertContainer);

        setTimeout(() => (this.alertElement.style.opacity = "1"), 50);
        
        // Auto-close after specified duration
        this.closeTimeout = window.setTimeout(() => this.close(), duration);
    }

    close() {
        // Clear the timeout if we're closing manually
        if (this.closeTimeout) {
            clearTimeout(this.closeTimeout);
            this.closeTimeout = null;
        }
        
        this.alertElement.style.opacity = "0";
        setTimeout(() => this.alertElement.remove(), 500);
    }
}