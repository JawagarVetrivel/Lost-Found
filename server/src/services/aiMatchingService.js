import { geminiClient, isGeminiConfigured } from '../config/gemini.js';

/**
 * Calculates cosine similarity between two numeric vectors
 */
export function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Synonyms map to enhance semantic token matching
const SYNONYMS = {
  'laptop': ['notebook', 'computer', 'macbook', 'pc'],
  'notebook': ['laptop', 'computer'],
  'phone': ['iphone', 'smartphone', 'mobile', 'cellphone'],
  'earbuds': ['airpods', 'headphones', 'earphones'],
  'airpods': ['earbuds', 'headphones', 'earphones'],
  'bag': ['backpack', 'knapsack', 'rucksack'],
  'backpack': ['bag', 'knapsack'],
  'wallet': ['purse', 'billfold', 'cardholder'],
  'bottle': ['flask', 'tumbler', 'hydroflask'],
  'id': ['card', 'badge', 'pass', 'identity'],
};

// Common stop words to exclude from semantic similarity calculation
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'with', 'having', 'in', 'on', 'at', 'of', 'for', 'to', 'from',
  'by', 'about', 'and', 'or', 'is', 'it', 'my', 'some', 'has', 'near'
]);

/**
 * Tokenizes and normalizes text into word stems, stop words filtered, and synonyms
 */
function tokenizeAndNormalize(text) {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  const tokens = new Set();
  for (const word of words) {
    tokens.add(word);
    if (SYNONYMS[word]) {
      SYNONYMS[word].forEach((syn) => tokens.add(syn));
    }
  }
  return Array.from(tokens);
}

/**
 * Fallback semantic similarity calculation based on token overlap and Jaccard/Dice coefficient
 * Ensures zero-crash reliability when Gemini API is unavailable or offline
 */
export function calculateFallbackSemanticSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;

  const t1 = text1.toLowerCase().trim();
  const t2 = text2.toLowerCase().trim();

  if (t1 === t2) return 100;

  const tokens1 = tokenizeAndNormalize(t1);
  const tokens2 = tokenizeAndNormalize(t2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  let intersection = 0;
  for (const t of set1) {
    if (set2.has(t)) {
      intersection++;
    }
  }

  const union = new Set([...tokens1, ...tokens2]).size;
  const jaccard = intersection / union;

  // Dice coefficient gives appropriate weight to shared terms
  const dice = (2 * intersection) / (tokens1.length + tokens2.length);

  const score = Math.min(100, Math.round(((jaccard * 0.4) + (dice * 0.6)) * 100));
  return score;
}

/**
 * Generates an embedding vector using Gemini API
 */
async function getGeminiEmbedding(text) {
  if (!isGeminiConfigured || !geminiClient) return null;

  try {
    const response = await geminiClient.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
    });

    if (response?.embeddings?.[0]?.values) {
      return response.embeddings[0].values;
    }
    if (response?.embedding?.values) {
      return response.embedding.values;
    }
    return null;
  } catch (err) {
    console.warn('[Gemini Embeddings API Error - using fallback]', err.message);
    return null;
  }
}

/**
 * Public service function:
 * Compares two descriptions semantically using Gemini API embeddings,
 * falling back gracefully to robust semantic token analysis.
 *
 * Returns a similarity score between 0 and 100.
 */
export async function calculateDescriptionSimilarity(desc1, desc2) {
  if (!desc1 || !desc2) return 0;

  const text1 = desc1.trim();
  const text2 = desc2.trim();

  if (text1.toLowerCase() === text2.toLowerCase()) {
    return 100;
  }

  // If Gemini client is active, try to fetch vector embeddings
  if (isGeminiConfigured) {
    try {
      const [emb1, emb2] = await Promise.all([
        getGeminiEmbedding(text1),
        getGeminiEmbedding(text2),
      ]);

      if (emb1 && emb2) {
        const rawCosine = calculateCosineSimilarity(emb1, emb2);
        // Normalize 3072-dim embedding cosine (range ~0.50 to 1.0) into calibrated 0 to 100 score
        const calibratedScore = Math.min(100, Math.max(0, Math.round(((rawCosine - 0.5) / 0.5) * 100)));
        return calibratedScore;
      }
    } catch (err) {
      console.warn('[aiMatchingService] Gemini execution error, proceeding with fallback:', err.message);
    }
  }

  // Fallback semantic similarity calculation
  return calculateFallbackSemanticSimilarity(text1, text2);
}
