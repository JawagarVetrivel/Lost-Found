import {
  calculateDescriptionSimilarity,
  calculateFallbackSemanticSimilarity,
  calculateCosineSimilarity,
} from '../src/services/aiMatchingService.js';

describe('AI Matching Service Tests', () => {
  test('Cosine similarity function handles basic vectors accurately', () => {
    const vec1 = [1, 0, 0];
    const vec2 = [1, 0, 0];
    expect(calculateCosineSimilarity(vec1, vec2)).toBeCloseTo(1.0);

    const vecOrthogonal = [0, 1, 0];
    expect(calculateCosineSimilarity(vec1, vecOrthogonal)).toBeCloseTo(0.0);
  });

  test('Semantically equivalent laptop descriptions produce high similarity (> 75%)', async () => {
    const desc1 = 'black HP laptop with red sticker';
    const desc2 = 'black HP notebook having a red sticker';

    const score = await calculateDescriptionSimilarity(desc1, desc2);
    expect(score).toBeGreaterThanOrEqual(75);
  });

  test('Identical descriptions produce 100%', async () => {
    const desc = 'Blue stainless steel Hydro Flask 32oz';
    const score = await calculateDescriptionSimilarity(desc, desc);
    expect(score).toBe(100);
  });

  test('Unrelated descriptions produce very low similarity (< 30%)', async () => {
    const desc1 = 'Silver Apple MacBook Pro 14 inch M2';
    const desc2 = 'Leather brown wallet containing library card and driver license';

    const score = await calculateDescriptionSimilarity(desc1, desc2);
    expect(score).toBeLessThan(30);
  });
});
