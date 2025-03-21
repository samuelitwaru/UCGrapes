class TileContextMenu {
    constructor(editorManager, event) {
        this.editorManager = editorManager;
        this.event = event;
        console.log("TileContextMenu constructor called");
        // this.createMenu();
        // this.addEventListeners();
    }

    createMenu() {
        // Create context menu container
        const contextMenu = document.createElement("div");
        contextMenu.id = "contextMenu";
        contextMenu.classList.add("context-menu");
        // Create unordered list
        const ul = document.createElement("ul");
        // Menu options
        const options = ["Option 1", "Option 2", "Option 3"];
        options.forEach((option, index) => {
            const li = document.createElement("li");
            li.textContent = option;
            li.onclick = () => alert(`${option} selected`);
            ul.appendChild(li);
        });
        contextMenu.appendChild(ul);
        document.body.appendChild(contextMenu);

        contextMenu.style.top = `${this.event.clientY}vh`;
        contextMenu.style.left = `${40}vw`;
        contextMenu.style.display = "block";
    }

    addEventListeners() {
        document.addEventListener("contextmenu", (event) => {
            console.log(event)
            if (event.target.classList.contains("context-menu-box")) {
                event.preventDefault();
                contextMenu.style.top = `${event.clientY}px`;
                contextMenu.style.left = `${event.clientX}px`;
                contextMenu.style.display = "block";
            } else {
                contextMenu.style.display = "none";
            }
        });
        
        document.addEventListener("click", () => {
            contextMenu.style.display = "none";
        });
    }
}