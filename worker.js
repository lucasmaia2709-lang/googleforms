/**
 * Cloudflare Worker Proxy for Gemini AI
 * 
 * Instructions:
 * 1. Create a new Cloudflare Worker.
 * 2. Paste this code into the worker editor.
 * 3. In the Cloudflare Dashboard, go to Settings -> Variables -> Environment Variables.
 * 4. Add a secret named GEMINI_API_KEY with your Google AI Studio key.
 * 5. Deploy the worker and copy its URL.
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Only POST requests allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const data = await request.json();
      const { prompt } = data;

      if (!prompt) {
        return new Response('Missing prompt', { status: 400, headers: corsHeaders });
      }

      const apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
      const response = await fetch(`${apiEndpoint}?key=${env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1, // Menor temperatura = mais precisão no formato
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          }
        }),
      });

      const geminiData = await response.json();
      
      if (!response.ok) {
        return new Response(JSON.stringify({ 
          error: 'Gemini API Error', 
          status: response.status,
          details: geminiData 
        }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Extract the candidate text
      if (geminiData.candidates && geminiData.candidates[0].content && geminiData.candidates[0].content.parts[0].text) {
          return new Response(geminiData.candidates[0].content.parts[0].text, {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
      }

      return new Response(JSON.stringify({ error: 'Invalid response format from Gemini', details: geminiData }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
