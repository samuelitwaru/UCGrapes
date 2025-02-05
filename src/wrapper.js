const fs = require('fs');
const path = require('path');

const files = [
    "classes/Clock.js",
    "classes/Locale.js",
    "classes/DataManager.js",
    "classes/EditorManager.js",
    "classes/EditorEventManager.js",
    "classes/TemplateManager.js",
    "classes/ToolboxManager.js",
    "classes/EventListenerManager.js",
    "classes/PageManager.js",
    "classes/PopupManager.js",
    "classes/ThemeManager.js",
    "classes/ToolBoxUI.js",
    "classes/UndoRedoManager.js",
    "components/ActionListComponent.js",
    "components/MappingComponent.js",
    "components/MediaComponent.js",
    "classes/ImageCropper.js",
    "utils/defaults.js",
    "utils/helper.js",
];


const outputFilePath = path.join(__dirname, 'combined.js');

function combineFiles(files, outputFilePath) {
  fs.writeFileSync(outputFilePath, ''); // Clear the output file

  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    fs.appendFileSync(outputFilePath, `// Content from ${file}\n`);
    fs.appendFileSync(outputFilePath, fileContent + '\n\n');
  });

  console.log(`All files have been combined into ${outputFilePath}`);
}

combineFiles(files, outputFilePath);