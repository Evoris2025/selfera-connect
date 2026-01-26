import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkPreview {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the URL with a timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SelfERA Link Preview Bot/1.0',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();

    // Extract metadata from HTML
    const preview: LinkPreview = {
      url,
      title: extractMetaContent(html, 'og:title') || extractTitle(html),
      description: extractMetaContent(html, 'og:description') || extractMetaContent(html, 'description'),
      image: extractMetaContent(html, 'og:image') || extractMetaContent(html, 'twitter:image'),
      siteName: extractMetaContent(html, 'og:site_name'),
      favicon: `${parsedUrl.origin}/favicon.ico`,
    };

    // Make image URL absolute if relative
    if (preview.image && !preview.image.startsWith('http')) {
      preview.image = new URL(preview.image, parsedUrl.origin).href;
    }

    return new Response(
      JSON.stringify(preview),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Link preview error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch link preview' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractMetaContent(html: string, property: string): string | null {
  // Try og: and twitter: meta tags
  const ogMatch = html.match(new RegExp(`<meta[^>]+(?:property|name)=["'](?:og:|twitter:)?${property}["'][^>]+content=["']([^"']+)["']`, 'i'));
  if (ogMatch) return ogMatch[1];

  // Try content before property/name
  const reverseMatch = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:|twitter:)?${property}["']`, 'i'));
  if (reverseMatch) return reverseMatch[1];

  // Try name-based meta tags (for description)
  if (property === 'description') {
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    if (descMatch) return descMatch[1];

    const descReverseMatch = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    if (descReverseMatch) return descReverseMatch[1];
  }

  return null;
}

function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : null;
}
