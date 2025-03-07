import { Button } from "../../components/Button";
class NavBarButtons {
    static getNavBar() {
        const treeButton = new Button("open-mapping", "Tree", {
            labelId: "navbar_tree_label",
        });
        const publishButton = new Button("publish", "Publish", {
            labelId: "navbar_publish_label",
        });
        const navbarButtons = document.getElementById("div");
        treeButton.render(navbarButtons);
        publishButton.render(navbarButtons);
    }
}
//# sourceMappingURL=NavBarButtons.js.map