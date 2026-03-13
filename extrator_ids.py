import requests
import re
import json

def descobrir_entries_do_form(url_do_form):
    print(f"Analisando o formulário: {url_do_form}\n")
    print("-" * 50)
    
    try:
        # Puxa o código fonte da página
        resposta = requests.get(url_do_form)
        resposta.raise_for_status()
        
        # O Google Forms guarda a estrutura num objeto JavaScript chamado FB_PUBLIC_LOAD_DATA_
        # Vamos usar uma expressão regular para capturar esse bloco de dados
        match = re.search(r'var FB_PUBLIC_LOAD_DATA_ = (.*?);</script>', resposta.text, re.DOTALL)
        
        if not match:
            print("Não foi possível encontrar a estrutura de dados no formulário.")
            return

        # Converte o texto capturado para um objeto Python (JSON)
        dados_json = json.loads(match.group(1))
        
        # Navega até a lista de perguntas
        perguntas = dados_json[1][1]
        
        encontrou_algo = False
        
        # Passa por cada item do formulário
        for pergunta in perguntas:
            # Pega o título/texto da pergunta
            titulo = pergunta[1]
            
            # Verifica se o item tem campos de resposta (se len > 4 e não for nulo)
            if len(pergunta) > 4 and pergunta[4]:
                opcoes = pergunta[4][0]
                
                # O ID da entrada geralmente fica no índice 1 das opções
                if len(opcoes) > 1:
                    entry_id = opcoes[1]
                    print(f"Pergunta: {titulo}")
                    print(f"ID para usar: entry.{entry_id}")
                    print("-" * 50)
                    encontrou_algo = True
                    
        if not encontrou_algo:
            print("Nenhuma pergunta com ID de resposta foi encontrada.")
            
    except Exception as e:
        print(f"Ocorreu um erro ao tentar ler o formulário: {e}")

# COLE AQUI O LINK DO SEU FORMULÁRIO (Pode ser o link normal, terminando em /viewform)
link_do_seu_formulario = "https://docs.google.com/forms/d/e/1FAIpQLSe4Nud-H974E-T2vSCqERbqHzWx96Jyz-JbiJPNvmYCFm4UAQ/viewform"

# Executa a ferramenta
descobrir_entries_do_form(link_do_seu_formulario)