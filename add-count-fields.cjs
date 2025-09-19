const fs = require('fs');
const path = require('path');

console.log('Adding count functionality to glass inventory...');

// Read current inventory
const backendPath = path.join(__dirname, 'backend', 'data', 'glasses.json');
const deploymentPath = path.join(__dirname, 'deployment-files', 'data', 'glasses.json');

const currentInventory = JSON.parse(fs.readFileSync(backendPath, 'utf8'));

console.log(`Processing ${currentInventory.length} glass entries...`);

// Add count field to each glass piece (each piece represents 1 item)
const updatedInventory = currentInventory.map(glass => {
    return {
        ...glass,
        count: 1,  // Each entry represents 1 physical piece
        availableCount: glass.reservedProject === null ? 1 : 0  // Available if not reserved
    };
});

// Save updated inventory
const jsonData = JSON.stringify(updatedInventory, null, 2);

fs.writeFileSync(backendPath, jsonData);
fs.writeFileSync(deploymentPath, jsonData);

console.log(`✅ Successfully added count fields to ALL ${updatedInventory.length} glass pieces!`);
console.log(`📁 Backend file: ${backendPath}`);
console.log(`📁 Deployment file: ${deploymentPath}`);

// Show summary statistics
let totalCount = 0;
let availableCount = 0;
const sizeStats = {};

updatedInventory.forEach(glass => {
    totalCount += glass.count;
    availableCount += glass.availableCount;
    
    const sizeKey = `${glass.width}x${glass.height}`;
    if (!sizeStats[sizeKey]) {
        sizeStats[sizeKey] = { total: 0, available: 0 };
    }
    sizeStats[sizeKey].total += glass.count;
    sizeStats[sizeKey].available += glass.availableCount;
});

console.log(`\n📊 Count Summary:`);
console.log(`  Total count: ${totalCount} pieces`);
console.log(`  Available count: ${availableCount} pieces`);
console.log(`  Reserved count: ${totalCount - availableCount} pieces`);

console.log('\n📏 Size breakdown (top 10):');
const sortedSizes = Object.entries(sizeStats)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 10);
    
sortedSizes.forEach(([size, counts]) => {
    console.log(`  ${size}: ${counts.total} total (${counts.available} available)`);
});

console.log(`\n📋 Sample entries with count:`);
const samples = updatedInventory.slice(0, 3);
console.log(JSON.stringify(samples, null, 2));