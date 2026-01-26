import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GifResult {
  id: string;
  url: string;
  previewUrl: string;
  title: string;
  width: number;
  height: number;
}

// Mock GIF data for simulation (since we don't have a Giphy API key)
const mockGifs: GifResult[] = [
  { id: 'g1', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', previewUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200w.gif', title: 'Happy Dance', width: 480, height: 270 },
  { id: 'g2', url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', previewUrl: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/200w.gif', title: 'Celebrate', width: 480, height: 270 },
  { id: 'g3', url: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif', previewUrl: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/200w.gif', title: 'Heart', width: 480, height: 480 },
  { id: 'g4', url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', previewUrl: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/200w.gif', title: 'Mindfulness', width: 480, height: 270 },
  { id: 'g5', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', previewUrl: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200w.gif', title: 'Peaceful', width: 480, height: 270 },
  { id: 'g6', url: 'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif', previewUrl: 'https://media.giphy.com/media/5GoVLqeAOo6PK/200w.gif', title: 'Nature', width: 500, height: 281 },
  { id: 'g7', url: 'https://media.giphy.com/media/l378bu6ZYmzS6nBrW/giphy.gif', previewUrl: 'https://media.giphy.com/media/l378bu6ZYmzS6nBrW/200w.gif', title: 'Gratitude', width: 480, height: 350 },
  { id: 'g8', url: 'https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif', previewUrl: 'https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/200w.gif', title: 'Breathe', width: 480, height: 360 },
];

const trendingGifs: GifResult[] = [
  { id: 't1', url: 'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif', previewUrl: 'https://media.giphy.com/media/5GoVLqeAOo6PK/200w.gif', title: 'Nature Trending', width: 500, height: 281 },
  { id: 't2', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', previewUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200w.gif', title: 'Dance Trending', width: 480, height: 270 },
  { id: 't3', url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', previewUrl: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/200w.gif', title: 'Celebration', width: 480, height: 270 },
  { id: 't4', url: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif', previewUrl: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/200w.gif', title: 'Love', width: 480, height: 480 },
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    const type = url.searchParams.get('type') || 'search'; // 'search' or 'trending'
    const limit = parseInt(url.searchParams.get('limit') || '20');

    let results: GifResult[];

    if (type === 'trending' || !query) {
      // Return trending GIFs
      results = trendingGifs.slice(0, limit);
    } else {
      // Search GIFs (mock implementation)
      const lowerQuery = query.toLowerCase();
      results = mockGifs.filter(gif => 
        gif.title.toLowerCase().includes(lowerQuery)
      ).slice(0, limit);

      // If no matches, return all mock GIFs as fallback
      if (results.length === 0) {
        results = mockGifs.slice(0, limit);
      }
    }

    return new Response(
      JSON.stringify({ 
        data: results,
        pagination: {
          total_count: results.length,
          count: results.length,
          offset: 0,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('GIF search error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to search GIFs' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
