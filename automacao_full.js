
const https = require('https');
const querystring = require('querystring');
const fs = require('fs');

async function enviarRespostaAutomatica() {
    const url = "https://docs.google.com/forms/d/e/1FAIpQLSe4Nud-H974E-T2vSCqERbqHzWx96Jyz-JbiJPNvmYCFm4UAQ/formResponse";
    
    // Carregar os dados limpos
    const rawData = fs.readFileSync('c:\\Users\\lucas\\.gemini\\antigravity\\scratch\\form_data_cleaned.json', 'utf8');
    const questions = JSON.parse(rawData);
    
    const dados = {};
    
    questions.forEach(q => {
        if (q.entradas && q.entradas.length > 0) {
            q.entradas.forEach(e => {
                if (e.alternativas && e.alternativas.length > 0) {
                    // Escolher uma alternativa aleatória
                    const randomIdx = Math.floor(Math.random() * e.alternativas.length);
                    const valor = e.alternativas[randomIdx];
                    dados[`entry.${e.entryId}`] = valor;
                } else if (q.tipo === 7) {
                    // Escala linear se não tiver alternativas (raro no JSON, mas por precaução)
                    dados[`entry.${e.entryId}`] = "5";
                }
            });
        }
    });

    // Ajustes manuais para garantir sanidade (opcional)
    // entry.1689161648 = Consentimento
    dados["entry.1689161648"] = "Aceito participar";

    const postData = querystring.stringify(dados);
    console.log("Enviando os seguintes dados (resumo):", Object.keys(dados).length, "campos");

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            console.log(`Status do envio: ${res.statusCode}`);
            if (res.statusCode === 200 || res.statusCode === 302) {
                console.log("SUCESSO: Resposta enviada ao Google Forms!");
            } else {
                console.log("ERRO: O formulário rejeitou os dados. Verifique os IDs.");
            }
            resolve();
        });

        req.on('error', (e) => {
            console.error(`Erro na requisição: ${e.message}`);
            reject(e);
        });

        req.write(postData);
        req.end();
    });
}

enviarRespostaAutomatica();
