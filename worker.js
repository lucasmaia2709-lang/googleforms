export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    try {
      if (!env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY não configurada no Worker.");
      }

      const body = await request.json();
      const profile = body.profile || "Neutro";
      const seed = body.seed || Math.random();

      const systemPrompt = `Você é um psicólogo e consultor de RH especializado na construção civil. 
Gere os dados de um TRABALHADOR ÚNICO e REALISTA baseado no perfil de satisfação: ${profile}.
SEED DE ALEATORIEDADE: ${seed}

IMPORTANTE: Seja criativo! NÃO repita sempre os mesmos cargos ou idades. 
Varie os nomes de cargos, tempos de experiência e histórias de vida.

RETORNE APENAS JSON NO FORMATO:
{
  "cargo": "Ex: Armador de Ferro",
  "idade": "Ex: 46-55",
  "experiencia": "Ex: > 6 anos",
  "escolaridade": "Ex: Ensino Médio",
  "vinculo": "Ex: Prestação de Serviços",
  "tamanho_organizacao": "Ex: 250 ou mais",
  "persona": "Descrição de 2 frases únicas sobre esta pessoa específica."
}

REGRAS DE VALORES (Use EXATAMENTE um destes para cada campo):
- Cargo: Ajudante Geral, Pedreiro, Mestre de Obras, Técnico em Edificações, Engenheiro Civil, Servente, Armador, Carpinteiro, Eletricista.
- Idade: "18-25", "26-35", "36-45", "46-55", "56-65", "66 ou +".
- Escolaridade: "Ensino Básico / Fundamental (1º ao 9º ano)", "Ensino Secundário / Médio (12º ano)", "Graduação Licenciatura | Bacharel", "Pós-graduação | Especialização", "Mestrado | Doutoramento".
- Experiência (Anos na empresa): "< 1 ano", "1 - 3 anos", "4 - 6 anos", "> 6 anos".
- Exp Profissional (Total): "0 a 2 anos", "3 a 5 anos", "6 a 10 anos", "+ 11 anos".
- Vínculo: "Contrato de Trabalho", "Prestação de Serviços".
- Tamanho Org: "1 a 9 (Organização pequena)", "10 a 49 (Pequena-média)", "50 a 249 (Organização Médio)", "250 ou mais (Empresa de grande-porte)".

Se for entusiasta, a persona deve ser muito positiva. Se for crítico, deve ser muito insatisfeita.`;

      const apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
      const response = await fetch(`${apiEndpoint}?key=${env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: { 
              temperature: 1.0, // Aumentado para máxima variabilidade
              responseMimeType: "application/json" 
            }
          }),
      });

      const geminiData = await response.json();
      if (!response.ok) throw new Error(geminiData.error?.message || "Erro Gemini");

      let aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      return new Response(aiText.replace(/```json/g, "").replace(/```/g, "").trim(), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
  },
};
