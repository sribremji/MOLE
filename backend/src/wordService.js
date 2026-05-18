/**
 * Word Service
 *
 * Strategy:
 *  1. Start with 87 curated words that have hand-crafted single-word broad hints.
 *  2. On startup, query Datamuse API for high-frequency English nouns across
 *     several word lengths and add any that (a) we can generate a hint for
 *     and (b) pass a basic "gameable" filter.
 *  3. Track recently used words (last 20) so the same word is never repeated
 *     within the same session.
 *  4. If all network calls fail, the local bank is the fallback — the game always works.
 *
 * Hint rules: ONE WORD ONLY — broad situational/contextual association.
 *   ✓ Pizza → Party   ✓ Beach → Holiday   ✓ Hospital → Emergency
 *   ✗ Pizza → Cheese  ✗ Beach → Sand      ✗ Hospital → Doctor
 */

const { WORD_BANK } = require('./words');

// ── Utility ───────────────────────────────────────────────────────────────────

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Words that are too abstract or too short to make good game words
const BLOCK_LIST = new Set([
  'that', 'this', 'with', 'from', 'have', 'been', 'were', 'they', 'them',
  'when', 'what', 'which', 'into', 'your', 'time', 'will', 'come', 'over',
  'then', 'just', 'like', 'some', 'also', 'more', 'very', 'here', 'than',
  'only', 'such', 'each', 'same', 'both', 'many', 'most', 'long', 'much',
  'even', 'back', 'good', 'best', 'make', 'take', 'year', 'work', 'part',
  'used', 'does', 'made', 'said', 'know', 'look', 'need', 'feel', 'keep',
  'idea', 'fact', 'ways', 'data', 'area', 'unit', 'form', 'type', 'kind',
]);

// ── State ─────────────────────────────────────────────────────────────────────

const state = {
  pool: [...WORD_BANK],
  recentlyUsed: [],
  apiLoaded: false,
};

// ── Datamuse helpers ──────────────────────────────────────────────────────────

/**
 * Fetch high-frequency nouns of a given length from Datamuse.
 * Returns an array of capitalized word strings.
 */
async function fetchWordsByLength(len) {
  const pattern = '?'.repeat(len);
  const url = `https://api.datamuse.com/words?sp=${pattern}&md=fp&max=500`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const data = await res.json();

  return data
    .filter((w) => {
      if (!w.word || !/^[a-z]+$/.test(w.word)) return false;
      if (BLOCK_LIST.has(w.word)) return false;
      // Must be tagged as a noun
      if (!w.tags?.includes('n')) return false;
      // Frequency per million > 15 = moderately common word
      const freqTag = w.tags?.find((t) => t.startsWith('f:'));
      const freq = freqTag ? parseFloat(freqTag.split(':')[1]) : 0;
      return freq > 15;
    })
    .map((w) => capitalize(w.word));
}

/**
 * Generate a single broad-association hint word for the Mole.
 *
 * Strategy: fetch Datamuse trigger-words (contextually associated words)
 * then pick one that is:
 *   - a single clean word
 *   - not too similar to the target (no substring overlap, no shared 4-char prefix)
 *   - sampled from the mid-range of the list (skip the most direct/obvious hits)
 *
 * Returns a capitalized single word, or null if nothing usable is found.
 */
async function hintForWord(word) {
  const lower = word.toLowerCase();

  const url = `https://api.datamuse.com/words?rel_trg=${encodeURIComponent(lower)}&max=30`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  const data = await res.json();

  const tooSimilar = (w) => {
    if (w === lower) return true;
    if (lower.includes(w) || w.includes(lower)) return true;
    if (w.length >= 4 && lower.length >= 4 && w.slice(0, 4) === lower.slice(0, 4)) return true;
    return false;
  };

  const candidates = data
    .map((w) => w.word)
    .filter((w) => /^[a-z]+$/.test(w) && !tooSimilar(w));

  if (!candidates.length) return null;

  // Skip the first few most-direct results; sample from the broader middle range
  const start = Math.min(3, candidates.length - 1);
  const end   = Math.min(12, candidates.length);
  const pool  = candidates.slice(start, end);
  const pick  = pool[Math.floor(Math.random() * pool.length)];

  return capitalize(pick);
}

// ── Pool expansion ─────────────────────────────────────────────────────────────

async function loadAPIWords() {
  if (state.apiLoaded) return;
  state.apiLoaded = true;

  try {
    const existingLower = new Set(state.pool.map((e) => e.word.toLowerCase()));
    let added = 0;

    // Query word lengths 5, 6, 7 — sweet spot for concrete nouns
    for (const len of [5, 6, 7]) {
      let candidates;
      try {
        candidates = await fetchWordsByLength(len);
      } catch {
        continue;
      }

      for (const word of candidates) {
        if (existingLower.has(word.toLowerCase())) continue;
        if (added >= 40) break; // cap expansion at 40 new words

        let hint;
        try {
          hint = await hintForWord(word);
        } catch {
          hint = null;
        }

        if (!hint) continue; // skip if we can't produce a usable hint

        state.pool.push({ word, hint });
        existingLower.add(word.toLowerCase());
        added++;

        await sleep(100); // polite rate limit
      }

      if (added >= 40) break;
    }

    console.log(`[wordService] API expanded pool by ${added} words → total ${state.pool.length}`);
  } catch (err) {
    console.warn('[wordService] API expansion skipped:', err.message);
  }
}

// Start loading in the background — doesn't block server startup
loadAPIWords();

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns { word, hint } — never null.
 * Avoids repeating the last 20 words used; resets rotation if pool runs low.
 */
function getRandomWord() {
  const recentSet = new Set(state.recentlyUsed);
  const available = state.pool.filter((e) => !recentSet.has(e.word));
  const pool = available.length >= 5 ? available : state.pool;
  if (available.length < 5) state.recentlyUsed = [];

  const entry = pool[Math.floor(Math.random() * pool.length)];
  state.recentlyUsed.push(entry.word);
  if (state.recentlyUsed.length > 20) state.recentlyUsed.shift();

  return entry;
}

function poolSize() {
  return state.pool.length;
}

module.exports = { getRandomWord, poolSize };
