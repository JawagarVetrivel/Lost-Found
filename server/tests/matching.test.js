import {
  calculateCategoryScore,
  calculateLocationScore,
  calculateTimeScore,
  calculateColorScore,
  calculateBrandScore,
  compareItems,
  filterCandidateItems,
} from '../src/services/matchingService.js';

describe('Smart Matching Engine - Unit Tests', () => {
  describe('Category Scoring (Weight 20%)', () => {
    test('Exact same category scores 100%', () => {
      expect(calculateCategoryScore('Electronics', 'Electronics')).toBe(100);
      expect(calculateCategoryScore('Bags', 'Bags')).toBe(100);
    });

    test('Related categories score 70%', () => {
      expect(calculateCategoryScore('Electronics', 'Accessories')).toBe(70);
      expect(calculateCategoryScore('Wallet', 'ID Cards')).toBe(70);
      expect(calculateCategoryScore('Wallet', 'Bags')).toBe(70);
    });

    test('Unrelated categories score 0%', () => {
      expect(calculateCategoryScore('Electronics', 'Clothing')).toBe(0);
      expect(calculateCategoryScore('Books', 'Keys')).toBe(0);
    });
  });

  describe('Location Scoring (Weight 25%)', () => {
    test('Exact same campus location scores 100%', () => {
      expect(calculateLocationScore('Library', 'Library')).toBe(100);
      expect(calculateLocationScore('Cafeteria', 'Cafeteria')).toBe(100);
    });

    test('Nearby campus location scores 75%', () => {
      expect(calculateLocationScore('Library', 'Academic Block')).toBe(75);
      expect(calculateLocationScore('Academic Block', 'Classroom')).toBe(75);
    });

    test('Different campus locations score 50%', () => {
      expect(calculateLocationScore('Library', 'Sports Complex')).toBe(50);
    });

    test('GPS coordinates proximity calculation', () => {
      // Points within ~40 meters
      const scoreClose = calculateLocationScore(
        'Library',
        'Academic Block',
        37.7749,
        -122.4194,
        37.7750,
        -122.4193
      );
      expect(scoreClose).toBeGreaterThanOrEqual(85);
    });
  });

  describe('Time Scoring (Weight 15%)', () => {
    test('0–30 minutes difference scores 100%', () => {
      expect(calculateTimeScore('2026-09-12', '14:00', '2026-09-12', '14:20')).toBe(100);
    });

    test('30–60 minutes difference scores 90%', () => {
      expect(calculateTimeScore('2026-09-12', '14:00', '2026-09-12', '14:45')).toBe(90);
    });

    test('1–2 hours difference scores 75%', () => {
      expect(calculateTimeScore('2026-09-12', '14:00', '2026-09-12', '15:30')).toBe(75);
    });

    test('2–4 hours difference scores 50%', () => {
      expect(calculateTimeScore('2026-09-12', '10:00', '2026-09-12', '13:00')).toBe(50);
    });

    test('4–12 hours difference scores 25%', () => {
      expect(calculateTimeScore('2026-09-12', '08:00', '2026-09-12', '16:00')).toBe(25);
    });

    test('More than 24 hours scores <= 10%', () => {
      expect(calculateTimeScore('2026-09-10', '14:00', '2026-09-12', '14:00')).toBeLessThanOrEqual(10);
    });
  });

  describe('Color & Brand Scoring (Weight 5% each)', () => {
    test('Exact color scores 100%, different scores 0%', () => {
      expect(calculateColorScore('White', 'White')).toBe(100);
      expect(calculateColorScore('Dark Blue', 'Blue')).toBe(80);
      expect(calculateColorScore('Red', 'Green')).toBe(0);
    });

    test('Exact brand scores 100%, different scores 0%', () => {
      expect(calculateBrandScore('Apple', 'apple')).toBe(100);
      expect(calculateBrandScore('Apple', 'Samsung')).toBe(0);
      expect(calculateBrandScore('HP', '')).toBe(50);
    });
  });

  describe('Comprehensive End-to-End Matching', () => {
    test('Two highly similar reports produce a high score (> 85%)', async () => {
      const lostAirPods = {
        id: 'lost-1',
        type: 'lost',
        title: 'Apple AirPods Pro',
        category: 'Electronics',
        description: 'White AirPods Pro in a clear silicone case with scratch on left stem',
        brand: 'Apple',
        color: 'White',
        date: '2026-09-12',
        time: '14:00',
        location: 'Library',
      };

      const foundAirPods = {
        id: 'found-1',
        type: 'found',
        title: 'White Wireless Apple Earbuds',
        category: 'Electronics',
        description: 'Found white apple airpods pro in clear case on 2nd floor library desk',
        brand: 'Apple',
        color: 'White',
        date: '2026-09-12',
        time: '14:25',
        location: 'Library',
      };

      const result = await compareItems(lostAirPods, foundAirPods);

      expect(result.finalScore).toBeGreaterThanOrEqual(85);
      expect(result.categoryScore).toBe(100);
      expect(result.locationScore).toBe(100);
      expect(result.timeScore).toBe(100);
      expect(result.explanation).toContain('match');
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    test('Two unrelated reports produce a low score (< 40%)', async () => {
      const lostLaptop = {
        id: 'lost-2',
        type: 'lost',
        title: 'Black HP Laptop',
        category: 'Electronics',
        description: 'HP Envy x360 laptop with cat sticker',
        brand: 'HP',
        color: 'Black',
        date: '2026-09-10',
        time: '10:00',
        location: 'Cafeteria',
      };

      const foundWaterBottle = {
        id: 'found-2',
        type: 'found',
        title: 'Pink Hydro Flask Bottle',
        category: 'Accessories',
        description: 'Found pink metal water flask in gym bleachers',
        brand: 'Hydro Flask',
        color: 'Pink',
        date: '2026-09-12',
        time: '18:00',
        location: 'Sports Complex',
      };

      const result = await compareItems(lostLaptop, foundWaterBottle);
      expect(result.finalScore).toBeLessThan(40);
    });

    test('Candidate filtering excludes irrelevant items', () => {
      const targetItem = {
        id: 'target-1',
        userId: 'u1',
        type: 'lost',
        category: 'Electronics',
        date: '2026-09-12',
        time: '14:00',
      };

      const candidates = [
        // Valid candidate: found, active, electronics, recent
        { id: 'c1', userId: 'u2', type: 'found', status: 'active', category: 'Electronics', date: '2026-09-12', time: '14:30' },
        // Invalid: same user
        { id: 'c2', userId: 'u1', type: 'found', status: 'active', category: 'Electronics', date: '2026-09-12', time: '14:30' },
        // Invalid: same type (lost)
        { id: 'c3', userId: 'u3', type: 'lost', status: 'active', category: 'Electronics', date: '2026-09-12', time: '14:30' },
        // Invalid: already resolved
        { id: 'c4', userId: 'u4', type: 'found', status: 'resolved', category: 'Electronics', date: '2026-09-12', time: '14:30' },
        // Invalid: completely different category (Clothing)
        { id: 'c5', userId: 'u5', type: 'found', status: 'active', category: 'Clothing', date: '2026-09-12', time: '14:30' },
      ];

      const filtered = filterCandidateItems(targetItem, candidates);
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('c1');
    });
  });
});
