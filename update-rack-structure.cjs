const fs = require('fs');
const path = require('path');

console.log('Updating inventory structure: Moving rack numbers to rack field...');

// Read current inventory
const backendPath = path.join(__dirname, 'backend', 'data', 'glasses.json');
const deploymentPath = path.join(__dirname, 'deployment-files', 'data', 'glasses.json');

const currentInventory = JSON.parse(fs.readFileSync(backendPath, 'utf8'));

console.log(`Processing ${currentInventory.length} glass entries...`);

// Map rack numbers to actual project names
const rackToProjectMap = {
    // Rack codes to project names mapping
    'X77': 'MARLSTONE X77',
    'X78': 'ROCKWELL X78', 
    'X66': 'QUEEN X66',
    'X65': 'Project X65',
    'X67': 'Project X67',
    'X68': 'Project X68',
    'X69': 'Project X69',
    'X70': 'Project X70',
    'X71': 'Project X71',
    'X72': 'Project X72',
    'X73': 'Project X73',
    'X74': 'Project X74',
    'X75': 'Project X75',
    'X76': 'Project X76',
    'X79': 'Project X79',
    'X80': 'Project X80',
    'X81': 'Project X81',
    'X82': 'Project X82',
    'X83': 'Project X83',
    'X84': 'Project X84',
    'X85': 'Project X85',
    'X86': 'Project X86',
    'X87': 'Project X87',
    'X88': 'Project X88',
    'X89': 'Project X89',
    'X91': 'Project X91',
    'X100': 'Project X100',
    
    // G-series projects
    'G-033': 'Glass Project 033',
    'G-034': 'Glass Project 034',
    'G-037': 'Glass Project 037',
    'G-040': 'Glass Project 040',
    'G-042': 'Glass Project 042',
    'G-043': 'Glass Project 043',
    'G-044': 'Glass Project 044',
    'G-052': 'Glass Project 052',
    'G-056': 'Glass Project 056',
    'G-066': 'Glass Project 066',
    'G-075': 'Glass Project 075',
    'G-078': 'Glass Project 078',
    'G-079': 'Glass Project 079',
    'G-080': 'Glass Project 080',
    'G-082': 'Glass Project 082',
    'G-083': 'Glass Project 083',
    'G-084': 'Glass Project 084',
    'G-085': 'Glass Project 085',
    'G-087': 'Glass Project 087',
    'G-088': 'Glass Project 088',
    'G-089': 'Glass Project 089',
    'G-092': 'Glass Project 092',
    'G-2025': 'Glass Project 2025',
    
    // P-series projects
    'P-000': 'Project 000',
    'P-001': 'Project 001',
    'P-002': 'Project 002',
    'P-003': 'Project 003',
    'P-004': 'Project 004',
    'P-008': 'Project 008',
    'P-009': 'Project 009',
    'P-010': 'Project 010',
    'P-012': 'Project 012',
    'P-013': 'Project 013',
    'P-014': 'Project 014',
    'P-018': 'Project 018',
    'P-022': 'Project 022',
    'P-0006': 'Project 0006',
    
    // A-series projects
    'A-13': 'Architecture Project 13',
    'A-653': 'Architecture Project 653',
    'A-676': 'Architecture Project 676',
    'A-684': 'Architecture Project 684',
    
    // B-series projects
    'B-001': 'Building Project 001',
    'B-002': 'Building Project 002',
    'B-003': 'Building Project 003',
    'B-004': 'Building Project 004',
    'B-025': 'Building Project 025',
    'B-030': 'Building Project 030',
    'B-032': 'Building Project 032',
    'B-309': 'Building Project 309',
    'B-5': 'Building Project 5',
    
    // C-series projects
    'C-055': 'Commercial Project 055',
    'C-058': 'Commercial Project 058',
    
    // Z-series projects
    'Z-384': 'Zone Project 384',
    'Z-430': 'Zone Project 430',
    
    // Other projects
    '1010': 'Project 1010',
    '9-039': 'Project 9-039',
    'STOCK': 'Stock Inventory',
    'QUEEN': 'Queen Project',
    'MARLSTONE': 'Marlstone Project',
    'WESTMOUNT': 'Westmount Project',
    'ROCKWELL': 'Rockwell Project'
};

// Process each glass entry
const updatedInventory = currentInventory.map(glass => {
    const currentReservedProject = glass.reservedProject;
    
    if (currentReservedProject === null) {
        // Available stock - no rack, no project
        return {
            ...glass,
            rack: null,
            reservedProject: null
        };
    }
    
    // Check if the current reservedProject is actually a rack code
    if (rackToProjectMap[currentReservedProject]) {
        return {
            ...glass,
            rack: currentReservedProject,
            reservedProject: rackToProjectMap[currentReservedProject]
        };
    } else {
        // It's already a project name, keep it in reservedProject, no specific rack
        return {
            ...glass,
            rack: null,
            reservedProject: currentReservedProject
        };
    }
});

// Save updated inventory
const jsonData = JSON.stringify(updatedInventory, null, 2);

fs.writeFileSync(backendPath, jsonData);
fs.writeFileSync(deploymentPath, jsonData);

console.log(`✅ Successfully updated inventory structure!`);
console.log(`📁 Backend file: ${backendPath}`);
console.log(`📁 Deployment file: ${deploymentPath}`);

// Show summary statistics
const rackStats = {};
const projectStats = {};

updatedInventory.forEach(glass => {
    if (glass.rack) {
        rackStats[glass.rack] = (rackStats[glass.rack] || 0) + 1;
    }
    
    const project = glass.reservedProject || 'Available';
    projectStats[project] = (projectStats[project] || 0) + 1;
});

console.log('\n🏷️ Rack breakdown (top 15):');
const sortedRacks = Object.entries(rackStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15);
    
sortedRacks.forEach(([rack, count]) => {
    console.log(`  ${rack}: ${count} pieces`);
});

console.log('\n📊 Project breakdown (top 15):');
const sortedProjects = Object.entries(projectStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15);
    
sortedProjects.forEach(([project, count]) => {
    console.log(`  ${project}: ${count} pieces`);
});

console.log(`\n📋 Sample updated entries:`);
const samplesWithRacks = updatedInventory.filter(g => g.rack !== null).slice(0, 3);
const samplesAvailable = updatedInventory.filter(g => g.rack === null && g.reservedProject === null).slice(0, 2);

console.log('With racks:');
console.log(JSON.stringify(samplesWithRacks, null, 2));
console.log('\nAvailable stock:');
console.log(JSON.stringify(samplesAvailable, null, 2));