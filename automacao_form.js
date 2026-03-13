const https = require('https');
const querystring = require('querystring');

/**
 * Script para automatizar o preenchimento de um Google Form.
 * Substitua os valores nos campos abaixo pelos dados que deseja enviar.
 */

async function enviarResposta() {
    // URL de envio do formulário (termina em /formResponse)
    const url = "https://docs.google.com/forms/d/e/1FAIpQLSe4Nud-H974E-T2vSCqERbqHzWx96Jyz-JbiJPNvmYCFm4UAQ/formResponse";

    // Mapeamento dos campos (Baseado na extração realizada)
    // NOTA: Para perguntas de escala ou grade, você precisa do ID específico de cada linha/pergunta.
    // Como a extração automática simplificou alguns IDs complexos, você pode precisar ajustar
    // se o formulário for uma "Grade de múltipla escolha".
    
    const dados = {
        "entry.1592631525": "Aceito participar", // Consentimento Informado
        "entry.1444131553": "5", // Escala 1 a 5 (trabalho)
        "entry.206461973": "8", // Escala 0 a 10 (satisfação)
        "entry.597118511": "Masculino", // Género
        "entry.1551581666": "26-35", // Idade
        "entry.838409150": "Ensino Secundário / Médio (12º ano)", // Habilitações
        "entry.1238416916": "1 - 3 anos", // Tempo de empresa
        "entry.1526877193": "10 a 49 (Pequena-média)", // Tamanho organização
        "entry.1608516216": "Contrato de Trabalho", // Vínculo
        "entry.542331173": "6 a 10 anos", // Experiência profissional

        // IDs de Grade/Grid (Exemplos de como preencher cada linha)
        "entry.972488808": "4", 
        "entry.591415489": "5",
        "entry.700788971": "3",
        // ... adicione os outros IDs extraídos conforme necessário
    };

    const postData = querystring.stringify(dados);

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
                console.log("Formulário enviado com sucesso!");
            } else {
                console.log("Houve um problema no envio.");
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

// Para rodar uma vez:
enviarResposta();

// Para rodar várias vezes (exemplo: 5 vezes):
/*
async function rodarMultiplos(n) {
    for (let i = 0; i < n; i++) {
        console.log(`Enviando resposta ${i + 1}...`);
        await enviarResposta();
    }
}
rodarMultiplos(5);
*/
