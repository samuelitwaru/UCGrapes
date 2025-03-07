import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as UglifyJS from 'uglify-js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const files = [
    "/ui/ToolboxStructure.js",
    "/core/toolbox/ToolboxManager.js"
];
const outputFilePath = path.join(__dirname, 'bundle.js');
function combineFiles(files, outputFilePath) {
    fs.writeFileSync(outputFilePath, ''); // Clear the output file
    files.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
            console.warn(`Warning: File not found - ${file}`);
            return;
        }
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        fs.appendFileSync(outputFilePath, `// Content from ${file}\n`);
        fs.appendFileSync(outputFilePath, fileContent + '\n\n');
    });
    console.log(`All files have been combined into ${outputFilePath}`);
}
function minifyFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const minifiedContent = UglifyJS.minify(fileContent);
    if (minifiedContent.error) {
        console.error(`Error minifying ${filePath}:`, minifiedContent.error);
        return;
    }
    fs.writeFileSync(filePath, minifiedContent.code, 'utf-8');
    console.log(`File ${filePath} has been minified.`);
}
combineFiles(files, outputFilePath);
// Uncomment to enable minification
// minifyFile(outputFilePath);
//# sourceMappingURL=wrapper.js.map