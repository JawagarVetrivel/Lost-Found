import { calculateDescriptionSimilarity } from './aiMatchingService.js';
import {
  CATEGORIES,
  RELATED_CATEGORIES,
  NEARBY_LOCATIONS,
  MATCH_WEIGHTS,
  MATCH_THRESHOLDS,
} from '../config/constants.js';
import { calculateHaversineDistance } from '../utils/geo.js';

/**
 * Calculates category similarity (0 to 100)
 */
export function calculateCategoryScore(cat1, cat2) {
  if (!cat1 || !cat2) return 0;
  if (cat1.toLowerCase() === cat2.toLowerCase()) return 100;

  const related = RELATED_CATEGORIES[cat1] || [];
  if (related.some((c) => c.toLowerCase() === cat2.toLowerCase())) {
    return 70;
  }

  // If one of them is 'Other', give partial tolerance
  if (cat1 === 'Other' || cat2 === 'Other') {
    return 30;
  }

  return 0;
}

/**
 * Calculates location similarity (0 to 100)
 * Uses coordinates if available, otherwise campus location proximity
 */
export function calculateLocationScore(loc1, loc2, lat1, lon1, lat2, lon2) {
  // If GPS coordinates are available for both
  if (lat1 != null && lon1 != null && lat2 != null && lon2 != null) {
    const distanceMeters = calculateHaversineDistance(lat1, lon1, lat2, lon2);
    if (distanceMeters !== null) {
      if (distanceMeters <= 50) return 100;
      if (distanceMeters <= 150) return 85;
      if (distanceMeters <= 400) return 70;
      if (distanceMeters <= 800) return 50;
      if (distanceMeters <= 1500) return 20;
      return 10;
    }
  }

  if (!loc1 || !loc2) return 0;
  const l1 = loc1.trim();
  const l2 = loc2.trim();

  if (l1.toLowerCase() === l2.toLowerCase()) return 100;

  const nearby = NEARBY_LOCATIONS[l1] || [];
  if (nearby.some((loc) => loc.toLowerCase() === l2.toLowerCase())) {
    return 75;
  }

  // If both locations are known campus locations
  if (l1 !== 'Other' && l2 !== 'Other') {
    return 50;
  }

  if (l1 === 'Other' || l2 === 'Other') {
    return 20;
  }

  return 0;
}

/**
 * Parses date ("YYYY-MM-DD") and time ("HH:MM") into a Date timestamp in ms
 */
function parseDateTime(dateStr, timeStr) {
  try {
    const [year, month, day] = (dateStr || '').split('-').map(Number);
    const [hours, minutes] = (timeStr || '12:00').split(':').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return Date.now();
    }
    return new Date(year, month - 1, day, hours || 0, minutes || 0).getTime();
  } catch {
    return Date.now();
  }
}

/**
 * Calculates time similarity (0 to 100) based on difference in minutes
 */
export function calculateTimeScore(date1, time1, date2, time2) {
  const ts1 = parseDateTime(date1, time1);
  const ts2 = parseDateTime(date2, time2);

  const diffMinutes = Math.abs(ts1 - ts2) / (1000 * 60);

  if (diffMinutes <= 30) return 100;
  if (diffMinutes <= 60) return 90;
  if (diffMinutes <= 120) return 75;
  if (diffMinutes <= 240) return 50;
  if (diffMinutes <= 720) return 25;
  if (diffMinutes <= 1440) return 10; // within 24 hours
  if (diffMinutes <= 4320) return 5;  // within 3 days

  return 0;
}

/**
 * Calculates color similarity (0 to 100)
 */
export function calculateColorScore(color1, color2) {
  if (!color1 || !color2) return 50; // Neutral if unspecified

  const c1 = color1.toLowerCase().trim();
  const c2 = color2.toLowerCase().trim();

  if (c1 === c2) return 100;
  if (c1.includes(c2) || c2.includes(c1)) return 80;

  return 0;
}

/**
 * Calculates brand similarity (0 to 100)
 */
export function calculateBrandScore(brand1, brand2) {
  if (!brand1 || !brand2) return 50; // Neutral if unspecified

  const b1 = brand1.toLowerCase().trim();
  const b2 = brand2.toLowerCase().trim();

  if (b1 === b2) return 100;
  if (b1.includes(b2) || b2.includes(b1)) return 80;

  return 0;
}

/**
 * Generates human-readable explanation and itemized reason list for UI
 */
export function generateMatchExplanation(scores, item1, item2) {
  const reasons = [];

  if (scores.categoryScore === 100) {
    reasons.push(`Same category (${item1.category})`);
  } else if (scores.categoryScore >= 70) {
    reasons.push(`Closely related categories (${item1.category} & ${item2.category})`);
  }

  if (scores.locationScore === 100) {
    reasons.push(`Exact same campus location (${item1.location})`);
  } else if (scores.locationScore >= 75) {
    reasons.push(`Nearby campus areas (${item1.location} and ${item2.location})`);
  }

  if (scores.timeScore >= 90) {
    reasons.push('Reported within 1 hour of each other');
  } else if (scores.timeScore >= 75) {
    reasons.push('Reported within 2 hours of each other');
  } else if (scores.timeScore >= 50) {
    reasons.push('Reported within 4 hours of each other');
  }

  if (scores.descriptionScore >= 80) {
    reasons.push('Descriptions show very high semantic similarity');
  } else if (scores.descriptionScore >= 60) {
    reasons.push('Descriptions share key matching characteristics');
  }

  if (scores.colorScore >= 80 && item1.color && item2.color) {
    reasons.push(`Matching color scheme (${item1.color})`);
  }

  if (scores.brandScore >= 80 && item1.brand && item2.brand) {
    reasons.push(`Matching brand (${item1.brand})`);
  }

  if (reasons.length === 0) {
    reasons.push('Partial match on campus reports');
  }

  let confidence = 'Possible';
  if (scores.finalScore >= MATCH_THRESHOLDS.STRONG) {
    confidence = 'Strong';
  } else if (scores.finalScore >= MATCH_THRESHOLDS.LIKELY) {
    confidence = 'Likely';
  }

  const explanation = `${confidence} match because both reports are for ${item1.category}, were reported near ${item1.location}, and have ${scores.descriptionScore >= 75 ? 'highly similar' : 'compatible'} descriptions.`;

  return { explanation, reasons };
}

/**
 * Evaluates two items and computes all sub-scores and final weighted score
 */
export async function compareItems(lostItem, foundItem) {
  const categoryScore = calculateCategoryScore(lostItem.category, foundItem.category);
  const locationScore = calculateLocationScore(
    lostItem.location,
    foundItem.location,
    lostItem.latitude,
    lostItem.longitude,
    foundItem.latitude,
    foundItem.longitude
  );
  const timeScore = calculateTimeScore(lostItem.date, lostItem.time, foundItem.date, foundItem.time);
  const descriptionScore = await calculateDescriptionSimilarity(lostItem.description, foundItem.description);
  const colorScore = calculateColorScore(lostItem.color, foundItem.color);
  const brandScore = calculateBrandScore(lostItem.brand, foundItem.brand);

  const weightedScore =
    categoryScore * MATCH_WEIGHTS.CATEGORY +
    locationScore * MATCH_WEIGHTS.LOCATION +
    timeScore * MATCH_WEIGHTS.TIME +
    descriptionScore * MATCH_WEIGHTS.DESCRIPTION +
    colorScore * MATCH_WEIGHTS.COLOR +
    brandScore * MATCH_WEIGHTS.BRAND;

  const finalScore = Math.min(100, Math.max(0, Math.round(weightedScore)));

  const scores = {
    categoryScore,
    locationScore,
    timeScore,
    descriptionScore,
    colorScore,
    brandScore,
    finalScore,
  };

  const { explanation, reasons } = generateMatchExplanation(scores, lostItem, foundItem);

  return {
    lostItemId: lostItem.id,
    foundItemId: foundItem.id,
    ...scores,
    explanation,
    reasons,
    status: 'pending',
  };
}

/**
 * Filters candidates to avoid comparing against irrelevant items
 */
export function filterCandidateItems(targetItem, allCandidates) {
  const oppositeType = targetItem.type === 'lost' ? 'found' : 'lost';

  return allCandidates.filter((candidate) => {
    // Must be unresolved/active
    if (candidate.status !== 'active') return false;

    // Must be opposite type
    if (candidate.type !== oppositeType) return false;

    // Cannot match against own item
    const targetUserId = targetItem.userId || targetItem.user_id;
    const candidateUserId = candidate.userId || candidate.user_id;
    if (targetUserId && candidateUserId && targetUserId === candidateUserId) return false;

    // Category check: exact, related, or 'Other'
    const catScore = calculateCategoryScore(targetItem.category, candidate.category);
    if (catScore === 0) return false;

    // Date range check: within 30 days
    const t1 = parseDateTime(targetItem.date, targetItem.time);
    const t2 = parseDateTime(candidate.date, candidate.time);
    const diffDays = Math.abs(t1 - t2) / (1000 * 60 * 60 * 24);
    if (diffDays > 30) return false;

    return true;
  });
}
