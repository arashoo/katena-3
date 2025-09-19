const fs = require('fs');
const path = require('path');

console.log('Assigning rack numbers to ALL glass pieces...');

// Read current inventory
const backendPath = path.join(__dirname, 'backend', 'data', 'glasses.json');
const deploymentPath = path.join(__dirname, 'deployment-files', 'data', 'glasses.json');

const currentInventory = JSON.parse(fs.readFileSync(backendPath, 'utf8'));

console.log(`Processing ${currentInventory.length} glass entries...`);

// Generate available rack numbers for pieces without racks
let availableRackCounter = 1;

// Process each glass entry
const updatedInventory = currentInventory.map(glass => {
    if (glass.rack === null) {
        // Assign a rack number for available stock
        const rackNumber = `R-${String(availableRackCounter).padStart(3, '0')}`;
        availableRackCounter++;
        
        return {
            ...glass,
            rack: rackNumber
        };
    } else {
        // Keep existing rack assignment
        return glass;
    }
});

// Save updated inventory
const jsonData = JSON.stringify(updatedInventory, null, 2);

fs.writeFileSync(backendPath, jsonData);
fs.writeFileSync(deploymentPath, jsonData);

console.log(`✅ Successfully assigned rack numbers to ALL ${updatedInventory.length} glass pieces!`);
console.log(`📁 Backend file: ${backendPath}`);
console.log(`📁 Deployment file: ${deploymentPath}`);

// Show summary statistics
const rackStats = {};
const projectStats = {};
let availableWithRacks = 0;
let projectAssignedWithRacks = 0;

updatedInventory.forEach(glass => {
    rackStats[glass.rack] = (rackStats[glass.rack] || 0) + 1;
    
    if (glass.reservedProject === null) {
        availableWithRacks++;
    } else {
        projectAssignedWithRacks++;
    }
    
    const project = glass.reservedProject || 'Available Stock';
    projectStats[project] = (projectStats[project] || 0) + 1;
});

console.log(`\n📊 Summary:`);
console.log(`  Total pieces: ${updatedInventory.length}`);
console.log(`  Available stock (with racks): ${availableWithRacks}`);
console.log(`  Project-assigned (with racks): ${projectAssignedWithRacks}`);
console.log(`  Total unique racks: ${Object.keys(rackStats).length}`);

console.log('\n🏷️ Rack breakdown (sample):');
const sortedRacks = Object.entries(rackStats)
    .sort(([,a], [,b]) => b - a);

// Show first 10 project racks and first 10 available racks
const projectRacks = sortedRacks.filter(([rack]) => !rack.startsWith('R-')).slice(0, 10);
const availableRacks = sortedRacks.filter(([rack]) => rack.startsWith('R-')).slice(0, 10);

console.log('  Project racks (top 10):');
projectRacks.forEach(([rack, count]) => {
    console.log(`    ${rack}: ${count} pieces`);
});

console.log('  Available racks (first 10):');
availableRacks.forEach(([rack, count]) => {
    console.log(`    ${rack}: ${count} pieces`);
});

console.log(`\n📋 Sample updated entries:`);
const samplesAvailable = updatedInventory.filter(g => g.reservedProject === null).slice(0, 3);
const samplesProject = updatedInventory.filter(g => g.reservedProject !== null).slice(0, 2);

console.log('Available stock (now with racks):');
console.log(JSON.stringify(samplesAvailable, null, 2));
console.log('\nProject-assigned (with racks):');
console.log(JSON.stringify(samplesProject, null, 2));