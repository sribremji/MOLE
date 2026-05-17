// Each entry: { word shown to players, hint shown only to the Mole }
// Hint should be related but not reveal the exact answer
const WORDS = [
  { word: 'Pizza',      hint: 'Cheese' },
  { word: 'Beach',      hint: 'Ocean' },
  { word: 'Hospital',   hint: 'Doctor' },
  { word: 'School',     hint: 'Teacher' },
  { word: 'Airport',    hint: 'Luggage' },
  { word: 'Cat',        hint: 'Whiskers' },
  { word: 'Football',   hint: 'Stadium' },
  { word: 'Coffee',     hint: 'Caffeine' },
  { word: 'Library',    hint: 'Reading' },
  { word: 'Mountain',   hint: 'Cliff' },
  { word: 'Ocean',      hint: 'Waves' },
  { word: 'Forest',     hint: 'Trees' },
  { word: 'Kitchen',    hint: 'Cooking' },
  { word: 'Museum',     hint: 'Artifacts' },
  { word: 'Cinema',     hint: 'Screen' },
  { word: 'Garden',     hint: 'Flowers' },
  { word: 'Bridge',     hint: 'River' },
  { word: 'Castle',     hint: 'Tower' },
  { word: 'Desert',     hint: 'Sand' },
  { word: 'Volcano',    hint: 'Lava' },
  { word: 'Submarine',  hint: 'Underwater' },
  { word: 'Helicopter', hint: 'Blades' },
  { word: 'Diamond',    hint: 'Gem' },
  { word: 'Umbrella',   hint: 'Rain' },
  { word: 'Telescope',  hint: 'Stars' },
  { word: 'Guitar',     hint: 'Strings' },
  { word: 'Piano',      hint: 'Keys' },
  { word: 'Compass',    hint: 'Navigation' },
  { word: 'Lantern',    hint: 'Flame' },
  { word: 'Hammock',    hint: 'Relax' },
  { word: 'Elephant',   hint: 'Trunk' },
  { word: 'Penguin',    hint: 'Arctic' },
  { word: 'Cactus',     hint: 'Thorns' },
  { word: 'Rainbow',    hint: 'Colors' },
  { word: 'Thunder',    hint: 'Lightning' },
  { word: 'Candle',     hint: 'Wax' },
  { word: 'Anchor',     hint: 'Harbor' },
  { word: 'Rocket',     hint: 'Space' },
  { word: 'Jungle',     hint: 'Wildlife' },
  { word: 'Treasure',   hint: 'Gold' },
];

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

module.exports = { WORDS, getRandomWord };
