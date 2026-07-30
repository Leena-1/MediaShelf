const { GoogleGenAI } = require('@google/genai');
const crypto = require('crypto');

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
const FALLBACK_MODELS = [
  DEFAULT_MODEL,
  'gemini-3.1-flash-lite-preview',
  'gemini-2.0-flash',
].filter((model, index, list) => list.indexOf(model) === index);

// ── 15-Minute In-Memory Cache ───────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCacheKey(prompt) {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}

function getFromCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Sends a prompt to Gemini API and returns parsed JSON.
 * @param {string} prompt - Full prompt string
 * @param {boolean} useCache - Whether to use response cache (default true)
 * @returns {Promise<Object>} Parsed JSON from Gemini
 */
async function askGemini(prompt, useCache = true) {
  const cacheKey = getCacheKey(prompt);

  if (useCache) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('[Gemini] Cache hit');
      return cached;
    }
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Add your key to server/.env');
  }

  const genAI = new GoogleGenAI({ apiKey });
  let lastError;

  for (const model of FALLBACK_MODELS) {
    try {
      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const parsed = JSON.parse(cleaned);

      if (useCache) {
        setCache(cacheKey, parsed);
      }

      if (model !== DEFAULT_MODEL) {
        console.warn(`[Gemini] Used fallback model: ${model}`);
      }

      return parsed;
    } catch (err) {
      lastError = err;
      const message = err.message || '';
      const retryable =
        message.includes('no longer available') ||
        message.includes('is not found') ||
        message.includes('NOT_FOUND') ||
        message.includes('quota');

      if (!retryable) {
        break;
      }

      console.warn(`[Gemini] Model ${model} unavailable, trying next model...`);
    }
  }

  console.error('[Gemini] API Call Error:', lastError?.message);
  throw new Error(`AI service error: ${lastError?.message || 'Unable to connect to Gemini API.'}`);
}

module.exports = { askGemini };
