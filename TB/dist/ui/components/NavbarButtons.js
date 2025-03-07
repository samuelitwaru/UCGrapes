import { Button } from "./Button";
import { EditActions } from "./EditActions";
import { ThemeSelection } from "./ThemeSelection";
export class NavbarButtons {
    constructor() {
        this.container = document.getElementById("navbar-buttons");
        this.init();
    }
    init() {
        const editActions = new EditActions();
        const themeSelection = new ThemeSelection();
        let treeButton = new Button("open-mapping", "Tree", {
            labelId: "navbar_tree_label",
        });
        let publishButton = new Button("publish", "Publish", {
            variant: "outline",
            labelId: "navbar_tree_label",
        });
        editActions.render(this.container);
        themeSelection.render(this.container);
        treeButton.render(this.container);
        publishButton.render(this.container);
    }
    render(container) {
        container.appendChild(this.container);
    }
}
//# sourceMappingURL=NavbarButtons.js.map