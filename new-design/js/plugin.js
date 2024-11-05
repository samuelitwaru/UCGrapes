const appBuilderPlugin = (editor) => {

    editor.BlockManager.add("default-block", {
        label: "Default Block",
        content: "<div class='default-block'>This is the default block.</div>",
        category: "Basic",
        attributes: { class: "fa fa-square" },
    });
}

grapesjs.plugins.add("app-builder-plugins", appBuilderPlugin);