export class Alert {
    constructor(status, message) {
        this.alertElement = document.createElement("div");
        this.alertElement.className = `tb-alert ${status}`;
        this.alertElement.style.display = "flex";
        this.alertElement.style.opacity = "0";
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
        document.body.appendChild(this.alertElement);
        setTimeout(() => (this.alertElement.style.opacity = "1"), 50);
    }
    close() {
        this.alertElement.style.opacity = "0";
        setTimeout(() => this.alertElement.remove(), 500);
    }
}
// new Alert("success", "This is a success message!");
//# sourceMappingURL=Alert.js.map