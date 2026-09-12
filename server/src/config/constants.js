export const CATEGORIES = [
  'Electronics',
  'Documents',
  'Wallet',
  'Keys',
  'Clothing',
  'Books',
  'Accessories',
  'Bags',
  'ID Cards',
  'Other',
];

export const RELATED_CATEGORIES = {
  'Electronics': ['Accessories'],
  'Accessories': ['Electronics', 'Clothing', 'Keys'],
  'Wallet': ['Bags', 'ID Cards', 'Documents'],
  'Bags': ['Wallet', 'Accessories', 'Clothing'],
  'Documents': ['ID Cards', 'Books', 'Wallet'],
  'ID Cards': ['Documents', 'Wallet'],
  'Clothing': ['Accessories'],
  'Books': ['Documents'],
  'Keys': ['Accessories'],
};

export const LOCATIONS = [
  'Library',
  'Cafeteria',
  'Academic Block',
  'Hostel',
  'Sports Complex',
  'Parking Area',
  'Auditorium',
  'Lab',
  'Classroom',
  'Other',
];

// Campus location proximity clusters
export const NEARBY_LOCATIONS = {
  'Library': ['Academic Block', 'Classroom', 'Lab'],
  'Cafeteria': ['Hostel', 'Auditorium'],
  'Academic Block': ['Library', 'Classroom', 'Lab', 'Auditorium'],
  'Hostel': ['Cafeteria', 'Sports Complex', 'Parking Area'],
  'Sports Complex': ['Hostel', 'Parking Area'],
  'Parking Area': ['Hostel', 'Sports Complex', 'Auditorium'],
  'Auditorium': ['Academic Block', 'Cafeteria', 'Parking Area'],
  'Lab': ['Academic Block', 'Classroom', 'Library'],
  'Classroom': ['Academic Block', 'Lab', 'Library'],
  'Other': [],
};

// Configurable weights according to requirements
export const MATCH_WEIGHTS = {
  CATEGORY: 0.20,
  LOCATION: 0.25,
  TIME: 0.15,
  DESCRIPTION: 0.30,
  COLOR: 0.05,
  BRAND: 0.05,
};

// Match confidence thresholds
export const MATCH_THRESHOLDS = {
  STRONG: 90,
  LIKELY: 75,
  POSSIBLE: 60,
  MINIMUM_DISPLAY: 60,
};
