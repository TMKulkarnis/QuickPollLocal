import fs from 'fs';
import path from 'path';
import { transformSync } from 'esbuild';

try {
    const json = JSON.parse(fs.readFileSync('map.json', 'utf8'));
    const file = json.files[0];
    let content = file.content;

    // Remove base CSS import if it conflicts or is not needed (we add styles to index.css anyway)
    content = content.replace("import 'maplibre-gl/dist/maplibre-gl.css';", "");

    // Transpile TSX to JSX using esbuild
    const result = transformSync(content, {
        loader: 'tsx',
        format: 'esm',
        target: 'es2020',
        jsx: 'automatic' // or 'preserve' if using @vitejs/plugin-react which handles JSX
    });

    const targetDir = path.join(process.cwd(), 'src/components/ui');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    fs.writeFileSync(path.join(targetDir, 'map.jsx'), result.code);
    console.log("Created src/components/ui/map.jsx (Transpiled via esbuild)");

    // 2. Add CSS
    if (json.css && json.css["@layer base"]) {
        const cssRules = json.css["@layer base"];
        let cssString = "\n/* MapCN Styles */\n@layer base {\n";
        for (const [selector, rules] of Object.entries(cssRules)) {
            cssString += `  ${selector} {\n`;
            for (const [prop, val] of Object.entries(rules)) {
                if (prop.startsWith('@apply')) {
                    // Check if value is object (empty) or string? 
                    // The JSON had: "@apply ...": {} 
                    const key = prop.replace("!", " !important"); // Handle ! modifier if mapped differently?
                    // Actually MapCN usually has classes as keys.
                    // Let's just output the property as is, usually it's `@apply class;`
                    cssString += `    ${key};\n`;
                } else {
                    cssString += `    ${prop}: ${val};\n`;
                }
            }
            cssString += "  }\n";
        }
        cssString += "}\n";

        // Append only if not already there to avoid duplicates on re-run
        const indexCssPath = path.join(process.cwd(), 'src/index.css');
        const indexCssContent = fs.readFileSync(indexCssPath, 'utf8');
        if (!indexCssContent.includes("/* MapCN Styles */")) {
            fs.appendFileSync(indexCssPath, cssString);
            console.log("Appended styles to index.css");
        } else {
            console.log("Styles already present in index.css");
        }
    }

} catch (e) {
    console.error("Installation failed:", e);
}
