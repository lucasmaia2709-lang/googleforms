const https = require('https');

async function descobrirEntriesDoForm(urlDoForm) {
    console.log(`Analisando o formulário: ${urlDoForm}\n`);
    console.log("-".repeat(50));

    return new Promise((resolve, reject) => {
        https.get(urlDoForm, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const match = data.match(/var FB_PUBLIC_LOAD_DATA_ = (.*?);<\/script>/);
                    if (!match) {
                        console.log("Não foi possível encontrar a estrutura de dados no formulário.");
                        return resolve();
                    }

                    const dadosJson = JSON.parse(match[1]);
                    const perguntas = dadosJson[1][1];
                    let encontrouAlgo = false;

                    const perguntasData = [];

                    perguntas.forEach((pergunta) => {
                        const idPergunta = pergunta[0];
                        const titulo = pergunta[1];
                        const tipo = pergunta[3];
                        const obrigatoria = pergunta[2] === 1;
                        
                        const itemData = {
                            id: idPergunta,
                            titulo: titulo,
                            tipo: tipo,
                            obrigatoria: obrigatoria,
                            entradas: []
                        };

                        if (pergunta.length > 4 && pergunta[4]) {
                            const conteudos = pergunta[4];
                            
                            conteudos.forEach((entrada) => {
                                const entryId = entrada[0];
                                const subTitulo = entrada[2] || "";
                                
                                const entradaData = {
                                    entryId: entryId,
                                    subTitulo: subTitulo,
                                    alternativas: []
                                };

                                // Capturar alternativas se existirem (índice 1 de entrada)
                                if (entrada[1] && Array.isArray(entrada[1])) {
                                    entradaData.alternativas = entrada[1].map(alt => alt[0]);
                                }

                                itemData.entradas.push(entradaData);
                            });
                        }
                        
                        perguntasData.push(itemData);
                    });

                    // Saída estruturada
                    console.log(JSON.stringify(perguntasData, null, 2));
                    resolve(perguntasData);
                } catch (e) {
                    console.log(`Erro ao processar dados: ${e.message}`);
                    resolve();
                }
            });
        }).on('error', (err) => {
            console.log(`Erro ao acessar o formulário: ${err.message}`);
            resolve();
        });
    });
}

const linkDoSeuFormulario = "https://docs.google.com/forms/d/e/1FAIpQLSe4Nud-H974E-T2vSCqERbqHzWx96Jyz-JbiJPNvmYCFm4UAQ/viewform";
descobrirEntriesDoForm(linkDoSeuFormulario);
