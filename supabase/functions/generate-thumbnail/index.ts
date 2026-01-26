import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ThumbnailRequest {
  title: string;
  description?: string;
  style?: 'modern' | 'minimal' | 'vibrant';
}

interface ThumbnailResult {
  id: string;
  url: string;
  prompt: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, style = 'modern' } = await req.json() as ThumbnailRequest;

    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the Lovable AI API key from environment
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!apiKey) {
      // Fallback to mock thumbnails if no API key
      const mockThumbnails = generateMockThumbnails(title, style);
      return new Response(
        JSON.stringify({ thumbnails: mockThumbnails }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 3 different thumbnail prompts based on the title
    const prompts = generateThumbnailPrompts(title, description, style);
    const thumbnails: ThumbnailResult[] = [];

    // For now, return mock thumbnails with the prompts
    // In production, this would call an image generation API
    for (let i = 0; i < prompts.length; i++) {
      thumbnails.push({
        id: `thumb-${Date.now()}-${i}`,
        url: getPlaceholderThumbnail(i, style),
        prompt: prompts[i],
      });
    }

    return new Response(
      JSON.stringify({ thumbnails }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate thumbnails' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateThumbnailPrompts(title: string, description?: string, style: string = 'modern'): string[] {
  const baseContext = description ? `${title}: ${description}` : title;
  
  const stylePrompts: Record<string, string[]> = {
    modern: [
      `Modern, clean YouTube thumbnail for "${title}". Bold typography, gradient background, professional look, 16:9 aspect ratio.`,
      `Eye-catching thumbnail with abstract geometric shapes for "${title}". Minimalist design with strong contrast and readable text.`,
      `Professional thumbnail with subtle grain texture for "${title}". Modern color palette, centered composition.`,
    ],
    minimal: [
      `Minimalist thumbnail for "${title}". Clean white background, simple typography, elegant negative space.`,
      `Simple, elegant thumbnail for "${title}". Monochromatic color scheme, subtle shadows, refined aesthetic.`,
      `Zen-like minimalist design for "${title}". Soft colors, calm composition, breathing room.`,
    ],
    vibrant: [
      `Vibrant, colorful thumbnail for "${title}". Bold gradients, energetic composition, attention-grabbing.`,
      `High-energy thumbnail with dynamic colors for "${title}". Playful design, bright accents.`,
      `Eye-popping thumbnail for "${title}". Saturated colors, exciting visual elements.`,
    ],
  };

  return stylePrompts[style] || stylePrompts.modern;
}

function generateMockThumbnails(title: string, style: string): ThumbnailResult[] {
  const prompts = generateThumbnailPrompts(title, undefined, style);
  
  return prompts.map((prompt, i) => ({
    id: `mock-thumb-${Date.now()}-${i}`,
    url: getPlaceholderThumbnail(i, style),
    prompt,
  }));
}

function getPlaceholderThumbnail(index: number, style: string): string {
  // Return different placeholder images based on style and index
  const placeholders: Record<string, string[]> = {
    modern: [
      'https://images.unsplash.com/photo-1557683316-973673baf926?w=1280&h=720&fit=crop',
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1280&h=720&fit=crop',
      'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1280&h=720&fit=crop',
    ],
    minimal: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1280&h=720&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&h=720&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop',
    ],
    vibrant: [
      'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1280&h=720&fit=crop',
      'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=1280&h=720&fit=crop',
      'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1280&h=720&fit=crop',
    ],
  };

  const styleImages = placeholders[style] || placeholders.modern;
  return styleImages[index % styleImages.length];
}
