// Per-category SelfERA brand accents — used for left-edge bars, icon tints,
// and BrandSheetItem outlines. NOT user theme — user theme is reserved for
// personal identity surfaces.

export type ContentType = 'expression' | 'video' | 'image' | 'post';

export const ACCENT: Record<ContentType, string> = {
  expression: '#d946ef', // SelfERA magenta
  video:      '#8b5cf6', // SelfERA violet
  image:      '#f59e0b', // SelfERA amber (Photo)
  post:       '#2dd4bf', // SelfERA teal
};

// Map StudioContentKind ('photo') to ContentType ('image') used here.
export function kindToContentType(kind: string): ContentType {
  return (kind === 'photo' ? 'image' : kind) as ContentType;
}

// Display label per content type (shared with sheet rows).
export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  expression: 'Expression',
  video: 'Video',
  image: 'Photo',
  post: 'Post',
};
