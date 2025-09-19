const fs = require('fs');
const path = require('path');

console.log('Updating rack numbers with correct sequence...');

// Your rack sequence from top to bottom
const correctRackSequence = ["X77","X77","X77","X77","X78","P-003","G-2025","P-003","X78","A-684","A-684","A-684","X66","P-003","P-003","X66","P-014","P-013","B-004","P-003","P-013","A-684","P-003","P-003","A-684","P-013","A-684","B-003","X65","Z-384","G-052","G-052","G-052","G-052","G-052","A-653","P-001","P-022","P-022","G-052","G-052","P-022","A-653","P-022","P-001","P-022","G-052","P-001","P-022","P-022","P-022","A-653","P-009","P-022","A-653","P-022","P-022","P-022","A-653","A-653","A-653","G-2025","G-056","P-009","P-009","P-009","P-022","G-044","Z-430","Z-430","Z-430","Z-430","Z-430","G-084","1010","1010","1010","1010","1010","9-039","9-039","9-039","A-13","A-13","A-13","B-001","B-001","B-001","B-002","B-002","B-004","B-004","B-004","B-025","B-309","B-5","B-5","B-5","B-5","B-5","B-5","B-5","B-5","B-5","C-058","C-058","C-058","C-058","C-058","C-058","C-058","G-033","G-034","G-037","G-040","G-040","G-040","G-042","G-043","G-043","G-043","G-043","G-056","G-066","G-066","G-066","G-066","G-075","G-075","G-075","G-075","G-078","G-078","G-078","G-079","G-079","G-079","G-079","G-079","G-079","G-079","G-079","G-079","G-079","G-079","G-079","G-080","G-082","G-083","G-085","G-087","G-087","G-088","G-092","G-2025","G-2025","G-2025","G-2025","G-2025","G-2025","P-000","P-0006","P-0006","P-0006","P-0006","P-0006","P-0006","P-0006","P-0006","P-001","P-001","P-001","P-022","P-002","P-002","P-002","P-003","P-003","P-003","P-003","P-003","P-003","P-003","P-003","P-004","P-008","P-008","P-008","P-008","P-008","P-008","P-008","P-009","P-009","P-009","P-009","P-009","P-010","P-010","P-010","P-012","P-013","P-013","Z-384","P-013","P-018","P-018","P-018","P-018","X100","X66","X66","X66","X66","X66","X66","X66","X67","X67","X67","X67","X67","X67","X67","X67","X67","X67","X67","X67","X67","X67","X67","X67","X67","X67","X67","X67","X67","X67","X67","X67","X68","X69","X69","X69","X69","X69","X69","X70","X70","X71","X72","X72","X72","X73","X75","X75","X74","X74","X75","X75","X75","X76","X76","X76","X76","X76","X76","X76","X76","X76","X76","X76","X76","X76","X76","X77","X77","X78","X78","X78","X78","X78","X79","X80","X81","X81","X82","X82","X83","X84","X84","X84","X85","X86","X86","X86","X87","X88","X89","X89","X89","X91","P-013","X66","P-018","P-001","Z-384","A-684","P-013","A-684","B-003","A-684","P-013","X65","P-013","G-2025","G-079","G-2025","P-009","P-009","B-032","B-032","B-032","B-032","B-032","B-032","P-009","9-039","B-032","B-032","G-089","B-032","P-009","P-022","B-032","G-079","G-079","G-079","G-089","G-079","P-022","9-039","A-676","B-032","G-079","P-009","P-018","9-039","G-075","P-008","P-009","P-018","9-039","A-676","B-032","G-088","G-2025","9-039","G-088","P-009","P-018","P-009","P-009","B-032","G-079","P-009","A-676","P-009","P-009","G-2025","P-010","P-009"];

// Read current inventory
const backendPath = path.join(__dirname, 'backend', 'data', 'glasses.json');
const deploymentPath = path.join(__dirname, 'deployment-files', 'data', 'glasses.json');

const currentInventory = JSON.parse(fs.readFileSync(backendPath, 'utf8'));

console.log(`Processing ${currentInventory.length} glass entries...`);
console.log(`Rack sequence provided: ${correctRackSequence.length} rack assignments`);

if (currentInventory.length !== correctRackSequence.length) {
    console.log(`⚠️ WARNING: Inventory count (${currentInventory.length}) does not match rack sequence count (${correctRackSequence.length})`);
    console.log('Will update as many as possible...');
}

// Update rack numbers in sequence
const updatedInventory = currentInventory.map((glass, index) => {
    const newRack = index < correctRackSequence.length ? correctRackSequence[index] : `EXTRA-${index + 1}`;
    
    return {
        ...glass,
        rack: newRack
    };
});

// Save updated inventory
const jsonData = JSON.stringify(updatedInventory, null, 2);

fs.writeFileSync(backendPath, jsonData);
fs.writeFileSync(deploymentPath, jsonData);

console.log(`✅ Successfully updated rack numbers for ALL ${updatedInventory.length} glass pieces!`);
console.log(`📁 Backend file: ${backendPath}`);
console.log(`📁 Deployment file: ${deploymentPath}`);

// Show summary statistics
const rackStats = {};
updatedInventory.forEach(glass => {
    rackStats[glass.rack] = (rackStats[glass.rack] || 0) + 1;
});

console.log('\n🏷️ New rack breakdown (top 20):');
const sortedRacks = Object.entries(rackStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20);
    
sortedRacks.forEach(([rack, count]) => {
    console.log(`  ${rack}: ${count} pieces`);
});

console.log(`\n📋 Sample updated entries:`);
const samples = updatedInventory.slice(0, 5);
console.log(JSON.stringify(samples, null, 2));

console.log(`\n🎯 All rack numbers have been updated according to your sequence!`);