/**
 * Cloudflare Worker Proxy for Gemini AI - v12.0 (Strict Enforcement)
 * Fixes: Fixed Gender (Masculino) and Consent (Aceito).
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    try {
      const { persona, profile, type, missingIds } = await request.json();

      let systemPrompt = "";
      let responseMimeType = "text/plain";

      if (type === "generate_persona" || (persona && persona.includes("Gere uma descrição"))) {
        systemPrompt = `Você é um psicólogo organizacional. Gere uma descrição realista de um profissional da construção civil.
CARGO (Sorteie): Ajudante Geral, Pedreiro, Mestre de Obras, Técnico de Edificações, Engenheiro Civil.
Perfil: ${profile}. JSON: {"persona": "...", "cargo": "Cargo"}`;
        responseMimeType = "application/json";
      } else {
        const targetIds = missingIds && missingIds.length > 0 ? missingIds.join(', ') : "Todos os 96 itens";
        
        systemPrompt = `Você é: ${persona}. Perfil: ${profile}.

REGRAS OBRIGATÓRIAS:
1. ID 1689161648 (Consentimento): Escolha SEMPRE índice 0.
2. ID 597118511 (Gênero): Escolha SEMPRE índice 0 (Masculino).
3. VARIABILIDADE: Para as demais perguntas (escalas 1-5 ou 0-10), NUNCA repita o mesmo número mais de 3 vezes seguidas. Use nuances baseadas no perfil ${profile}.

CONSISTÊNCIA DE CARGO:
- AJUDANTE/PEDREIRO: ID 838409150 (Educação) = 0 ou 1.
- MESTRE: ID 838409150 = 1. Experiência = 2 ou 3.
- ENGENHEIRO: ID 838409150 = 2, 3 ou 4.

IDs ALVO: ${targetIds}

FORMATO: JSON puro {"ID": indice}.`;
        responseMimeType = "application/json";
      }

      const apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
      const response = await fetch(`${apiEndpoint}?key=${env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: { temperature: 0.7, responseMimeType: responseMimeType }
          }),
      });

      const geminiData = await response.json();
      let aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      return new Response(aiText.replace(/```json/g, "").replace(/```/g, "").trim(), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
  },
};
