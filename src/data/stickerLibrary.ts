/**
 * Sticker Library Data
 * Curated collection of emoji-based stickers for Expressions
 */

export interface StickerData {
  id: string;
  emoji: string;
  category: string;
  keywords: string[];
}

export const stickerCategories = [
  'All',
  'Emotions',
  'Wellness', 
  'Nature',
  'Reactions',
  'Activities',
  'Symbols',
] as const;

export type StickerCategory = typeof stickerCategories[number];

export const stickerLibrary: StickerData[] = [
  // Emotions
  { id: 'e1', emoji: '😊', category: 'Emotions', keywords: ['happy', 'smile', 'joy', 'glad'] },
  { id: 'e2', emoji: '😢', category: 'Emotions', keywords: ['sad', 'cry', 'tears', 'upset'] },
  { id: 'e3', emoji: '😍', category: 'Emotions', keywords: ['love', 'heart eyes', 'adore'] },
  { id: 'e4', emoji: '🥰', category: 'Emotions', keywords: ['love', 'hearts', 'affection', 'cute'] },
  { id: 'e5', emoji: '😌', category: 'Emotions', keywords: ['calm', 'peaceful', 'relief', 'content'] },
  { id: 'e6', emoji: '🤗', category: 'Emotions', keywords: ['hug', 'embrace', 'support', 'warm'] },
  { id: 'e7', emoji: '😤', category: 'Emotions', keywords: ['frustrated', 'angry', 'steam', 'mad'] },
  { id: 'e8', emoji: '🥺', category: 'Emotions', keywords: ['pleading', 'uwu', 'cute', 'puppy'] },
  { id: 'e9', emoji: '😮', category: 'Emotions', keywords: ['wow', 'surprised', 'shocked', 'amazed'] },
  { id: 'e10', emoji: '🤔', category: 'Emotions', keywords: ['thinking', 'hmm', 'curious', 'wondering'] },
  { id: 'e11', emoji: '😅', category: 'Emotions', keywords: ['nervous', 'sweat', 'awkward', 'oops'] },
  { id: 'e12', emoji: '🥳', category: 'Emotions', keywords: ['party', 'celebrate', 'birthday', 'yay'] },
  
  // Wellness
  { id: 'w1', emoji: '🧘', category: 'Wellness', keywords: ['yoga', 'meditation', 'zen', 'mindful'] },
  { id: 'w2', emoji: '💪', category: 'Wellness', keywords: ['strong', 'workout', 'strength', 'gym'] },
  { id: 'w3', emoji: '🌿', category: 'Wellness', keywords: ['nature', 'plant', 'growth', 'green'] },
  { id: 'w4', emoji: '☀️', category: 'Wellness', keywords: ['sun', 'bright', 'positive', 'morning'] },
  { id: 'w5', emoji: '🌈', category: 'Wellness', keywords: ['rainbow', 'hope', 'pride', 'colorful'] },
  { id: 'w6', emoji: '✨', category: 'Wellness', keywords: ['sparkle', 'magic', 'special', 'shine'] },
  { id: 'w7', emoji: '🦋', category: 'Wellness', keywords: ['butterfly', 'transform', 'change', 'growth'] },
  { id: 'w8', emoji: '🌸', category: 'Wellness', keywords: ['flower', 'cherry', 'bloom', 'spring'] },
  { id: 'w9', emoji: '🍃', category: 'Wellness', keywords: ['leaf', 'wind', 'nature', 'fresh'] },
  { id: 'w10', emoji: '💆', category: 'Wellness', keywords: ['massage', 'relax', 'spa', 'selfcare'] },
  { id: 'w11', emoji: '🧠', category: 'Wellness', keywords: ['brain', 'mental', 'mind', 'think'] },
  { id: 'w12', emoji: '💗', category: 'Wellness', keywords: ['heart', 'love', 'care', 'health'] },
  
  // Nature
  { id: 'n1', emoji: '🌊', category: 'Nature', keywords: ['wave', 'ocean', 'water', 'sea'] },
  { id: 'n2', emoji: '🌲', category: 'Nature', keywords: ['tree', 'forest', 'nature', 'pine'] },
  { id: 'n3', emoji: '🌙', category: 'Nature', keywords: ['moon', 'night', 'sleep', 'dream'] },
  { id: 'n4', emoji: '⭐', category: 'Nature', keywords: ['star', 'shine', 'night', 'wish'] },
  { id: 'n5', emoji: '🔥', category: 'Nature', keywords: ['fire', 'hot', 'lit', 'flames'] },
  { id: 'n6', emoji: '❄️', category: 'Nature', keywords: ['snow', 'cold', 'winter', 'ice'] },
  { id: 'n7', emoji: '🌻', category: 'Nature', keywords: ['sunflower', 'happy', 'yellow', 'summer'] },
  { id: 'n8', emoji: '🌺', category: 'Nature', keywords: ['hibiscus', 'tropical', 'flower', 'hawaii'] },
  { id: 'n9', emoji: '🌴', category: 'Nature', keywords: ['palm', 'beach', 'tropical', 'vacation'] },
  { id: 'n10', emoji: '🌅', category: 'Nature', keywords: ['sunset', 'sunrise', 'horizon', 'beautiful'] },
  
  // Reactions
  { id: 'r1', emoji: '❤️', category: 'Reactions', keywords: ['heart', 'love', 'like', 'red'] },
  { id: 'r2', emoji: '💯', category: 'Reactions', keywords: ['hundred', 'perfect', 'yes', 'score'] },
  { id: 'r3', emoji: '👏', category: 'Reactions', keywords: ['clap', 'applause', 'congrats', 'bravo'] },
  { id: 'r4', emoji: '🙌', category: 'Reactions', keywords: ['celebrate', 'praise', 'hands', 'yay'] },
  { id: 'r5', emoji: '💖', category: 'Reactions', keywords: ['sparkle heart', 'love', 'cute', 'pink'] },
  { id: 'r6', emoji: '🤝', category: 'Reactions', keywords: ['handshake', 'agree', 'deal', 'together'] },
  { id: 'r7', emoji: '💫', category: 'Reactions', keywords: ['dizzy', 'star', 'amazing', 'wow'] },
  { id: 'r8', emoji: '🎉', category: 'Reactions', keywords: ['party', 'celebrate', 'confetti', 'yay'] },
  { id: 'r9', emoji: '👍', category: 'Reactions', keywords: ['thumbs up', 'yes', 'good', 'approve'] },
  { id: 'r10', emoji: '🤩', category: 'Reactions', keywords: ['star struck', 'amazed', 'excited', 'wow'] },
  
  // Activities
  { id: 'a1', emoji: '🏃', category: 'Activities', keywords: ['run', 'exercise', 'jog', 'fitness'] },
  { id: 'a2', emoji: '🚴', category: 'Activities', keywords: ['bike', 'cycle', 'exercise', 'ride'] },
  { id: 'a3', emoji: '📚', category: 'Activities', keywords: ['book', 'read', 'study', 'learn'] },
  { id: 'a4', emoji: '🎵', category: 'Activities', keywords: ['music', 'song', 'listen', 'notes'] },
  { id: 'a5', emoji: '✍️', category: 'Activities', keywords: ['write', 'journal', 'pen', 'note'] },
  { id: 'a6', emoji: '🎨', category: 'Activities', keywords: ['art', 'paint', 'create', 'color'] },
  { id: 'a7', emoji: '🧘‍♀️', category: 'Activities', keywords: ['yoga', 'meditate', 'stretch', 'peace'] },
  { id: 'a8', emoji: '🛌', category: 'Activities', keywords: ['sleep', 'rest', 'bed', 'tired'] },
  
  // Symbols
  { id: 's1', emoji: '💭', category: 'Symbols', keywords: ['thought', 'think', 'bubble', 'dream'] },
  { id: 's2', emoji: '💬', category: 'Symbols', keywords: ['speech', 'talk', 'chat', 'message'] },
  { id: 's3', emoji: '❓', category: 'Symbols', keywords: ['question', 'ask', 'curious', 'what'] },
  { id: 's4', emoji: '❗', category: 'Symbols', keywords: ['exclamation', 'important', 'alert', 'wow'] },
  { id: 's5', emoji: '💡', category: 'Symbols', keywords: ['idea', 'light', 'bulb', 'think'] },
  { id: 's6', emoji: '🔗', category: 'Symbols', keywords: ['link', 'chain', 'connect', 'together'] },
  { id: 's7', emoji: '📍', category: 'Symbols', keywords: ['location', 'pin', 'place', 'here'] },
  { id: 's8', emoji: '🏷️', category: 'Symbols', keywords: ['tag', 'label', 'price', 'sale'] },
];

export function searchStickers(query: string, category?: StickerCategory): StickerData[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  return stickerLibrary.filter((sticker) => {
    const matchesCategory = !category || category === 'All' || sticker.category === category;
    const matchesSearch = !normalizedQuery || 
      sticker.keywords.some(k => k.toLowerCase().includes(normalizedQuery)) ||
      sticker.emoji.includes(normalizedQuery);
    return matchesCategory && matchesSearch;
  });
}

export function getStickersByCategory(category: StickerCategory): StickerData[] {
  if (category === 'All') return stickerLibrary;
  return stickerLibrary.filter(s => s.category === category);
}
