
const fs = require('fs');
const filePath = 'c:\\Users\\lucas\\.gemini\\antigravity\\scratch\\form_data_cleaned.json';

try {
    let data = fs.readFileSync(filePath, 'utf8');
    // Remove qualquer coisa antes do primeiro '[' e faz trim
    const start = data.indexOf('[');
    if (start !== -1) {
        data = data.substring(start).trim();
        fs.writeFileSync(filePath, data, 'utf8');
        console.log('JSON corrigido e trimado com sucesso.');
    } else {
        console.error('Nenhum array JSON encontrado.');
    }
} catch (err) {
    console.error(err);
}
