
const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\lucas\\.gemini\\antigravity\\scratch\\form_data_utf8.json';
const outputPath = 'c:\\Users\\lucas\\.gemini\\antigravity\\scratch\\form_data_cleaned.json';

try {
    const rawData = fs.readFileSync(filePath, 'utf16le');
    const jsonStart = rawData.indexOf('[');
    if (jsonStart === -1) {
        console.error('JSON start not found');
        process.exit(1);
    }
    const cleanData = rawData.substring(jsonStart);
    fs.writeFileSync(outputPath, cleanData, 'utf8');
    console.log('Cleaned JSON saved to:', outputPath);
} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
