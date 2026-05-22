import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

// System prompt for avatar generation
const SYSTEM_PROMPT = `You are an avatar configuration generator for a fashion try-on application.
Given a text description of a person, output a JSON object with avatar configuration parameters.

Output ONLY a valid JSON object with this structure:
{
  "gender": "male" | "female" | "non-binary",
  "skinTone": hex color string (e.g. "#E5BC9A"),
  "body": {
    "heightCm": number (152-198),
    "weightKg": number (45-120),
    "bodyType": "ectomorph" | "mesomorph" | "endomorph",
    "muscleDefinition": number (0-100)
  },
  "face": {
    "faceShape": "oval" | "round" | "square" | "heart" | "oblong",
    "eyeSize": number (30-70),
    "lipFullness": number (30-70)
  },
  "hair": {
    "style": "bald" | "buzz" | "short" | "medium" | "long" | "ponytail" | "braids" | "afro" | "curly",
    "color": hex color string,
    "hairline": "full" | "receding" | "widows-peak"
  }
}

Skin tone reference:
- Very light: #FDEEE0 to #F5DEC4
- Light: #EECDAD to #E5BC9A
- Light-medium: #D4A574 to #C99760
- Medium: #C08050 to #A87040
- Medium-dark: #986038 to #7A4F28
- Dark: #6B4520 to #4D3510
- Deep: #3E2D0A to #2F2508

Hair color reference:
- Black: #1A1A1A
- Dark brown: #3D2314
- Brown: #5D3A1A
- Light brown: #8B5A2B
- Auburn: #923E23
- Red: #A54B2A
- Blonde: #D4A65A
- Platinum: #E8D9B5
- Gray: #9E9E9E

Be inclusive and respectful. Interpret descriptions naturally and choose appropriate measurements based on context clues like "tall", "athletic", "curvy", etc.

Output ONLY the JSON object, no explanation or markdown.`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { description } = await req.json();
    
    if (!description || typeof description !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Description is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-avatar-config] Generating for:', description.slice(0, 50));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Generate avatar config for: "${description}"` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-avatar-config] AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from AI');
    }

    // Parse the JSON from the response
    let config;
    try {
      // Clean up any markdown code blocks if present
      const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
      config = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('[generate-avatar-config] JSON parse error:', parseError, 'Content:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log('[generate-avatar-config] Generated config for:', config.gender, config.hair?.style);

    return new Response(
      JSON.stringify({ config }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[generate-avatar-config] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
