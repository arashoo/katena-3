const fs = require('fs');
const path = require('path');

console.log('Clearing ALL rack numbers from grouped inventory...');

// Read current inventory
const backendPath = path.join(__dirname, 'backend', 'data', 'glasses.json');
const deploymentPath = path.join(__dirname, 'deployment-files', 'data', 'glasses.json');

const currentInventory = JSON.parse(fs.readFileSync(backendPath, 'utf8'));

console.log(`Processing ${currentInventory.length} grouped glass entries...`);

// Count entries with rack assignments before clearing
let entriesWithRacks = 0;
let entriesWithoutRacks = 0;
let totalRackAssignments = 0;

currentInventory.forEach(glass => {
    if (glass.racks && glass.racks.length > 0) {
        entriesWithRacks++;
        totalRackAssignments += glass.racks.length;
    } else {
        entriesWithoutRacks++;
    }
});

console.log(`  Entries with rack assignments: ${entriesWithRacks}`);
console.log(`  Entries without rack assignments: ${entriesWithoutRacks}`);
console.log(`  Total rack assignments to clear: ${totalRackAssignments}`);

// Clear all rack assignments
const updatedInventory = currentInventory.map(glass => {
    return {
        ...glass,
        racks: []  // Clear all rack assignments - empty array
    };
});

// Save updated inventory
const jsonData = JSON.stringify(updatedInventory, null, 2);

fs.writeFileSync(backendPath, jsonData);
fs.writeFileSync(deploymentPath, jsonData);

console.log(`✅ Successfully cleared ALL rack assignments!`);
console.log(`📁 Backend file: ${backendPath}`);
console.log(`📁 Deployment file: ${deploymentPath}`);

// Show summary statistics
let totalCount = 0;
let totalAvailable = 0;

updatedInventory.forEach(glass => {
    totalCount += glass.count;
    totalAvailable += glass.availableCount;
});

console.log(`\n📊 Summary:`);
console.log(`  Total entries: ${updatedInventory.length}`);
console.log(`  Total pieces: ${totalCount}`);
console.log(`  Available pieces: ${totalAvailable}`);
console.log(`  All rack assignments: CLEARED`);

console.log(`\n📋 Sample entries (all racks cleared):`);
const samples = updatedInventory.slice(0, 5);
samples.forEach(sample => {
    console.log(`  ${sample.width}x${sample.height} ${sample.color}: ${sample.count} pieces, racks: ${sample.racks.length === 0 ? 'NONE' : sample.racks.join(', ')}`);
});

console.log(`\n🎯 All rack assignments cleared! Ready for new rack organization.`);