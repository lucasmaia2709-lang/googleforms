const https = require('https');
const fs = require('fs');

async function debugForm(urlDoForm) {
    https.get(urlDoForm, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            const match = data.match(/var FB_PUBLIC_LOAD_DATA_ = (.*?);<\/script>/);
            if (!match) return console.log("Não encontrado");
            const dadosJson = JSON.parse(match[1]);
            const perguntas = dadosJson[1][1];
            
            // Vamos olhar a pergunta de Intraempreendedorismo (índice 2 geralmente)
            // Ou procurar pelo ID 481608134
            const target = perguntas.find(p => p[0] === 481608134);
            if (target) {
                console.log("--- RAW PERGUNTA 481608134 ---");
                console.log(JSON.stringify(target, null, 2));
            } else {
                console.log("Pergunta não encontrada");
            }
        });
    });
}

const url = "https://docs.google.com/forms/d/e/1FAIpQLSe4Nud-H974E-T2vSCqERbqHzWx96Jyz-JbiJPNvmYCFm4UAQ/viewform";
debugForm(url);
