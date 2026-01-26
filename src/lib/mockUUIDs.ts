/**
 * Mock UUID Generator & Storage
 * 
 * Generates and persists stable UUIDs for mock entities.
 * UUIDs are stored in localStorage to remain consistent across refreshes.
 * Uses a deterministic seeded approach for initial generation.
 */

const STORAGE_KEY = 'selfiera_mock_uuids';

// Type-safe UUID v4 format validator
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface MockUUIDRegistry {
  // Posts
  posts: Record<string, string>;
  // Authors (users)
  authors: Record<string, string>;
  // Expressions
  expressions: Record<string, string>;
  // Comments
  comments: Record<string, string>;
  // Conversations
  conversations: Record<string, string>;
  // Communities
  communities: Record<string, string>;
  // Notifications
  notifications: Record<string, string>;
  // Generic entities
  generic: Record<string, string>;
}

// Seeded random number generator for deterministic UUIDs
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// Generate a UUID v4 using a seeded random generator
function generateSeededUUID(seed: string): string {
  const random = seededRandom(seed);
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  
  return template.replace(/[xy]/g, (c) => {
    const r = Math.floor(random() * 16);
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Generate a random UUID v4
function generateRandomUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Validate UUID format
export function isValidUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid);
}

// Create empty registry
function createEmptyRegistry(): MockUUIDRegistry {
  return {
    posts: {},
    authors: {},
    expressions: {},
    comments: {},
    conversations: {},
    communities: {},
    notifications: {},
    generic: {},
  };
}

// Load registry from localStorage
function loadRegistry(): MockUUIDRegistry {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createEmptyRegistry();
    
    const parsed = JSON.parse(stored);
    return {
      posts: parsed.posts || {},
      authors: parsed.authors || {},
      expressions: parsed.expressions || {},
      comments: parsed.comments || {},
      conversations: parsed.conversations || {},
      communities: parsed.communities || {},
      notifications: parsed.notifications || {},
      generic: parsed.generic || {},
    };
  } catch {
    return createEmptyRegistry();
  }
}

// Save registry to localStorage
function saveRegistry(registry: MockUUIDRegistry): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
  } catch (e) {
    console.warn('Failed to persist mock UUIDs:', e);
  }
}

// Singleton registry instance
let registry: MockUUIDRegistry | null = null;

function getRegistry(): MockUUIDRegistry {
  if (!registry) {
    registry = loadRegistry();
  }
  return registry;
}

// =============================================================================
// PUBLIC API
// =============================================================================

export type MockEntityType = keyof Omit<MockUUIDRegistry, 'generic'>;

/**
 * Get or create a stable UUID for a mock entity.
 * If a UUID already exists for the semantic key, it returns the existing one.
 * Otherwise, it generates a new seeded UUID and persists it.
 */
export function getMockUUID(entityType: MockEntityType | 'generic', semanticKey: string): string {
  const reg = getRegistry();
  const category = reg[entityType];
  
  // Return existing UUID if available
  if (category[semanticKey]) {
    return category[semanticKey];
  }
  
  // Generate new seeded UUID based on entity type and semantic key
  const seed = `selfiera:${entityType}:${semanticKey}`;
  const uuid = generateSeededUUID(seed);
  
  // Store and persist
  category[semanticKey] = uuid;
  saveRegistry(reg);
  
  return uuid;
}

/**
 * Generate a new random UUID (for dynamically created content)
 */
export function generateMockUUID(): string {
  return generateRandomUUID();
}

/**
 * Batch get/create UUIDs for multiple entities
 */
export function getMockUUIDs(entityType: MockEntityType | 'generic', semanticKeys: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of semanticKeys) {
    result[key] = getMockUUID(entityType, key);
  }
  return result;
}

/**
 * Pre-defined semantic keys for initial mock data
 */
export const MOCK_ENTITY_KEYS = {
  // Authors/Users
  authors: {
    SARAH_CHEN: 'sarah-chen',
    MIND_MATTERS: 'mind-matters',
    CALM_STUDIOS: 'calm-studios',
    JAMES_WILSON: 'james-wilson',
    WELLNESS_HUB: 'wellness-hub',
    NATURE_SOUNDS: 'nature-sounds',
    EMMA_ROBERTS: 'emma-roberts',
    ALEX_TURNER: 'alex-turner',
    JENNIFER: 'jennifer',
    CODY: 'cody',
    AMY: 'amy',
    TRENT: 'trent',
    DONNA: 'donna',
    MARCUS: 'marcus',
    MARCUS_JOHNSON: 'marcus-johnson',
    JAMIE_LEE: 'jamie-lee',
    ALEX_CHEN: 'alex-chen',
  },
  
  // Posts
  posts: {
    POST_1: 'post-1',
    POST_2: 'post-2',
    POST_3: 'post-3',
    POST_4: 'post-4',
    POST_5: 'post-5',
    POST_6: 'post-6',
    POST_VIDEO_1: 'post-video-1',
    POST_VIDEO_2: 'post-video-2',
  },
  
  // Expressions
  expressions: {
    EXPR_1: 'expr-1',
    EXPR_2: 'expr-2',
    EXPR_3: 'expr-3',
    EXPR_4: 'expr-4',
    EXPR_5: 'expr-5',
    EXPR_6: 'expr-6',
  },
  
  // Comments
  comments: {
    COMMENT_1_1: 'comment-1-1',
    COMMENT_1_2: 'comment-1-2',
    COMMENT_2_1: 'comment-2-1',
  },
  
  // Conversations
  conversations: {
    CONV_1: 'conv-1',
    CONV_2: 'conv-2',
    CONV_3: 'conv-3',
  },
  
  // Communities
  communities: {
    MINDFULNESS: 'mindfulness-circle',
    ANXIETY_SUPPORT: 'anxiety-support',
    SELF_CARE: 'self-care-club',
    WELLNESS_WARRIORS: 'wellness-warriors',
    GRATITUDE: 'gratitude-journal',
  },
} as const;

// =============================================================================
// PRE-GENERATED UUIDs FOR QUICK ACCESS
// =============================================================================

// These getters provide easy access to commonly used mock UUIDs
export const MockUUIDs = {
  // Authors
  get SARAH_CHEN() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.SARAH_CHEN); },
  get MIND_MATTERS() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.MIND_MATTERS); },
  get CALM_STUDIOS() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.CALM_STUDIOS); },
  get JAMES_WILSON() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.JAMES_WILSON); },
  get WELLNESS_HUB() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.WELLNESS_HUB); },
  get NATURE_SOUNDS() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.NATURE_SOUNDS); },
  get EMMA_ROBERTS() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.EMMA_ROBERTS); },
  get ALEX_TURNER() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.ALEX_TURNER); },
  get JENNIFER() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.JENNIFER); },
  get CODY() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.CODY); },
  get AMY() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.AMY); },
  get TRENT() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.TRENT); },
  get DONNA() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.DONNA); },
  get MARCUS() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.MARCUS); },
  get MARCUS_JOHNSON() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.MARCUS_JOHNSON); },
  get JAMIE_LEE() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.JAMIE_LEE); },
  get ALEX_CHEN() { return getMockUUID('authors', MOCK_ENTITY_KEYS.authors.ALEX_CHEN); },
  
  // Posts
  get POST_1() { return getMockUUID('posts', MOCK_ENTITY_KEYS.posts.POST_1); },
  get POST_2() { return getMockUUID('posts', MOCK_ENTITY_KEYS.posts.POST_2); },
  get POST_3() { return getMockUUID('posts', MOCK_ENTITY_KEYS.posts.POST_3); },
  get POST_4() { return getMockUUID('posts', MOCK_ENTITY_KEYS.posts.POST_4); },
  get POST_5() { return getMockUUID('posts', MOCK_ENTITY_KEYS.posts.POST_5); },
  get POST_6() { return getMockUUID('posts', MOCK_ENTITY_KEYS.posts.POST_6); },
  get POST_VIDEO_1() { return getMockUUID('posts', MOCK_ENTITY_KEYS.posts.POST_VIDEO_1); },
  get POST_VIDEO_2() { return getMockUUID('posts', MOCK_ENTITY_KEYS.posts.POST_VIDEO_2); },
  
  // Expressions
  get EXPR_1() { return getMockUUID('expressions', MOCK_ENTITY_KEYS.expressions.EXPR_1); },
  get EXPR_2() { return getMockUUID('expressions', MOCK_ENTITY_KEYS.expressions.EXPR_2); },
  get EXPR_3() { return getMockUUID('expressions', MOCK_ENTITY_KEYS.expressions.EXPR_3); },
  get EXPR_4() { return getMockUUID('expressions', MOCK_ENTITY_KEYS.expressions.EXPR_4); },
  get EXPR_5() { return getMockUUID('expressions', MOCK_ENTITY_KEYS.expressions.EXPR_5); },
  get EXPR_6() { return getMockUUID('expressions', MOCK_ENTITY_KEYS.expressions.EXPR_6); },
  
  // Comments
  get COMMENT_1_1() { return getMockUUID('comments', MOCK_ENTITY_KEYS.comments.COMMENT_1_1); },
  get COMMENT_1_2() { return getMockUUID('comments', MOCK_ENTITY_KEYS.comments.COMMENT_1_2); },
  get COMMENT_2_1() { return getMockUUID('comments', MOCK_ENTITY_KEYS.comments.COMMENT_2_1); },
  
  // Conversations
  get CONV_1() { return getMockUUID('conversations', MOCK_ENTITY_KEYS.conversations.CONV_1); },
  get CONV_2() { return getMockUUID('conversations', MOCK_ENTITY_KEYS.conversations.CONV_2); },
  get CONV_3() { return getMockUUID('conversations', MOCK_ENTITY_KEYS.conversations.CONV_3); },
  
  // Communities
  get MINDFULNESS() { return getMockUUID('communities', MOCK_ENTITY_KEYS.communities.MINDFULNESS); },
  get ANXIETY_SUPPORT() { return getMockUUID('communities', MOCK_ENTITY_KEYS.communities.ANXIETY_SUPPORT); },
  get SELF_CARE() { return getMockUUID('communities', MOCK_ENTITY_KEYS.communities.SELF_CARE); },
  get WELLNESS_WARRIORS() { return getMockUUID('communities', MOCK_ENTITY_KEYS.communities.WELLNESS_WARRIORS); },
  get GRATITUDE() { return getMockUUID('communities', MOCK_ENTITY_KEYS.communities.GRATITUDE); },
};
