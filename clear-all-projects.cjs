const fs = require('fs');
const path = require('path');

console.log('Clearing ALL project assignments - making all glass pieces available...');

// Read current inventory
const backendPath = path.join(__dirname, 'backend', 'data', 'glasses.json');
const deploymentPath = path.join(__dirname, 'deployment-files', 'data', 'glasses.json');

const currentInventory = JSON.parse(fs.readFileSync(backendPath, 'utf8'));

console.log(`Processing ${currentInventory.length} glass entries...`);

// Count current project assignments before clearing
let previouslyAssigned = 0;
let alreadyAvailable = 0;

currentInventory.forEach(glass => {
    if (glass.reservedCount > 0 || (glass.reservedProjects && glass.reservedProjects.length > 0)) {
        previouslyAssigned++;
    } else {
        alreadyAvailable++;
    }
});

console.log(`  Previously assigned to projects: ${previouslyAssigned}`);
console.log(`  Already available: ${alreadyAvailable}`);

// Clear all project assignments - make everything available
const updatedInventory = currentInventory.map(glass => {
    return {
        ...glass,
        reservedProject: null,  // Clear all project assignments
        reservedProjects: [],   // Clear reserved projects array
        availableCount: glass.count,  // All pieces are now available
        reservedCount: 0        // No pieces are reserved
        // Keep racks array as they are for physical location tracking
    };
});

// Save updated inventory
const jsonData = JSON.stringify(updatedInventory, null, 2);

fs.writeFileSync(backendPath, jsonData);
fs.writeFileSync(deploymentPath, jsonData);

console.log(`✅ Successfully cleared ALL project assignments!`);
console.log(`📁 Backend file: ${backendPath}`);
console.log(`📁 Deployment file: ${deploymentPath}`);

// Show summary statistics
const rackStats = {};
let totalAvailable = 0;
let totalCount = 0;

updatedInventory.forEach(glass => {
    totalCount += glass.count;
    totalAvailable += glass.availableCount;
    
    // Count pieces per rack (estimate)
    if (glass.racks && glass.racks.length > 0) {
        glass.racks.forEach(rack => {
            rackStats[rack] = (rackStats[rack] || 0) + Math.ceil(glass.count / glass.racks.length);
        });
    } else {
        rackStats['No rack'] = (rackStats['No rack'] || 0) + glass.count;
    }
});

console.log(`\n📊 Summary:`);
console.log(`  Total entries: ${updatedInventory.length}`);
console.log(`  Total pieces: ${totalCount}`);
console.log(`  Available pieces: ${totalAvailable}`);
console.log(`  Project-assigned pieces: ${totalCount - totalAvailable}`);
console.log(`  Total unique racks: ${Object.keys(rackStats).length}`);

console.log('\n🏷️ All pieces now available with rack tracking:');
const sortedRacks = Object.entries(rackStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15);
    
sortedRacks.forEach(([rack, count]) => {
    console.log(`  ${rack}: ${count} pieces (available)`);
});

console.log(`\n📋 Sample entries (all now available):`);
const samples = updatedInventory.slice(0, 5);
console.log(JSON.stringify(samples, null, 2));

console.log(`\n🎯 All ${totalCount} glass pieces (${updatedInventory.length} grouped entries) are now AVAILABLE and ready for new project assignments!`);