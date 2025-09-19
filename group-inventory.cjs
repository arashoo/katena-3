const fs = require('fs');
const path = require('path');

console.log('Converting individual pieces to grouped inventory...');

// Read current inventory
const backendPath = path.join(__dirname, 'backend', 'data', 'glasses.json');
const deploymentPath = path.join(__dirname, 'deployment-files', 'data', 'glasses.json');

const currentInventory = JSON.parse(fs.readFileSync(backendPath, 'utf8'));

console.log(`Processing ${currentInventory.length} individual glass entries...`);

// Group identical pieces by width, height, color, heatSoaked (ignore rack for grouping)
const groupedMap = new Map();

currentInventory.forEach(glass => {
    // Create a key for grouping identical pieces (without rack)
    const key = `${glass.width}_${glass.height}_${glass.color}_${glass.heatSoaked}`;
    
    if (groupedMap.has(key)) {
        const existing = groupedMap.get(key);
        existing.count += 1;
        // Update available count based on reservation status
        if (glass.reservedProject === null) {
            existing.availableCount += 1;
        } else {
            existing.reservedCount += 1;
        }
        
        // Collect all racks where this glass type is stored
        if (!existing.racks.includes(glass.rack)) {
            existing.racks.push(glass.rack);
        }
        
        // Collect reserved projects
        if (glass.reservedProject && !existing.reservedProjects.includes(glass.reservedProject)) {
            existing.reservedProjects.push(glass.reservedProject);
        }
    } else {
        // Create new grouped entry
        groupedMap.set(key, {
            id: `${glass.width}x${glass.height}_${glass.color.toLowerCase().replace(/\s+/g, '_')}_group`,
            width: glass.width,
            height: glass.height,
            color: glass.color,
            heatSoaked: glass.heatSoaked,
            racks: [glass.rack], // Array of racks where this glass type is stored
            count: 1,
            availableCount: glass.reservedProject === null ? 1 : 0,
            reservedCount: glass.reservedProject === null ? 0 : 1,
            reservedProjects: glass.reservedProject ? [glass.reservedProject] : []
        });
    }
});

// Convert map to array
const groupedInventory = Array.from(groupedMap.values());

console.log(`✅ Grouped ${currentInventory.length} individual pieces into ${groupedInventory.length} grouped entries!`);

// Save updated inventory
const jsonData = JSON.stringify(groupedInventory, null, 2);

fs.writeFileSync(backendPath, jsonData);
fs.writeFileSync(deploymentPath, jsonData);

console.log(`📁 Backend file: ${backendPath}`);
console.log(`📁 Deployment file: ${deploymentPath}`);

// Show summary statistics
let totalCount = 0;
let totalAvailable = 0;
let totalReserved = 0;
const sizeStats = {};
const rackStats = {};

groupedInventory.forEach(glass => {
    totalCount += glass.count;
    totalAvailable += glass.availableCount;
    totalReserved += glass.reservedCount;
    
    const sizeKey = `${glass.width}x${glass.height}`;
    if (!sizeStats[sizeKey]) {
        sizeStats[sizeKey] = { total: 0, available: 0 };
    }
    sizeStats[sizeKey].total += glass.count;
    sizeStats[sizeKey].available += glass.availableCount;
    
    // Count pieces in each rack
    glass.racks.forEach(rack => {
        if (!rackStats[rack]) {
            rackStats[rack] = { entries: 0, totalPieces: 0 };
        }
        rackStats[rack].entries += 1;
        // Estimate pieces per rack (divided equally among racks)
        rackStats[rack].totalPieces += Math.ceil(glass.count / glass.racks.length);
    });
});

console.log(`\n📊 Inventory Summary:`);
console.log(`  Total pieces: ${totalCount}`);
console.log(`  Available pieces: ${totalAvailable}`);
console.log(`  Reserved pieces: ${totalReserved}`);
console.log(`  Grouped entries: ${groupedInventory.length}`);
console.log(`  Compression ratio: ${(currentInventory.length / groupedInventory.length).toFixed(1)}:1`);

console.log('\n📏 Top 10 sizes by quantity:');
const sortedSizes = Object.entries(sizeStats)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 10);
    
sortedSizes.forEach(([size, counts]) => {
    console.log(`  ${size}: ${counts.total} total (${counts.available} available)`);
});

console.log('\n🗂️ Top 10 racks by glass type entries:');
const sortedRacks = Object.entries(rackStats)
    .sort(([,a], [,b]) => b.totalPieces - a.totalPieces)
    .slice(0, 10);
    
sortedRacks.forEach(([rack, counts]) => {
    console.log(`  ${rack}: ${counts.entries} glass types (~${counts.totalPieces} pieces)`);
});

console.log(`\n📋 Sample grouped entries:`);
const samples = groupedInventory.slice(0, 3);
samples.forEach(sample => {
    console.log(`  ${sample.width}x${sample.height} ${sample.color}: ${sample.count} pieces (${sample.availableCount} available) in racks: ${sample.racks.join(', ')}`);
});