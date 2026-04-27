// Lightweight client-side rotation of writing prompts.
// TODO: replace with a backend endpoint (e.g. /api/prompts/today) so prompts
// are editorially curated and synced across users.
const PROMPTS = [
  "What's something small that brought you joy this week?",
  "Name one thing you're learning to let go of.",
  "Who in your life are you grateful for right now, and why?",
  "Describe a moment today that felt like yours.",
  "What does rest look like for you this season?",
  "Share a tiny win — anything counts.",
  "What's a kind thing you could say to your past self?",
  "What's one boundary you're proud of holding?",
  "When did you last feel fully present?",
  "What's a question you're sitting with lately?",
];

function dayOfYear(d = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getTodayPrompt(): string {
  return PROMPTS[dayOfYear() % PROMPTS.length];
}
