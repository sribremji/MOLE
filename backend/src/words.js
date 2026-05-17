const WORDS = [
  'Pizza', 'Beach', 'Hospital', 'School', 'Airport',
  'Cat', 'Football', 'Coffee', 'Library', 'Mountain',
  'Ocean', 'Forest', 'Kitchen', 'Museum', 'Cinema',
  'Garden', 'Bridge', 'Castle', 'Desert', 'Volcano',
  'Submarine', 'Helicopter', 'Diamond', 'Umbrella', 'Telescope',
  'Guitar', 'Piano', 'Compass', 'Lantern', 'Hammock',
  'Elephant', 'Penguin', 'Cactus', 'Rainbow', 'Thunder',
  'Candle', 'Anchor', 'Rocket', 'Jungle', 'Treasure',
];

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

module.exports = { WORDS, getRandomWord };
