const fs = require('fs');
const path = require('path');

// Raw inventory data from the PDF
const inventoryData = `35 36 Acid 4 MARLSTONE X77
42 36 Acid 4 MARLSTONE X77
43 36 Acid 40 MARLSTONE X77
45 36 Acid 40 MARLSTONE X77
21 68 div 79 ROCKWELL X78
23 68 acid_div 1 P-003
24 68 acid_div 3 G-2025
25 68 acid_div 1 P-003
27 68 div 5 ROCKWELL X78
28 68 DIV 2 A-684
29 68 DIV 4 A-684
31 68 DIV 4 A-684
32 68 acid_div 4 QUEEN X66
33 68 acid_div 2 P-003
34 68 acid_div 17 P-003
34 68 acid_div 4 QUEEN X66
34 68 Acid-Div 67 P-014
34 68 clear 3 P-013
35 68 acid_div 3 B-004
35 68 acid_div 2 P-003
35 68 clear 1 P-013
35 68 DIV 4 A-684
52 39 acid_div 1 P-003
36 68 acid_div 1 P-003
36 68 DIV 1 A-684
38 68 acid_div 3 P-013
38 68 DIV 1 A-684
39 68 acid_div 11 B-003
39 68 acid_div 6 X65
39 68 Acid-Div 1 Z-384
27 40 Blue 25 G-052
28 40 Blue 5 G-052
30 40 Blue 10 G-052
31 40 Blue 5 G-052
32 40 Blue 2 G-052
33 40 Blue 1 A-653
33 50 blue 2 P-001
33 40 Blue 3 P-022
34 40 Blue 1 P-022
35 39 Blue 1 G-052
37 39 Blue 2 G-052
38 40 Blue 1 P-022
39 52 Blue 2 A-653
39 40 Blue 28 P-022
40 48 blue 6 P-001
40 40 Blue 2 P-022
41 39 Blue 43 G-052
44 39 blue 1 P-001
44 40 blue 1 P-022
46 40 Blue 15 P-022
48 40 Blue 2 P-022
49 52 Blue 8 A-653
49 52 blue 1 P-009
49 40 Blue 1 P-022
50 52 Blue 1 A-653
50 40 Blue 3 P-022
51 40 Blue 1 P-022
52 40 Blue 3 P-022
53 52 Blue 4 A-653
54 52 Blue 3 A-653
56 52 Blue 2 A-653
21 52 bronze 14 G-2025
47 39 brown 32 G-056
20 52 brown 2 P-009
44 52 brown 1 P-009
46 52 brown 1 P-009
39 40 brown 7 P-022
21 52 brown 30 G-044
20 14 brown 14 Z-430
21 14 brown 5 Z-430
44 14 brown 31 Z-430
45 14 brown 3 Z-430
46 14 brown 21 Z-430
48 52 claire 82 G-084
44 42 clear 2 1010
48 46 clear 6 1010
48 49 clear 2 1010
50 44 clear 1 1010
54 44 clear 1 1010
30 36 clear 16 9-039
35 39 Clear 12 9-039
36 39 Clear 2 9-039
33 39 clear 38 A-13
34 39 clear 2 A-13
36 36 clear 1 A-13
44 39 clear 3 B-001
47 39 clear 2 B-001
51 39 clear 12 B-001
47 39 clear 10 B-002
68 39 clear 12 B-002
32 39 clear 6 B-004
44 39 clear 1 B-004
45 39 clear 2 B-004
46 39 clear 88 B-025
47 39 Clear 84 B-309
34 26 clear 3 B-5
38 26 clear 2 B-5
40 26 clear 20 B-5
40 52 clear 10 B-5
42 26 clear 54 B-5
42 26 clear 2 B-5
44 26 clear 6 B-5
45 26 clear 2 B-5
48 26 clear 5 B-5
38 39 clear 53 C-058
39 39 clear 43 C-058
40 39 clear 8 C-058
42 39 clear 14 C-058
44 39 clear 30 C-058
46 39 clear 4 C-058
47 39 clear 1 C-058
45 39 clear 123 G-033
42 39 clear 259 G-034
40 39 clear 91 G-037
26 39 clear 25 G-040
31 39 clear 17 G-040
50 26 clear 2 G-040
51 39 clear 97 G-042
33 52 clear 3 G-043
34 52 clear 1 G-043
38 39 clear 37 G-043
39 52 clear 1 G-043
32 44 clear 41 G-056
36 36 clear 8 G-066
37 36 clear 6 G-066
42 36 clear 20 G-066
43 36 clear 20 G-066
20 52 clear 20 G-075
21 52 clear 22 G-075
36 36 clear 1 G-075
42 39 clear 2 G-075
42 39 clear 4 G-078
44 26 clear 17 G-078
44 39 clear 25 G-078
28 39 clear 1 G-079
31 39 clear 1 G-079
33 52 clear 2 G-079
34 39 clear 1 G-079
36 39 clear 1 G-079
36 52 clear 2 G-079
38 52 clear 4 G-079
39 39 clear 1 G-079
39 55 clear 4 G-079
40 39 clear 1 G-079
43 52 clear 3 G-079
45 52 clear 3 G-079
46 52 clear 16 G-080
47 52 clear 80 G-082
48 52 clear 84 G-083
48 52 clear 43 G-085
39 39 clear 44 G-087
41 39 clear 38 G-087
20 39 clear 8 G-088
51 39 clear 9 G-092
14 36 clear 5 G-2025
14 43 clear 2 G-2025
14 42 clear 1 G-2025
14 40 clear 1 G-2025
14 34 clear 1 G-2025
24 52 clear 2 G-2025
38 39 Clear 219 P-000
20 39 clear 6 P-0006
24 39 clear 15 P-0006
26 39 clear 17 P-0006
28 39 clear 19 P-0006
43 24 clear 2 P-0006
44 24 clear 17 P-0006
45 34 clear 3 P-0006
48 24 clear 14 P-0006
28 39 clear 6 P-001
37 36 clear 4 P-001
40 68 clear 1 P-001
40 68 clear 1 P-022
48 39 clear 71 P-002
49 39 clear 14 P-002
50 39 clear 2 P-002
22 42 clear 4 P-003
24 44 clear 1 P-003
26 40 clear 1 P-003
26 43 clear 1 P-003
26 48 clear 1 P-003
26 44 clear 4 P-003
32 44 clear 1 P-003
49 39 clear 11 P-003
35 39 clear 56 P-004
36 52 clear 2 P-008
38 52 clear 7 P-008
39 52 clear 3 P-008
40 35 clear 10 P-008
41 35 clear 12 P-008
42 35 clear 23 P-008
44 35 clear 20 P-008
35 44 clear 1 P-009
47 52 clear 1 P-009
47 39 clear 1 P-009
50 52 clear 1 P-009
56 39 clear 3 P-009
42 39 clear 63 P-010
43 39 clear 1 P-010
48 39 clear 10 P-010
34 39 clear 47 P-012
42 68 acid_div 4 P-013
34 14 clear 13 P-013
42 68 Acid-Div 12 Z-384
56 39 clear 16 P-013
34 52 clear 2 P-018
38 39 clear 2 P-018
42 52 clear 1 P-018
42 68 Div 1 P-018
33 39 clear 150 STOCK
30 34 clear 6 QUEEN
36 34 clear 8 QUEEN
37 34 clear 4 QUEEN
41 34 clear 2 QUEEN
46 34 clear 71 QUEEN
55 34 clear 6 QUEEN
57 34 clear 1 QUEEN
18 34 clear 2 QUEEN
28 39 clear 17 QUEEN
28 34 clear 1 QUEEN
30 39 clear 37 QUEEN
30 34 clear 1 QUEEN
32 34 clear 1 QUEEN
33 34 clear 3 QUEEN
34 34 clear 2 QUEEN
36 34 clear 1 QUEEN
37 34 clear 1 QUEEN
41 34 clear 1 QUEEN
43 34 clear 10 QUEEN
44 34 clear 1 QUEEN
45 34 clear 23 QUEEN
46 34 clear 2 QUEEN
47 34 clear 4 QUEEN
48 34 clear 14 QUEEN
49 34 clear 2 QUEEN
50 34 clear 4 QUEEN
51 34 clear 1 QUEEN
54 34 clear 4 QUEEN
55 34 clear 4 QUEEN
58 34 clear 2 QUEEN
28 39 clear 30 QUEEN
47 39 clear 100 QUEEN
35 39 clear 67 QUEEN
40 39 clear 20 QUEEN
41 39 clear 20 QUEEN
42 39 clear 5 QUEEN
44 39 clear 20 QUEEN
45 39 clear 10 QUEEN
42 39 clear 47 QUEEN
48 39 clear 67 QUEEN
42 39 clear 128 QUEEN
40 39 clear 64 QUEEN
45 39 clear 18 QUEEN
47 39 clear 32 QUEEN
40 39 clear 128 QUEEN
45 39 clear 71 QUEEN
46 39 clear 2 QUEEN
56 39 clear 32 QUEEN
45 39 clear 18 X74
45 39 clear 48 QUEEN
47 39 clear 32 QUEEN
52 39 clear 20 QUEEN
36 34 clear 8 WESTMOUNT
37 39 clear 12 WESTMOUNT
40 39 clear 1 WESTMOUNT
40 34 clear 2 WESTMOUNT
41 39 clear 4 WESTMOUNT
41 34 clear 2 WESTMOUNT
44 34 clear 4 WESTMOUNT
45 39 clear 11 WESTMOUNT
45 34 clear 61 WESTMOUNT
46 39 clear 4 WESTMOUNT
53 39 clear 4 WESTMOUNT
56 39 clear 7 WESTMOUNT
60 39 clear 2 WESTMOUNT
60 34 clear 4 WESTMOUNT
18 39 clear 46 MARLSTONE
20 39 clear 18 MARLSTONE
41 30 clear 4 X78
42 30 clear 22 X78
43 30 clear 8 X78
44 30 clear 14 X78
45 30 clear 4 X78
35 39 clear 84 ROCKWELL
35 39 clear 56 ROCKWELL
42 39 clear 25 ROCKWELL
37 39 clear 92 ROCKWELL
41 39 clear 93 X82
42 39 clear 23 X82
43 39 clear 105 ROCKWELL
44 39 clear 11 ROCKWELL
45 39 clear 74 ROCKWELL
47 39 clear 3 ROCKWELL
52 39 clear 101 ROCKWELL
44 39 clear 10 ROCKWELL
45 39 clear 2 ROCKWELL
52 39 clear 101 ROCKWELL
55 39 clear 95 STOCK
55 39 clear 65 X88
55 39 clear 30 STOCK
43 39 clear 40 STOCK
49 39 clear 40 STOCK
34 39 clear 150 STOCK
43 68 acid_div 2 P-013
43 68 acid_div 10 QUEEN
43 68 Div 1 P-018
44 68 clear 1 P-001
46 68 Acid-Div 6 Z-384
46 68 DIV 1 A-684
47 68 acid_div 1 P-013
47 68 DIV 1 A-684
48 68 acid_div 3 B-003
48 68 DIV 1 A-684
52 68 acid_div 1 P-013
52 68 acid_div 10 X65
55 68 acid_div 1 P-013
13 38 Gray 2 G-2025
16 39 Gray 5 G-079
18 39 Gray 1 G-2025
18 39 Gray 5 P-009
22 43 Gray 1 P-009
30 39 Gray 1 B-032
31 39 Gray 5 B-032
31.5 39 Gray 6 B-032
32 39 Gray 9 B-032
33 39 Gray 3 B-032
34 39 Gray 5 B-032
34 52 Gray 1 P-009
35 39 Gray 1 9-039
35 39 Gray 3 B-032
36 39 Gray 3 B-032
36 39 Gray 14 G-089
37 39 Gray 2 B-032
37 52 Gray 3 P-009
37 52 Gray 3 P-022
38 39 Gray 2 B-032
38 42 Gray 6 G-079
38 52 Gray 2 G-079
38 32 Gray 2 G-079
38 39 Gray 1 G-089
38.5 39 Gray 3 G-079
39 39 Gray 2 P-022
40 39 Gray 7 9-039
40 52 Gray 3 A-676
40 39 Gray 11 B-032
40 38 Gray 6 G-079
40 52 Gray 1 P-009
40 38 Gray 2 P-018
41 22 Gray 1 9-039
41 52 Gray 2 G-075
41 52 Gray 1 P-008
41 52 Gray 1 P-009
41 39 Gray 3 P-018
42 22 Gray 1 9-039
42 52 Gray 13 A-676
42 39 Gray 6 B-032
42 39 Gray 8 G-088
42 52 Gray 14 G-2025
43 22 Gray 3 9-039
43 39 Gray 5 G-088
43 52 Gray 1 P-009
43 39 Gray 1 P-018
44 52 Gray 33 P-009
44 52 Gray 3 P-009
46 39 Gray 1 B-032
46 39 Gray 4 G-079
46 52 Gray 5 P-009
48 52 Gray 11 A-676
48 54 Gray 3 P-009
48 52 Gray 4 P-009
50 52 Gray 3 G-2025
52 39 Gray 2 P-010
54 52 Gray 2 P-009`;

function parseInventoryLine(line) {
    if (!line.trim()) return null;
    
    // Split the line by spaces and handle various patterns
    const parts = line.trim().split(/\s+/);
    
    if (parts.length < 4) return null;
    
    const width = parseFloat(parts[0]);
    const height = parseFloat(parts[1]);
    const color = parts[2];
    const quantity = parseInt(parts[3]);
    
    // Get project code (remaining parts joined)
    const projectParts = parts.slice(4);
    const project = projectParts.length > 0 ? projectParts.join(' ') : null;
    
    // Determine if heat soaked (looking for acid in color or project)
    const heatSoaked = color.toLowerCase().includes('acid') || 
                      color.toLowerCase().includes('div') || 
                      (project && project.toLowerCase().includes('acid'));
    
    // Normalize color names
    let normalizedColor = color.toLowerCase();
    if (normalizedColor.includes('acid') || normalizedColor.includes('div')) {
        normalizedColor = 'Acid Etched';
    } else if (normalizedColor === 'claire') {
        normalizedColor = 'Clear';
    } else {
        normalizedColor = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
    }
    
    return {
        width,
        height,
        color: normalizedColor,
        quantity,
        project,
        heatSoaked
    };
}

function createGlassEntries(inventoryItem) {
    const entries = [];
    const { width, height, color, quantity, project, heatSoaked } = inventoryItem;
    
    // Create individual glass entries based on quantity
    for (let i = 0; i < quantity; i++) {
        const glassId = `glass_${width}x${height}_${color.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}_${i}`;
        
        entries.push({
            id: glassId,
            width: width,
            height: height,
            color: color,
            heatSoaked: heatSoaked,
            reservedProject: project && project !== 'STOCK' ? project : null
        });
    }
    
    return entries;
}

function convertInventoryToJSON() {
    const lines = inventoryData.split('\n');
    const allGlasses = [];
    let totalProcessed = 0;
    let totalGlassCount = 0;
    
    console.log('Processing inventory data...');
    
    lines.forEach((line, index) => {
        const inventoryItem = parseInventoryLine(line);
        if (inventoryItem) {
            const glassEntries = createGlassEntries(inventoryItem);
            allGlasses.push(...glassEntries);
            totalProcessed++;
            totalGlassCount += inventoryItem.quantity;
            
            console.log(`Processed: ${inventoryItem.width}x${inventoryItem.height} ${inventoryItem.color} - ${inventoryItem.quantity} pieces - Project: ${inventoryItem.project || 'None'}`);
        }
    });
    
    console.log(`\nSummary:`);
    console.log(`- Processed ${totalProcessed} inventory lines`);
    console.log(`- Created ${totalGlassCount} individual glass entries`);
    console.log(`- Total glasses in JSON: ${allGlasses.length}`);
    
    return allGlasses;
}

// Convert the data
const glassInventory = convertInventoryToJSON();

// Write to glasses.json file
const glassesFilePath = path.join(__dirname, 'deployment-files', 'data', 'glasses.json');
fs.writeFileSync(glassesFilePath, JSON.stringify(glassInventory, null, 2));

console.log(`\n✅ Successfully created glasses.json with ${glassInventory.length} glass entries!`);
console.log(`📁 File saved to: ${glassesFilePath}`);

// Also update the local data folder
const localGlassesPath = path.join(__dirname, 'backend', 'data', 'glasses.json');
if (fs.existsSync(path.dirname(localGlassesPath))) {
    fs.writeFileSync(localGlassesPath, JSON.stringify(glassInventory, null, 2));
    console.log(`📁 Also updated local file: ${localGlassesPath}`);
}

// Show some sample entries
console.log('\n📋 Sample entries:');
console.log(JSON.stringify(glassInventory.slice(0, 3), null, 2));

// Show color breakdown
const colorCounts = {};
glassInventory.forEach(glass => {
    colorCounts[glass.color] = (colorCounts[glass.color] || 0) + 1;
});

console.log('\n🎨 Color breakdown:');
Object.entries(colorCounts).forEach(([color, count]) => {
    console.log(`  ${color}: ${count} pieces`);
});

// Show project breakdown
const projectCounts = {};
glassInventory.forEach(glass => {
    const project = glass.reservedProject || 'Available';
    projectCounts[project] = (projectCounts[project] || 0) + 1;
});

console.log('\n📊 Project allocation:');
Object.entries(projectCounts).sort((a, b) => b[1] - a[1]).forEach(([project, count]) => {
    console.log(`  ${project}: ${count} pieces`);
});