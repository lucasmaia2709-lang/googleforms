const https = require('https');
const fs = require('fs');

async function extrairTudo(urlDoForm) {
    https.get(urlDoForm, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            const match = data.match(/var FB_PUBLIC_LOAD_DATA_ = (.*?);<\/script>/);
            if (!match) return console.log("Não encontrado");
            const dadosJson = JSON.parse(match[1]);
            const perguntas = dadosJson[1][1];
            
            const context = [];
            
            perguntas.forEach(p => {
                const item = {
                    id: p[0],
                    titulo: p[1],
                    questoes: []
                };
                
                if (p[4]) {
                    p[4].forEach(e => {
                        const questao = {
                            entryId: e[0],
                            pergunta: (e[3] && e[3][0]) ? e[3][0] : p[1],
                            alternativas: []
                        };
                        
                        // Alternativas
                        if (e[1]) {
                            questao.alternativas = e[1].map(alt => alt[0]);
                        }
                        
                        item.questoes.push(questao);
                    });
                }
                
                if (item.questoes.length > 0) {
                    context.push(item);
                }
            });
            
            fs.writeFileSync('form_full_context.json', JSON.stringify(context, null, 2));
            console.log("Contexto completo extraído para form_full_context.json");
            console.log(`Total de seções: ${context.length}`);
            console.log(`Total de itens: ${context.reduce((acc, s) => acc + s.questoes.length, 0)}`);
        });
    });
}

const url = "https://docs.google.com/forms/d/e/1FAIpQLSe4Nud-H974E-T2vSCqERbqHzWx96Jyz-JbiJPNvmYCFm4UAQ/viewform";
extrairTudo(url);
