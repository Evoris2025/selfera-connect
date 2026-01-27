/**
 * Sound Library Data
 * Royalty-free sound collection for Expressions
 * Note: In production, these would link to actual audio files
 */

export interface SoundData {
  id: string;
  name: string;
  artist: string;
  category: string;
  duration: number; // in seconds
  previewUrl?: string; // For future implementation
  tags: string[];
  isTrending?: boolean;
}

export const soundCategories = [
  'All',
  'Trending',
  'Ambient',
  'Meditation',
  'Lo-Fi',
  'Uplifting',
  'Nature',
  'Sound Effects',
] as const;

export type SoundCategory = typeof soundCategories[number];

export const soundLibrary: SoundData[] = [
  // ============================================
  // AMBIENT - Nature & Environmental Sounds
  // ============================================
  { 
    id: 'amb1', 
    name: 'Ocean Waves', 
    artist: 'Nature Sounds', 
    category: 'Ambient', 
    duration: 30,
    tags: ['ocean', 'waves', 'calm', 'water'],
    isTrending: true,
  },
  { 
    id: 'amb2', 
    name: 'Rain on Window', 
    artist: 'Calm Studios', 
    category: 'Ambient', 
    duration: 30,
    tags: ['rain', 'cozy', 'relaxing', 'storm'],
  },
  { 
    id: 'amb3', 
    name: 'Forest Birds', 
    artist: 'Nature Sounds', 
    category: 'Ambient', 
    duration: 30,
    tags: ['birds', 'forest', 'nature', 'morning'],
  },
  { 
    id: 'amb4', 
    name: 'Gentle Stream', 
    artist: 'Zen Collection', 
    category: 'Ambient', 
    duration: 30,
    tags: ['water', 'stream', 'peaceful', 'nature'],
  },
  { 
    id: 'amb5', 
    name: 'Wind Chimes', 
    artist: 'Meditation Mix', 
    category: 'Ambient', 
    duration: 30,
    tags: ['chimes', 'wind', 'peaceful', 'zen'],
    isTrending: true,
  },
  { 
    id: 'amb6', 
    name: 'Crackling Fire', 
    artist: 'Cozy Sounds', 
    category: 'Ambient', 
    duration: 30,
    tags: ['fire', 'warm', 'cozy', 'winter'],
  },
  { 
    id: 'amb7', 
    name: 'Desert Night', 
    artist: 'Ambient Journeys', 
    category: 'Ambient', 
    duration: 45,
    tags: ['desert', 'night', 'crickets', 'stars'],
  },
  { 
    id: 'amb8', 
    name: 'Tropical Rainforest', 
    artist: 'Jungle Sounds', 
    category: 'Ambient', 
    duration: 60,
    tags: ['rainforest', 'jungle', 'tropical', 'exotic'],
  },
  { 
    id: 'amb9', 
    name: 'Arctic Wind', 
    artist: 'Polar Audio', 
    category: 'Ambient', 
    duration: 30,
    tags: ['arctic', 'wind', 'cold', 'winter'],
  },
  { 
    id: 'amb10', 
    name: 'Autumn Leaves', 
    artist: 'Seasonal Sounds', 
    category: 'Ambient', 
    duration: 30,
    tags: ['autumn', 'leaves', 'wind', 'fall'],
  },
  { 
    id: 'amb11', 
    name: 'Underwater World', 
    artist: 'Deep Dive Audio', 
    category: 'Ambient', 
    duration: 45,
    tags: ['underwater', 'bubbles', 'ocean', 'dive'],
  },
  { 
    id: 'amb12', 
    name: 'Cave Echoes', 
    artist: 'Earth Sounds', 
    category: 'Ambient', 
    duration: 30,
    tags: ['cave', 'echo', 'drips', 'mysterious'],
  },
  { 
    id: 'amb13', 
    name: 'Waterfall Cascade', 
    artist: 'Natural Wonders', 
    category: 'Ambient', 
    duration: 45,
    tags: ['waterfall', 'cascade', 'powerful', 'nature'],
    isTrending: true,
  },
  { 
    id: 'amb14', 
    name: 'Morning Meadow', 
    artist: 'Countryside Audio', 
    category: 'Ambient', 
    duration: 30,
    tags: ['meadow', 'morning', 'birds', 'peaceful'],
  },
  { 
    id: 'amb15', 
    name: 'Snowfall Silence', 
    artist: 'Winter Collection', 
    category: 'Ambient', 
    duration: 30,
    tags: ['snow', 'quiet', 'winter', 'peaceful'],
  },
  
  // ============================================
  // MEDITATION - Healing & Mindfulness
  // ============================================
  { 
    id: 'med1', 
    name: 'Tibetan Bowls', 
    artist: 'Zen Masters', 
    category: 'Meditation', 
    duration: 45,
    tags: ['singing bowls', 'zen', 'meditation', 'healing'],
    isTrending: true,
  },
  { 
    id: 'med2', 
    name: 'Om Chanting', 
    artist: 'Sacred Sounds', 
    category: 'Meditation', 
    duration: 60,
    tags: ['om', 'chant', 'spiritual', 'yoga'],
  },
  { 
    id: 'med3', 
    name: 'Healing Frequency 432Hz', 
    artist: 'Wellness Audio', 
    category: 'Meditation', 
    duration: 45,
    tags: ['432hz', 'healing', 'frequency', 'binaural'],
  },
  { 
    id: 'med4', 
    name: 'Deep Breathing Guide', 
    artist: 'Mindful Moments', 
    category: 'Meditation', 
    duration: 30,
    tags: ['breathing', 'guide', 'calm', 'anxiety'],
  },
  { 
    id: 'med5', 
    name: 'Crystal Bowls', 
    artist: 'Sound Bath', 
    category: 'Meditation', 
    duration: 45,
    tags: ['crystal', 'healing', 'vibration', 'chakra'],
  },
  { 
    id: 'med6', 
    name: 'Solfeggio 528Hz', 
    artist: 'Frequency Healing', 
    category: 'Meditation', 
    duration: 60,
    tags: ['528hz', 'solfeggio', 'dna', 'repair'],
    isTrending: true,
  },
  { 
    id: 'med7', 
    name: 'Chakra Alignment', 
    artist: 'Energy Healers', 
    category: 'Meditation', 
    duration: 90,
    tags: ['chakra', 'energy', 'balance', 'healing'],
  },
  { 
    id: 'med8', 
    name: 'Body Scan Meditation', 
    artist: 'Mindful Practice', 
    category: 'Meditation', 
    duration: 60,
    tags: ['body scan', 'relaxation', 'awareness', 'calm'],
  },
  { 
    id: 'med9', 
    name: 'Theta Waves', 
    artist: 'Brainwave Audio', 
    category: 'Meditation', 
    duration: 45,
    tags: ['theta', 'brainwaves', 'deep', 'meditation'],
  },
  { 
    id: 'med10', 
    name: 'Zen Garden', 
    artist: 'Japanese Wellness', 
    category: 'Meditation', 
    duration: 45,
    tags: ['zen', 'garden', 'japanese', 'tranquil'],
  },
  { 
    id: 'med11', 
    name: 'Delta Sleep Waves', 
    artist: 'Sleep Science', 
    category: 'Meditation', 
    duration: 60,
    tags: ['delta', 'sleep', 'deep', 'rest'],
  },
  { 
    id: 'med12', 
    name: 'Shamanic Drums', 
    artist: 'Ancient Rhythms', 
    category: 'Meditation', 
    duration: 45,
    tags: ['drums', 'shamanic', 'tribal', 'journey'],
  },
  { 
    id: 'med13', 
    name: 'Reiki Healing', 
    artist: 'Energy Flow', 
    category: 'Meditation', 
    duration: 60,
    tags: ['reiki', 'healing', 'energy', 'wellness'],
  },
  { 
    id: 'med14', 
    name: 'Gong Bath', 
    artist: 'Sound Healers', 
    category: 'Meditation', 
    duration: 45,
    tags: ['gong', 'bath', 'vibration', 'healing'],
  },
  { 
    id: 'med15', 
    name: 'Mantra Meditation', 
    artist: 'Sacred Chants', 
    category: 'Meditation', 
    duration: 60,
    tags: ['mantra', 'chant', 'spiritual', 'repetition'],
  },
  
  // ============================================
  // LO-FI - Chill Beats & Study Music
  // ============================================
  { 
    id: 'lofi1', 
    name: 'Study Beats', 
    artist: 'Lo-Fi Hip Hop', 
    category: 'Lo-Fi', 
    duration: 30,
    tags: ['study', 'chill', 'beats', 'focus'],
    isTrending: true,
  },
  { 
    id: 'lofi2', 
    name: 'Chill Vibes', 
    artist: 'Relaxation Station', 
    category: 'Lo-Fi', 
    duration: 30,
    tags: ['chill', 'relax', 'vibes', 'mellow'],
  },
  { 
    id: 'lofi3', 
    name: 'Cozy Afternoon', 
    artist: 'Lo-Fi Dreams', 
    category: 'Lo-Fi', 
    duration: 30,
    tags: ['cozy', 'afternoon', 'warm', 'lazy'],
  },
  { 
    id: 'lofi4', 
    name: 'Late Night Jazz', 
    artist: 'Midnight Beats', 
    category: 'Lo-Fi', 
    duration: 30,
    tags: ['jazz', 'night', 'smooth', 'saxophone'],
  },
  { 
    id: 'lofi5', 
    name: 'Coffee Shop', 
    artist: 'Urban Sounds', 
    category: 'Lo-Fi', 
    duration: 30,
    tags: ['coffee', 'cafe', 'ambient', 'chatter'],
  },
  { 
    id: 'lofi6', 
    name: 'Rainy Day Beats', 
    artist: 'Lo-Fi Weather', 
    category: 'Lo-Fi', 
    duration: 30,
    tags: ['rain', 'beats', 'cozy', 'relaxing'],
    isTrending: true,
  },
  { 
    id: 'lofi7', 
    name: 'Sunset Drive', 
    artist: 'Chill Journey', 
    category: 'Lo-Fi', 
    duration: 30,
    tags: ['sunset', 'drive', 'nostalgic', 'warm'],
  },
  { 
    id: 'lofi8', 
    name: 'Vintage Vinyl', 
    artist: 'Retro Beats', 
    category: 'Lo-Fi', 
    duration: 30,
    tags: ['vinyl', 'vintage', 'crackle', 'nostalgic'],
  },
  { 
    id: 'lofi9', 
    name: 'Tokyo Nights', 
    artist: 'City Lo-Fi', 
    category: 'Lo-Fi', 
    duration: 30,
    tags: ['tokyo', 'city', 'night', 'neon'],
  },
  { 
    id: 'lofi10', 
    name: 'Sleepy Piano', 
    artist: 'Gentle Keys', 
    category: 'Lo-Fi', 
    duration: 30,
    tags: ['piano', 'sleepy', 'soft', 'gentle'],
  },
  { 
    id: 'lofi11', 
    name: 'Bookstore Vibes', 
    artist: 'Quiet Places', 
    category: 'Lo-Fi', 
    duration: 30,
    tags: ['bookstore', 'quiet', 'reading', 'peaceful'],
  },
  { 
    id: 'lofi12', 
    name: 'Sunday Morning', 
    artist: 'Weekend Beats', 
    category: 'Lo-Fi', 
    duration: 30,
    tags: ['sunday', 'morning', 'lazy', 'peaceful'],
  },
  
  // ============================================
  // UPLIFTING - Motivation & Energy
  // ============================================
  { 
    id: 'up1', 
    name: 'Morning Motivation', 
    artist: 'Positive Energy', 
    category: 'Uplifting', 
    duration: 30,
    tags: ['motivation', 'morning', 'energy', 'inspire'],
    isTrending: true,
  },
  { 
    id: 'up2', 
    name: 'New Beginnings', 
    artist: 'Inspire Audio', 
    category: 'Uplifting', 
    duration: 30,
    tags: ['new', 'start', 'hope', 'fresh'],
  },
  { 
    id: 'up3', 
    name: 'Rise & Shine', 
    artist: 'Wellness Beats', 
    category: 'Uplifting', 
    duration: 30,
    tags: ['rise', 'morning', 'happy', 'energetic'],
  },
  { 
    id: 'up4', 
    name: 'Victory Dance', 
    artist: 'Celebration Mix', 
    category: 'Uplifting', 
    duration: 30,
    tags: ['victory', 'celebrate', 'win', 'dance'],
  },
  { 
    id: 'up5', 
    name: 'Golden Hour', 
    artist: 'Sunset Vibes', 
    category: 'Uplifting', 
    duration: 30,
    tags: ['golden', 'sunset', 'warm', 'beautiful'],
  },
  { 
    id: 'up6', 
    name: 'Breakthrough', 
    artist: 'Power Audio', 
    category: 'Uplifting', 
    duration: 30,
    tags: ['breakthrough', 'powerful', 'achieve', 'success'],
    isTrending: true,
  },
  { 
    id: 'up7', 
    name: 'Grateful Heart', 
    artist: 'Thankful Sounds', 
    category: 'Uplifting', 
    duration: 30,
    tags: ['grateful', 'thankful', 'appreciation', 'love'],
  },
  { 
    id: 'up8', 
    name: 'Adventure Awaits', 
    artist: 'Journey Music', 
    category: 'Uplifting', 
    duration: 30,
    tags: ['adventure', 'journey', 'explore', 'exciting'],
  },
  { 
    id: 'up9', 
    name: 'Sunrise Energy', 
    artist: 'Dawn Collection', 
    category: 'Uplifting', 
    duration: 30,
    tags: ['sunrise', 'energy', 'fresh', 'awakening'],
  },
  { 
    id: 'up10', 
    name: 'Joyful Spirit', 
    artist: 'Happy Vibes', 
    category: 'Uplifting', 
    duration: 30,
    tags: ['joyful', 'happy', 'spirit', 'light'],
  },
  
  // ============================================
  // NATURE - Pure Environmental Recordings
  // ============================================
  { 
    id: 'nat1', 
    name: 'Thunderstorm', 
    artist: 'Storm Chasers', 
    category: 'Nature', 
    duration: 30,
    tags: ['thunder', 'storm', 'rain', 'lightning'],
  },
  { 
    id: 'nat2', 
    name: 'Mountain Wind', 
    artist: 'Altitude Audio', 
    category: 'Nature', 
    duration: 30,
    tags: ['wind', 'mountain', 'air', 'high'],
  },
  { 
    id: 'nat3', 
    name: 'Whale Song', 
    artist: 'Deep Ocean', 
    category: 'Nature', 
    duration: 45,
    tags: ['whale', 'ocean', 'deep', 'mysterious'],
  },
  { 
    id: 'nat4', 
    name: 'Tropical Beach', 
    artist: 'Island Sounds', 
    category: 'Nature', 
    duration: 45,
    tags: ['beach', 'tropical', 'waves', 'palm'],
    isTrending: true,
  },
  { 
    id: 'nat5', 
    name: 'Night Crickets', 
    artist: 'Evening Sounds', 
    category: 'Nature', 
    duration: 30,
    tags: ['crickets', 'night', 'summer', 'peaceful'],
  },
  { 
    id: 'nat6', 
    name: 'Frog Pond', 
    artist: 'Wetland Audio', 
    category: 'Nature', 
    duration: 30,
    tags: ['frogs', 'pond', 'night', 'nature'],
  },
  { 
    id: 'nat7', 
    name: 'Owl Calls', 
    artist: 'Nocturnal Sounds', 
    category: 'Nature', 
    duration: 30,
    tags: ['owl', 'night', 'forest', 'mysterious'],
  },
  { 
    id: 'nat8', 
    name: 'Bamboo Forest', 
    artist: 'Asian Nature', 
    category: 'Nature', 
    duration: 45,
    tags: ['bamboo', 'forest', 'wind', 'asian'],
  },
  { 
    id: 'nat9', 
    name: 'Rocky Shore', 
    artist: 'Coastal Audio', 
    category: 'Nature', 
    duration: 30,
    tags: ['rocks', 'shore', 'waves', 'sea'],
  },
  { 
    id: 'nat10', 
    name: 'Savanna Dawn', 
    artist: 'African Sounds', 
    category: 'Nature', 
    duration: 45,
    tags: ['savanna', 'africa', 'dawn', 'wildlife'],
  },
  { 
    id: 'nat11', 
    name: 'Spring Rain', 
    artist: 'Seasonal Sounds', 
    category: 'Nature', 
    duration: 30,
    tags: ['spring', 'rain', 'gentle', 'fresh'],
  },
  { 
    id: 'nat12', 
    name: 'Lake Loons', 
    artist: 'Lake Sounds', 
    category: 'Nature', 
    duration: 30,
    tags: ['loons', 'lake', 'calm', 'evening'],
  },
  { 
    id: 'nat13', 
    name: 'Seagulls Harbor', 
    artist: 'Coastal Life', 
    category: 'Nature', 
    duration: 30,
    tags: ['seagulls', 'harbor', 'ocean', 'coastal'],
  },
  { 
    id: 'nat14', 
    name: 'Wolf Howl', 
    artist: 'Wild Audio', 
    category: 'Nature', 
    duration: 30,
    tags: ['wolf', 'howl', 'wild', 'mysterious'],
  },
  { 
    id: 'nat15', 
    name: 'Cicada Summer', 
    artist: 'Summer Sounds', 
    category: 'Nature', 
    duration: 30,
    tags: ['cicada', 'summer', 'hot', 'afternoon'],
  },
  
  // ============================================
  // SOUND EFFECTS - Transitions & Accents
  // ============================================
  { 
    id: 'sfx1', 
    name: 'Whoosh Transition', 
    artist: 'SFX Library', 
    category: 'Sound Effects', 
    duration: 2,
    tags: ['whoosh', 'transition', 'swipe', 'fast'],
  },
  { 
    id: 'sfx2', 
    name: 'Magic Sparkle', 
    artist: 'SFX Library', 
    category: 'Sound Effects', 
    duration: 3,
    tags: ['magic', 'sparkle', 'fairy', 'enchant'],
  },
  { 
    id: 'sfx3', 
    name: 'Notification Ding', 
    artist: 'SFX Library', 
    category: 'Sound Effects', 
    duration: 1,
    tags: ['ding', 'notification', 'alert', 'ping'],
  },
  { 
    id: 'sfx4', 
    name: 'Heart Beat', 
    artist: 'SFX Library', 
    category: 'Sound Effects', 
    duration: 5,
    tags: ['heart', 'beat', 'pulse', 'dramatic'],
  },
  { 
    id: 'sfx5', 
    name: 'Camera Shutter', 
    artist: 'SFX Library', 
    category: 'Sound Effects', 
    duration: 1,
    tags: ['camera', 'shutter', 'photo', 'click'],
  },
  { 
    id: 'sfx6', 
    name: 'Bubble Pop', 
    artist: 'SFX Library', 
    category: 'Sound Effects', 
    duration: 1,
    tags: ['bubble', 'pop', 'fun', 'playful'],
  },
  { 
    id: 'sfx7', 
    name: 'Wind Gust', 
    artist: 'SFX Library', 
    category: 'Sound Effects', 
    duration: 3,
    tags: ['wind', 'gust', 'dramatic', 'nature'],
  },
  { 
    id: 'sfx8', 
    name: 'Shimmer Rise', 
    artist: 'SFX Library', 
    category: 'Sound Effects', 
    duration: 2,
    tags: ['shimmer', 'rise', 'magical', 'ascending'],
  },
  { 
    id: 'sfx9', 
    name: 'Soft Chime', 
    artist: 'SFX Library', 
    category: 'Sound Effects', 
    duration: 2,
    tags: ['chime', 'soft', 'gentle', 'notification'],
  },
  { 
    id: 'sfx10', 
    name: 'Page Turn', 
    artist: 'SFX Library', 
    category: 'Sound Effects', 
    duration: 1,
    tags: ['page', 'turn', 'book', 'paper'],
  },
];

export function searchSounds(query: string, category?: SoundCategory): SoundData[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  return soundLibrary.filter((sound) => {
    const matchesCategory = !category || 
      category === 'All' || 
      (category === 'Trending' && sound.isTrending) ||
      sound.category === category;
    const matchesSearch = !normalizedQuery || 
      sound.name.toLowerCase().includes(normalizedQuery) ||
      sound.artist.toLowerCase().includes(normalizedQuery) ||
      sound.tags.some(t => t.toLowerCase().includes(normalizedQuery));
    return matchesCategory && matchesSearch;
  });
}

export function getSoundsByCategory(category: SoundCategory): SoundData[] {
  if (category === 'All') return soundLibrary;
  if (category === 'Trending') return soundLibrary.filter(s => s.isTrending);
  return soundLibrary.filter(s => s.category === category);
}

export function getTrendingSounds(limit: number = 5): SoundData[] {
  return soundLibrary.filter(s => s.isTrending).slice(0, limit);
}

export function formatSoundDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
