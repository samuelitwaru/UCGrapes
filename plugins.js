function myPlugin(editor) {
  editor.Components.addType("status-bar", {
    isComponent: (el) => {
      if (el.getAttribute && el.getAttribute("data-gjs-type") === "status-bar")
        return true;
      if (el.type === "status-bar") return true;
      return false;
    },
    model: {
      defaults: {
        type: "status-bar",
        draggable: false,
        removable: false,
        copyable: false,
        layerable: false,
        selectable: false,
        hoverable: false,
        highlightable: false,
        attributes: { "data-gjs-type": "status-bar" },
      },
    },
  });

  // editor.Components.addType("main-content", {
  //   isComponent: (el) => {
  //     if (
  //       el.getAttribute &&
  //       el.getAttribute("data-gjs-type") === "main-content"
  //     )
  //       return true;
  //     if (el.type === "main-content") return true;
  //     return false;
  //   },
  //   model: {
  //     defaults: {
  //       type: "main-content",
  //       draggable: false,
  //       removable: false,
  //       copyable: false,
  //       layerable: false,
  //       selectable: true,
  //       hoverable: true,
  //       highlightable: true,
  //       attributes: { "data-gjs-type": "main-content" },
  //     },
  //   },
  // });

  // // Add the status bar and main content container to the body on editor initialization
  // editor.on("load", () => {
  //   const components = editor.getComponents();

  //   // Add status bar if it doesn't exist
  //   if (!components.where({ type: "status-bar" }).length) {
  //     editor.addComponents(
  //       `
  // <div data-gjs-type="status-bar" style="
  //   background-color: #000;
  //   color: #fff;
  //   font-size: 12px;
  //   padding: 5px 20px;
  //   display: flex;
  //   justify-content: space-between;
  //   align-items: center;
  //   height: 24px;">
  //   <div style="display: flex; gap: 10px;">
  //     <span style="font-size: 10px;">12:34</span>
  //   </div>
  //   <div style="display: flex; gap: 5px;">
  //     <i class="fa fa-signal"></i>
  //     <i class="fa fa-wifi"></i>
  //     <i class="fa fa-battery-three-quarters"></i>
  //   </div>
  // </div>`,
  //       { at: 0 }
  //     );
  //   }

  //   // Add main content container if it doesn't exist
  //   if (!components.where({ type: "main-content" }).length) {
  //     editor.addComponents(
  //       `
  //       <div data-gjs-type="main-content" style="
  //         background-color: #f0f0f0;
  //         padding: 10px;
  //         min-height: calc(100vh - 24px);">
  //         <p>Add your content here...</p>
  //       </div>`,
  //       { at: 1 }
  //     );
  //   }
  // });

  editor.BlockManager.add("block-text", {
    label: "Text",
    category: "Tool Box",
    content: `
      <div style="padding: 1rem;">
        <p style="font-size: 1.25rem; color: #343a40;">
          This is a mobile-optimized text block. You can edit this content inline.
        </p>
      </div>`,
    attributes: { class: "fa fa-font" },
  });

  editor.BlockManager.add("block-image", {
    label: "Image",
    category: "Tool Box",
    content: `
      <div style="text-align: center; padding: 1rem;">
        <img src="https://via.placeholder.com/300" alt="Placeholder Image" style="max-width: 100%; height: auto;">
      </div>`,
    attributes: { class: "fa fa-image" },
  });

  editor.BlockManager.add("block-button", {
    label: "Button",
    category: "Tool Box",
    content: `
      <div style="text-align: center; padding: 1rem;">
        <a href="#" style="display: inline-block; padding: 0.5rem 1rem; color: #fff; background-color: #28a745; border: 1px solid #28a745; text-decoration: none; border-radius: 0.25rem;">
          Click Me
        </a>
      </div>`,
    attributes: { class: "fa fa-circle-dot" },
  });

  editor.BlockManager.add("block-form", {
    label: "Form",
    category: "Tool Box",
    content: `
      <form style="padding: 1rem;">
        <div style="margin-bottom: 1rem;">
          <label for="name" style="display: block; margin-bottom: 0.5rem;">Name:</label>
          <input type="text" id="name" name="name" style="width: 100%; padding: 0.5rem; border: 1px solid #ced4da; border-radius: 0.25rem;">
        </div>
        <div style="margin-bottom: 1rem;">
          <label for="email" style="display: block; margin-bottom: 0.5rem;">Email:</label>
          <input type="email" id="email" name="email" style="width: 100%; padding: 0.5rem; border: 1px solid #ced4da; border-radius: 0.25rem;">
        </div>
        <button type="submit" style="width: 100%; padding: 0.5rem; color: #fff; background-color: #28a745; border: 1px solid #28a745; border-radius: 0.25rem;">
          Submit
        </button>
      </form>`,
    attributes: { class: "fa fa-rectangle-list" },
  });

  editor.BlockManager.add("full-body-container", {
    label: "Full Body Container",
    category: "Tool Box",
    content: `
      <div style="display: flex; flex-direction: column; height: 100vh; padding: 1rem; background-color: #f8f9fa;">
        <div style="flex: 1; display: flex; justify-content: center; align-items: center;">
          <p style="font-size: 1.25rem; text-align: center;">
            Add content here
          </p>
        </div>
      </div>
    `,
    attributes: { class: "fa fa-arrows-alt" },
  });

  editor.BlockManager.add("container", {
    label: "Container",
    category: "Tool Box",
    content: `
      <div style="max-width: 1140px; margin: 0 auto; padding: 1rem; background-color: #f8f9fa;">
        <div style="display: flex; flex-direction: column;">
          <div style="padding: 1rem;">
            <!-- Content goes here -->
            <p>Mobile-friendly container content here...</p>
          </div>
        </div>
      </div>
    `,
    attributes: { class: "fa fa-cube" },
  });

  editor.BlockManager.add("spacer", {
    label: "Horizontal Spacer",
    category: "Tool Box",
    content: `
      <div style="
        height: 20px; 
        background-color: transparent;
      ">
      </div>
    `,
    attributes: { class: "fa fa-arrows-alt-v" },
  });

  editor.BlockManager.add("vertical-spacer", {
    label: "Vertical Spacer",
    category: "Tool Box",
    content: `
      <div style="
        width: 20px; 
        height: 50px;
        background-color: transparent;
        box-sizing: border-box;
      ">
      </div>
    `,
    attributes: { class: "fa fa-arrows-alt-h" },
  });

  // Adding a 2-column row block with centered content
  editor.Blocks.add("bs-2-cols", {
    label: "2 Column Row",
    category: "Columns",
    attributes: { class: "fa fa-th-large" }, // Icon for the block
    content: `
      <div style="display: flex; padding: 1rem; background-color: #f8f9fa;">
        <div style="flex: 1; text-align: center; padding: 10px; display: flex; justify-content: center; align-items: center;">
          <p>Column 1</p>
        </div>
        <div style="flex: 1; text-align: center; padding: 10px; display: flex; justify-content: center; align-items: center;">
          <p>Column 2</p>
        </div>
      </div>
    `,
  });

  // Adding a 3-column row block with centered content
  editor.Blocks.add("bs-3-cols", {
    label: "3 Column Row",
    category: "Columns",
    attributes: { class: "fa fa-th" }, // Icon for the block
    content: `
      <div style="display: flex; flex-wrap: wrap; padding: 1rem; background-color: #f8f9fa;">
        <div style="flex: 1; text-align: center; padding: 10px; display: flex; justify-content: center; align-items: center;">
          <p>Column 1</p>
        </div>
        <div style="flex: 1; text-align: center; padding: 10px; display: flex; justify-content: center; align-items: center;">
          <p>Column 2</p>
        </div>
        <div style="flex: 1; text-align: center; padding: 10px; display: flex; justify-content: center; align-items: center;">
          <p>Column 3</p>
        </div>
      </div>
    `,
  });

  // Adding a 30% / 70% column row block with centered content
  editor.Blocks.add("bs-30-70-cols", {
    label: "30% / 70% Column Row",
    category: "Columns",
    attributes: { class: "fa fa-columns" }, // Icon for the block
    content: `
      <div style="display: flex; padding: 1rem; background-color: #f8f9fa;">
        <div style="flex: 0 0 30%; text-align: center; padding: 10px; display: flex; justify-content: center; align-items: center;">
          <p>Column 1 (30%)</p>
        </div>
        <div style="flex: 0 0 70%; text-align: center; padding: 10px; display: flex; justify-content: center; align-items: center;">
          <p>Column 2 (70%)</p>
        </div>
      </div>
    `,
  });

  editor.Panels.addButton("options", {
    id: "save-button",
    className: "fa fa-save", // FontAwesome icon class or custom class for styling
    command: "save-page", // Command to run when the button is clicked
    attributes: {
      title: "Save as draft",
    },
    // Positioning the button right after the device buttons
    order: 2, // Set the order to place it right after the existing buttons
  });

  editor.Panels.addButton("options", {
    id: "publish-button",
    className: "fa fa-paper-plane",
    command: "publish-page", // Command to run when the button is clicked
    attributes: {
      title: "Publish Page",
    },
    order: 2, // Set the order to place it right after the existing buttons
  });

  editor.Commands.add("publish-page", {
    run(editor, sender) {
      sender.set("active", 1); // turn off the button
      alert("This is your custom information!");
    },
  });
}
