"use strict";
class TemplateWrapper {
    constructor(templates) {
        this.templateList = document.createElement("div");
        this.templateList.id = "page-templates";
        templates.forEach((template, index) => {
            const templateWrapper = document.createElement("div");
            templateWrapper.className = "page-template-wrapper";
            const templateBlockNumber = document.createElement("div");
            templateBlockNumber.className = "page-template-block-number";
            const templateBlock = document.createElement("div");
            templateBlock.className = "page-template-block";
            templateBlock.title = "Click to select template";
            const div = document.createElement("div");
            const img = document.createElement("img");
            img.style.width = "100%";
            img.style.height = "100%";
            img.src = template.image;
            div.appendChild(img);
            templateBlock.appendChild(div);
            templateBlockNumber.innerHTML = `${index + 1}`;
            templateWrapper.appendChild(templateBlockNumber);
            templateWrapper.appendChild(templateBlock);
            this.templateList.appendChild(templateWrapper);
        });
    }
    render(container) {
        container.appendChild(this.templateList);
    }
}
//   const templates = [
//       { image: "https://example.com/template1.jpg" },
//       { image: "https://example.com/template2.jpg" },
//       { image: "https://example.com/template3.jpg" }
//     ];
//     // Create a TemplateWrapper instance with a list of templates
//     const templateWrapper = new TemplateWrapper(templates);
//     templateWrapper.render(document.body);
//# sourceMappingURL=TemplateWrapper.js.map