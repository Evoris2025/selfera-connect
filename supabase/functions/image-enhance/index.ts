import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Call Lovable AI with the image for analysis
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert photo editor AI. Analyze images and return optimal enhancement values for professional, natural-looking results. Always return valid JSON with these exact numeric fields:
- brightness: 50-150 (default 100, increase for dark images, decrease for bright)
- contrast: 50-150 (default 100, increase for flat/hazy images)
- saturation: 0-200 (default 100, boost slightly for most photos)
- warmth: -100 to 100 (default 0, positive for warmer, negative for cooler)
- highlights: -100 to 100 (default 0, negative to recover blown highlights)
- shadows: -100 to 100 (default 0, positive to lift dark areas)

Be subtle - small adjustments often work best. If the image already looks well-balanced, keep values near defaults.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image and provide optimal adjustment values for professional photo enhancement. Return ONLY a JSON object with brightness, contrast, saturation, warmth, highlights, and shadows values. No explanation, just the JSON.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'apply_enhancements',
              description: 'Apply the calculated enhancement values to the image',
              parameters: {
                type: 'object',
                properties: {
                  brightness: {
                    type: 'number',
                    description: 'Brightness adjustment (50-150, default 100)',
                    minimum: 50,
                    maximum: 150
                  },
                  contrast: {
                    type: 'number',
                    description: 'Contrast adjustment (50-150, default 100)',
                    minimum: 50,
                    maximum: 150
                  },
                  saturation: {
                    type: 'number',
                    description: 'Saturation adjustment (0-200, default 100)',
                    minimum: 0,
                    maximum: 200
                  },
                  warmth: {
                    type: 'number',
                    description: 'Warmth/color temperature (-100 to 100, default 0)',
                    minimum: -100,
                    maximum: 100
                  },
                  highlights: {
                    type: 'number',
                    description: 'Highlights recovery (-100 to 100, default 0)',
                    minimum: -100,
                    maximum: 100
                  },
                  shadows: {
                    type: 'number',
                    description: 'Shadows lift (-100 to 100, default 0)',
                    minimum: -100,
                    maximum: 100
                  }
                },
                required: ['brightness', 'contrast', 'saturation', 'warmth', 'highlights', 'shadows'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'apply_enhancements' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      // Handle rate limiting
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const enhancements = JSON.parse(toolCall.function.arguments);
      
      // Validate and clamp values
      const validated = {
        brightness: Math.max(50, Math.min(150, Math.round(enhancements.brightness ?? 100))),
        contrast: Math.max(50, Math.min(150, Math.round(enhancements.contrast ?? 100))),
        saturation: Math.max(0, Math.min(200, Math.round(enhancements.saturation ?? 100))),
        warmth: Math.max(-100, Math.min(100, Math.round(enhancements.warmth ?? 0))),
        highlights: Math.max(-100, Math.min(100, Math.round(enhancements.highlights ?? 0))),
        shadows: Math.max(-100, Math.min(100, Math.round(enhancements.shadows ?? 0))),
      };

      return new Response(
        JSON.stringify({ success: true, enhancements: validated }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback: try to parse content as JSON
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        const validated = {
          brightness: Math.max(50, Math.min(150, Math.round(parsed.brightness ?? 100))),
          contrast: Math.max(50, Math.min(150, Math.round(parsed.contrast ?? 100))),
          saturation: Math.max(0, Math.min(200, Math.round(parsed.saturation ?? 100))),
          warmth: Math.max(-100, Math.min(100, Math.round(parsed.warmth ?? 0))),
          highlights: Math.max(-100, Math.min(100, Math.round(parsed.highlights ?? 0))),
          shadows: Math.max(-100, Math.min(100, Math.round(parsed.shadows ?? 0))),
        };
        
        return new Response(
          JSON.stringify({ success: true, enhancements: validated }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch {
        console.error('Failed to parse AI content as JSON:', content);
      }
    }

    // If we couldn't get valid enhancements, return defaults with a flag
    return new Response(
      JSON.stringify({ 
        success: true, 
        enhancements: {
          brightness: 105,
          contrast: 108,
          saturation: 110,
          warmth: 0,
          highlights: -5,
          shadows: 10,
        },
        fallback: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Image enhance error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        // Return fallback values so the feature still works
        enhancements: {
          brightness: 105,
          contrast: 108,
          saturation: 110,
          warmth: 0,
          highlights: -5,
          shadows: 10,
        },
        fallback: true
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
