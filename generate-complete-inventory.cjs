const fs = require('fs');
const path = require('path');

console.log('Generating complete inventory from step-by-step data...');

// All the data arrays from user input
const widths = [35,42,43,45,21,23,24,25,27,28,29,31,32,33,34,34,34,34,35,35,35,35,52,36,36,38,38,39,39,39,27,28,30,31,32,33,33,33,34,35,37,38,39,39,40,40,41,44,44,46,48,49,49,49,50,50,51,52,53,54,56,21,47,20,44,46,39,21,20,21,44,45,46,48,44,48,48,50,54,30,35,36,33,34,36,44,47,51,47,68,32,44,45,46,47,34,38,40,40,42,42,44,45,48,38,39,40,42,44,46,47,45,42,40,26,31,50,51,33,34,38,39,32,36,37,42,43,20,21,36,42,42,44,44,28,31,33,34,36,36,38,39,39,40,43,45,46,47,48,48,39,41,20,51,14,14,14,14,14,24,38,20,24,26,28,43,44,45,48,28,37,40,40,48,49,50,22,24,26,26,26,26,32,49,35,36,38,39,40,41,42,44,35,47,47,50,56,42,43,48,34,42,34,42,56,34,38,42,42,33,30,36,37,41,46,55,57,18,28,28,30,30,32,33,34,36,37,41,43,44,45,46,47,48,49,50,51,54,55,58,28,47,35,40,41,42,44,45,42,48,42,40,45,47,40,45,46,56,45,45,47,52,36,37,40,40,41,41,44,45,45,46,53,56,60,60,18,20,41,42,43,44,45,35,35,42,37,41,42,43,44,45,47,52,44,45,52,55,55,55,43,49,34,43,43,43,44,46,46,47,47,48,48,52,52,55,13,16,18,18,22,30,31,31.5,32,33,34,34,35,35,36,36,37,37,37,38,38,38,38,38,38.5,39,40,40,40,40,40,40,41,41,41,41,41,42,42,42,42,42,43,43,43,43,44,44,46,46,46,48,48,48,50,52,54];

const heights = [36,36,36,36,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,39,68,68,68,68,68,68,68,40,40,40,40,40,40,50,40,40,39,39,40,52,40,48,40,39,39,40,40,40,52,52,40,52,40,40,40,52,52,52,52,39,52,52,52,40,52,14,14,14,14,14,52,42,46,49,44,44,36,39,39,39,39,36,39,39,39,39,39,39,39,39,39,39,26,26,26,52,26,26,26,26,26,39,39,39,39,39,39,39,39,39,39,39,39,26,39,52,52,39,52,44,36,36,36,36,52,52,36,39,39,26,39,39,39,52,39,39,52,52,39,55,39,52,52,52,52,52,52,39,39,39,39,36,43,42,40,34,52,39,39,39,39,39,24,24,34,24,39,36,68,68,39,39,39,42,44,40,43,48,44,44,39,39,52,52,52,35,35,35,35,44,52,39,52,39,39,39,39,39,68,14,68,39,52,39,52,68,39,34,34,34,34,34,34,34,34,39,34,39,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,34,39,39,34,39,34,34,39,34,39,39,39,39,34,39,39,30,30,30,30,30,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,68,68,68,68,68,68,68,68,68,68,68,68,68,38,39,39,39,43,39,39,39,39,39,39,52,39,39,39,39,39,52,52,39,42,52,32,39,39,39,39,52,39,38,52,38,22,52,52,52,39,22,52,39,39,52,22,39,52,39,52,52,39,39,52,52,54,52,52,39,52];

const colors = ["Acid","Acid","Acid","Acid","div","acid_div","acid_div","acid_div","div","DIV","DIV","DIV","acid_div","acid_div","acid_div","acid_div","Acid-Div","clear","acid_div","acid_div","clear","DIV","acid_div","acid_div","DIV","acid_div","DIV","acid_div","acid_div","Acid-Div","Blue","Blue","Blue","Blue","Blue","Blue","blue","Blue","Blue","Blue","Blue","Blue","Blue","Blue","blue","Blue","Blue","blue","blue","Blue","Blue","Blue","blue","Blue","Blue","Blue","Blue","Blue","Blue","Blue","Blue","bronze","brown","brown","brown","brown","brown","brown","brown","brown","brown","brown","brown","claire","clear","clear","clear","clear","clear","clear","Clear","Clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","Clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","Clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","acid_div","clear","Acid-Div","clear","clear","clear","clear","Div","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear","acid_div","acid_div","Div","clear","Acid-Div","DIV","acid_div","DIV","acid_div","DIV","acid_div","acid_div","acid_div","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray","Gray"];

const quantities = [4,4,40,40,79,1,3,1,5,2,4,4,4,2,17,4,67,3,3,2,1,4,1,1,1,3,1,11,6,1,25,5,10,5,2,1,2,4,1,1,2,1,2,28,6,2,43,1,1,15,2,8,1,1,1,3,1,3,4,3,2,14,32,2,1,1,7,30,14,5,31,3,21,82,2,6,2,1,1,16,12,2,38,2,1,3,2,12,10,12,6,1,2,88,84,3,2,20,10,54,2,6,2,5,53,43,8,14,30,4,1,123,259,91,25,17,2,97,3,1,37,1,41,8,6,20,20,20,22,1,2,4,17,25,1,1,2,1,1,2,4,1,4,1,3,3,16,80,84,43,44,38,8,9,5,2,1,1,1,2,219,6,15,17,19,2,17,3,14,6,4,1,1,71,14,2,4,1,1,1,1,4,1,11,56,2,7,3,10,12,23,20,1,1,1,1,3,63,1,10,47,4,13,12,16,2,2,1,1,150,6,8,4,2,71,6,1,2,17,1,37,1,1,3,2,1,1,1,10,1,23,2,4,14,2,4,1,4,4,2,30,100,67,20,20,5,20,10,47,67,128,64,18,32,128,71,2,32,18,48,32,20,8,12,1,2,4,2,4,11,61,4,4,7,2,4,46,18,4,22,8,14,4,84,56,25,92,93,23,105,11,74,3,101,10,2,101,95,65,30,40,40,150,2,10,1,1,6,1,1,1,3,1,1,10,1,2,5,1,5,1,1,5,6,9,3,5,1,1,3,3,14,2,3,3,2,6,2,2,1,3,2,7,3,11,6,1,2,1,2,1,1,3,1,13,6,8,14,3,5,1,1,33,3,1,4,5,11,3,4,3,2];

const projects = ["Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","Available","MARLSTONE X77","MARLSTONE X77","MARLSTONE X77","MARLSTONE X77","ROCKWELL X78","P-003","G-2025","P-003","ROCKWELL X78","A-684","A-684","A-684","QUEEN X66","P-003","P-003","QUEEN X66","P-014","P-013","B-004","P-003","P-013","A-684","P-003","P-003","A-684","P-013","A-684","B-003","X65","Z-384","G-052","G-052","G-052","G-052","G-052","A-653","P-001","P-022","P-022","G-052","G-052","P-022","A-653","P-022","P-001","P-022","G-052","P-001","P-022","P-022","P-022","A-653","P-009","P-022","A-653","P-022","P-022","P-022","A-653","A-653","A-653","G-2025","G-056","P-009","P-009","P-009","P-022","G-044","Z-430","Z-430","Z-430","Z-430","Z-430","G-084","1010","1010","1010","1010","1010","9-039","9-039","9-039","A-13","A-13","A-13","B-001","B-001","B-001","B-002","B-002","B-004","B-004","B-004","B-025","B-309","B-5","B-5","B-5","B-5","B-5","B-5","B-5","B-5","B-5","C-058","C-058","C-058","C-058","C-058","C-058","C-058","G-033","G-034","G-037","G-040","G-040","G-040","G-042","G-043","G-043","G-043","G-043","G-056","G-066","G-066","G-066","G-066","G-075","G-075","G-075","G-075","G-078","G-078","G-078","G-079","G-079","G-079","G-079","G-079","G-079","G-079","G-079","G-079","G-079","G-079","G-079","G-080","G-082","G-083","G-085","G-087","G-087","G-088","G-092","G-2025","G-2025","G-2025","G-2025","G-2025","G-2025","P-000","P-0006","P-0006","P-0006","P-0006","P-0006","P-0006","P-0006","P-0006","P-001","P-001","P-001","P-022","P-002","P-002","P-002","P-003","P-003","P-003","P-003","P-003","P-003","P-003","P-003","P-004","P-008","P-008","P-008","P-008","P-008","P-008","P-008","P-009","P-009","P-009","P-009","P-009","P-010","P-010","P-010","P-012","P-013","P-013","Z-384","P-013","P-018","P-018","P-018","P-018","STOCK","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","QUEEN","WESTMOUNT","WESTMOUNT","WESTMOUNT","WESTMOUNT","WESTMOUNT","WESTMOUNT","WESTMOUNT","WESTMOUNT","WESTMOUNT","WESTMOUNT","WESTMOUNT","WESTMOUNT","WESTMOUNT","WESTMOUNT","MARLSTONE","MARLSTONE","X78","X78","X78","X78","X78","ROCKWELL","ROCKWELL","ROCKWELL","ROCKWELL","X82","X82","ROCKWELL","ROCKWELL","ROCKWELL","ROCKWELL","ROCKWELL","ROCKWELL","ROCKWELL","ROCKWELL","STOCK","X88","STOCK","STOCK","STOCK","STOCK","P-013","QUEEN","P-018","P-001","Z-384","A-684","P-013","A-684","B-003","A-684","P-013","X65","P-013","G-2025","G-079","G-2025","P-009","P-009","B-032","B-032","B-032","B-032","B-032","B-032","P-009","9-039","B-032","B-032","G-089","B-032","P-009","P-022","B-032","G-079","G-079","G-079","G-089","G-079","P-022","9-039","A-676","B-032","G-079","P-009","P-018","9-039","G-075","P-008","P-009","P-018","9-039","A-676","B-032","G-088","G-2025","9-039","G-088","P-009","P-018","P-009","P-009","B-032","G-079","P-009","A-676","P-009","P-009","G-2025","P-010","P-009"];

// Standardize colors
function standardizeColor(color) {
    const colorMap = {
        'Acid': 'Acid Etched',
        'acid_div': 'Acid Etched',
        'DIV': 'Acid Etched',
        'Acid-Div': 'Acid Etched',
        'div': 'Acid Etched',
        'Div': 'Acid Etched',
        'clear': 'Clear',
        'Clear': 'Clear',
        'claire': 'Clear',
        'Blue': 'Blue',
        'blue': 'Blue',
        'brown': 'Brown',
        'bronze': 'Bronze',
        'Gray': 'Gray'
    };
    return colorMap[color] || color;
}

// Generate individual glass pieces
let glassEntries = [];
let idCounter = 0;

for (let i = 0; i < widths.length; i++) {
    const width = widths[i];
    const height = heights[i];
    const color = standardizeColor(colors[i]);
    const quantity = quantities[i];
    const project = projects[i];
    
    // Create individual entries for each piece
    for (let j = 0; j < quantity; j++) {
        const glass = {
            id: `${width}x${height}_${color.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${idCounter++}`,
            width: width,
            height: height,
            color: color,
            heatSoaked: color === 'Acid Etched', // Acid etched glass is heat soaked
            reservedProject: project === 'Available' ? null : project
        };
        glassEntries.push(glass);
    }
}

console.log(`Generated ${glassEntries.length} individual glass entries`);

// Save to both backend and deployment folders
const backendPath = path.join(__dirname, 'backend', 'data', 'glasses.json');
const deploymentPath = path.join(__dirname, 'deployment-files', 'data', 'glasses.json');

const jsonData = JSON.stringify(glassEntries, null, 2);

fs.writeFileSync(backendPath, jsonData);
fs.writeFileSync(deploymentPath, jsonData);

console.log(`✅ Successfully created glasses.json with ${glassEntries.length} glass entries!`);
console.log(`📁 Backend file: ${backendPath}`);
console.log(`📁 Deployment file: ${deploymentPath}`);

// Show summary statistics
const colorStats = {};
const projectStats = {};

glassEntries.forEach(glass => {
    colorStats[glass.color] = (colorStats[glass.color] || 0) + 1;
    const project = glass.reservedProject || 'Available';
    projectStats[project] = (projectStats[project] || 0) + 1;
});

console.log('\n🎨 Color breakdown:');
Object.entries(colorStats).forEach(([color, count]) => {
    console.log(`  ${color}: ${count} pieces`);
});

console.log('\n📊 Project allocation (top 15):');
const sortedProjects = Object.entries(projectStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15);
    
sortedProjects.forEach(([project, count]) => {
    console.log(`  ${project}: ${count} pieces`);
});

console.log(`\n📋 Sample entries:`);
console.log(JSON.stringify(glassEntries.slice(0, 3), null, 2));