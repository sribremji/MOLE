// Curated fallback bank — easy, globally understood words with single-word broad hints.
// Hint rules: one word, broad situational/contextual association only —
// NOT a synonym, NOT a direct attribute, NOT a clue that immediately reveals the answer.
const WORD_BANK = [
  // Food & Drink
  { word: 'Pizza',       hint: 'Party' },
  { word: 'Chocolate',   hint: 'Gift' },
  { word: 'Coffee',      hint: 'Morning' },
  { word: 'Ice Cream',   hint: 'Summer' },
  { word: 'Burger',      hint: 'Casual' },
  { word: 'Sushi',       hint: 'Date' },
  { word: 'Cake',        hint: 'Celebration' },
  { word: 'Sandwich',    hint: 'Quick' },
  { word: 'Soup',        hint: 'Comfort' },
  { word: 'Popcorn',     hint: 'Evening' },

  // Places
  { word: 'Beach',       hint: 'Holiday' },
  { word: 'Hospital',    hint: 'Emergency' },
  { word: 'School',      hint: 'Childhood' },
  { word: 'Airport',     hint: 'Journey' },
  { word: 'Library',     hint: 'Quiet' },
  { word: 'Museum',      hint: 'Culture' },
  { word: 'Cinema',      hint: 'Evening' },
  { word: 'Restaurant',  hint: 'Date' },
  { word: 'Hotel',       hint: 'Travel' },
  { word: 'Market',      hint: 'Weekend' },
  { word: 'Zoo',         hint: 'Family' },
  { word: 'Stadium',     hint: 'Crowd' },
  { word: 'Park',        hint: 'Leisure' },
  { word: 'Pharmacy',    hint: 'Errand' },
  { word: 'Bakery',      hint: 'Morning' },
  { word: 'Gym',         hint: 'Routine' },

  // Vehicles & Transport
  { word: 'Car',         hint: 'Daily' },
  { word: 'Bicycle',     hint: 'Healthy' },
  { word: 'Train',       hint: 'Commute' },
  { word: 'Airplane',    hint: 'Holiday' },
  { word: 'Helicopter',  hint: 'Remote' },
  { word: 'Submarine',   hint: 'Mission' },
  { word: 'Rocket',      hint: 'Science' },
  { word: 'Boat',        hint: 'Leisure' },

  // Nature
  { word: 'Mountain',    hint: 'Challenge' },
  { word: 'Ocean',       hint: 'Endless' },
  { word: 'Forest',      hint: 'Wild' },
  { word: 'Desert',      hint: 'Remote' },
  { word: 'Volcano',     hint: 'Power' },
  { word: 'Rainbow',     hint: 'Hope' },
  { word: 'Waterfall',   hint: 'Scenic' },
  { word: 'Jungle',      hint: 'Adventure' },
  { word: 'River',       hint: 'Journey' },
  { word: 'Cave',        hint: 'Explore' },
  { word: 'Island',      hint: 'Escape' },
  { word: 'Snow',        hint: 'Winter' },
  { word: 'Lightning',   hint: 'Storm' },

  // Animals
  { word: 'Cat',         hint: 'Cozy' },
  { word: 'Elephant',    hint: 'Safari' },
  { word: 'Penguin',     hint: 'Distant' },
  { word: 'Lion',        hint: 'Bold' },
  { word: 'Dolphin',     hint: 'Joy' },
  { word: 'Butterfly',   hint: 'Spring' },

  // Objects & Everyday Items
  { word: 'Umbrella',    hint: 'Prepared' },
  { word: 'Telescope',   hint: 'Wonder' },
  { word: 'Camera',      hint: 'Memory' },
  { word: 'Clock',       hint: 'Routine' },
  { word: 'Balloon',     hint: 'Celebration' },
  { word: 'Passport',    hint: 'Adventure' },
  { word: 'Backpack',    hint: 'Journey' },
  { word: 'Candle',      hint: 'Romantic' },
  { word: 'Anchor',      hint: 'Steady' },
  { word: 'Compass',     hint: 'Lost' },
  { word: 'Mirror',      hint: 'Morning' },
  { word: 'Wallet',      hint: 'Essential' },
  { word: 'Blanket',     hint: 'Cozy' },
  { word: 'Sunglasses',  hint: 'Cool' },
  { word: 'Ticket',      hint: 'Queue' },
  { word: 'Map',         hint: 'Wander' },
  { word: 'Ladder',      hint: 'Ambitious' },

  // Sports & Activities
  { word: 'Football',    hint: 'Weekend' },
  { word: 'Swimming',    hint: 'Fitness' },

  // Special & Cultural
  { word: 'Diamond',     hint: 'Rare' },
  { word: 'Lighthouse',  hint: 'Lone' },
  { word: 'Treasure',    hint: 'Hidden' },
  { word: 'Bridge',      hint: 'Connect' },
  { word: 'Castle',      hint: 'Medieval' },
  { word: 'Statue',      hint: 'Honor' },
  { word: 'Trophy',      hint: 'Victory' },
  { word: 'Kite',        hint: 'Breezy' },
  { word: 'Guitar',      hint: 'Stage' },
  { word: 'Piano',       hint: 'Concert' },
  { word: 'Circus',      hint: 'Wonder' },
  { word: 'Wedding',     hint: 'Forever' },
  { word: 'Fireworks',   hint: 'Festival' },
  { word: 'Sunset',      hint: 'Peaceful' },
  { word: 'Garden',      hint: 'Bloom' },
];

module.exports = { WORD_BANK };
