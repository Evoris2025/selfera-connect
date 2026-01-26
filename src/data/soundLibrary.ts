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
  // Ambient
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
  
  // Meditation
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
  
  // Lo-Fi
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
  
  // Uplifting
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
  
  // Nature
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
  
  // Sound Effects
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
