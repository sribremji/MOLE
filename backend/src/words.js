// Curated fallback bank — easy, globally understood words with sentence hints.
// Hints must be broad enough to not reveal the word, but helpful enough for the Mole.
const WORD_BANK = [
  // Food & Drink
  { word: 'Pizza',       hint: 'People often share this with friends while watching movies or sports.' },
  { word: 'Chocolate',   hint: 'This is a popular sweet treat that many people give as a gift.' },
  { word: 'Coffee',      hint: 'Many adults rely on this hot drink every morning to feel more awake.' },
  { word: 'Ice Cream',   hint: 'This cold, sweet dessert is especially popular on hot sunny days.' },
  { word: 'Burger',      hint: 'This is a very popular fast food item enjoyed all over the world.' },
  { word: 'Sushi',       hint: 'This dish originally came from a country in Asia and is now loved globally.' },
  { word: 'Cake',        hint: 'People typically eat this at celebrations and special occasions.' },
  { word: 'Sandwich',    hint: 'This is a common item people pack for lunch and eat on the go.' },
  { word: 'Soup',        hint: 'People often eat this warm dish when they are sick or feeling cold.' },
  { word: 'Popcorn',     hint: 'This snack is almost always associated with a specific entertainment experience.' },

  // Places
  { word: 'Beach',       hint: 'Many people visit this place during summer vacations to relax and swim.' },
  { word: 'Hospital',    hint: 'This is a place people go when they are seriously sick or injured.' },
  { word: 'School',      hint: 'Children spend most of their weekdays here learning new subjects.' },
  { word: 'Airport',     hint: 'People come here when they are about to travel to another country by air.' },
  { word: 'Library',     hint: 'This quiet place lets you borrow books and study for free.' },
  { word: 'Museum',      hint: 'You visit this place to see historical objects, art, or scientific exhibits.' },
  { word: 'Cinema',      hint: 'People pay to sit in a dark room here and watch stories on a big screen.' },
  { word: 'Restaurant',  hint: 'People come here to have food cooked and served by professionals.' },
  { word: 'Hotel',       hint: 'Travelers stay here for a few nights when they are away from home.' },
  { word: 'Market',      hint: 'People come here to buy fresh food and everyday goods, often outdoors.' },
  { word: 'Zoo',         hint: 'Families visit here to see wild animals from many different countries.' },
  { word: 'Stadium',     hint: 'Thousands of fans gather here to watch live competitions.' },
  { word: 'Park',        hint: 'People go here to relax outdoors, walk, or let children play.' },
  { word: 'Pharmacy',    hint: 'You come here to buy medicines when you are sick.' },
  { word: 'Bakery',      hint: 'This shop smells wonderful and sells freshly made bread and pastries.' },
  { word: 'Gym',         hint: 'People go here regularly to exercise and stay physically fit.' },

  // Vehicles & Transport
  { word: 'Car',         hint: 'Most families own at least one of these to travel on roads every day.' },
  { word: 'Bicycle',     hint: 'This two-wheeled vehicle is powered by pedaling and is great for the environment.' },
  { word: 'Train',       hint: 'This long vehicle runs on tracks and carries many passengers between cities.' },
  { word: 'Airplane',    hint: 'This flying vehicle carries hundreds of passengers through the sky.' },
  { word: 'Helicopter',  hint: 'This flying machine can hover in one spot without needing a runway.' },
  { word: 'Submarine',   hint: 'This vehicle travels completely underwater and is used by the navy.' },
  { word: 'Rocket',      hint: 'This is used to travel beyond the Earth into outer space.' },
  { word: 'Boat',        hint: 'People use this to travel across rivers, lakes, or the sea.' },

  // Nature
  { word: 'Mountain',    hint: 'Many people climb this natural landmark for the challenge or the view at the top.' },
  { word: 'Ocean',       hint: 'This massive body of water covers most of the planet and is full of sea life.' },
  { word: 'Forest',      hint: 'This area is dense with trees and is home to many wild animals.' },
  { word: 'Desert',      hint: 'This place is extremely dry and hot and gets almost no rainfall.' },
  { word: 'Volcano',     hint: 'This natural structure can erupt and release hot melted rock.' },
  { word: 'Rainbow',     hint: 'This colorful arc appears in the sky after it rains and the sun comes out.' },
  { word: 'Waterfall',   hint: 'This is a place in nature where water flows down from a great height.' },
  { word: 'Jungle',      hint: 'This dense tropical area is filled with exotic animals and thick vegetation.' },
  { word: 'River',       hint: 'This natural flow of fresh water travels through land toward the sea.' },
  { word: 'Cave',        hint: 'Explorers go inside this dark underground space in mountains or cliffs.' },
  { word: 'Island',      hint: 'This piece of land is completely surrounded by water on all sides.' },
  { word: 'Snow',        hint: 'This white, cold material falls from the sky during winter in cold countries.' },
  { word: 'Lightning',   hint: 'This bright flash appears in the sky during storms and can be dangerous.' },

  // Animals
  { word: 'Cat',         hint: 'This popular pet is known for being independent, curious, and clean.' },
  { word: 'Elephant',    hint: 'This is the largest land animal on Earth and has an extremely long nose.' },
  { word: 'Penguin',     hint: 'This black and white bird lives in very cold regions and cannot fly.' },
  { word: 'Lion',        hint: 'This large, powerful animal is often called the king of the jungle.' },
  { word: 'Dolphin',     hint: 'This intelligent sea creature is known for being friendly and playful.' },
  { word: 'Butterfly',   hint: 'This colorful winged insect starts its life as a completely different creature.' },

  // Objects & Everyday Items
  { word: 'Umbrella',    hint: 'People carry this to protect themselves from getting wet when it rains.' },
  { word: 'Telescope',   hint: 'Scientists and hobbyists use this to see objects that are very far away in space.' },
  { word: 'Camera',      hint: 'People use this device to capture memories and freeze moments in time.' },
  { word: 'Clock',       hint: 'This device is found in almost every room and tells you what time it is.' },
  { word: 'Balloon',     hint: 'This inflatable object floats up when filled with a special gas and is popular at parties.' },
  { word: 'Passport',    hint: 'You must carry this official document when traveling to a foreign country.' },
  { word: 'Backpack',    hint: 'Students and hikers wear this bag on their shoulders to carry their belongings.' },
  { word: 'Candle',      hint: 'This gives off a gentle light and is used during power cuts or romantic dinners.' },
  { word: 'Anchor',      hint: 'Ships drop this heavy device to the sea floor to stop the vessel from drifting.' },
  { word: 'Compass',     hint: 'Hikers and sailors use this device to figure out which direction they are heading.' },
  { word: 'Mirror',      hint: 'People look into this every morning to see their own reflection.' },
  { word: 'Wallet',      hint: 'Most people carry this in their pocket or bag to hold their money and cards.' },
  { word: 'Blanket',     hint: 'People wrap this soft, warm covering around themselves when they feel cold.' },
  { word: 'Sunglasses',  hint: 'People wear these on their face on bright days to protect their eyes from sunlight.' },
  { word: 'Ticket',      hint: 'You need this small piece of paper or card to enter events or use transport.' },
  { word: 'Map',         hint: 'Travelers use this to find their way around an unfamiliar city or region.' },
  { word: 'Ladder',      hint: 'People use this to safely climb up to high places they cannot reach normally.' },

  // Sports & Activities
  { word: 'Football',    hint: 'Millions of fans around the world watch and argue about this sport every weekend.' },
  { word: 'Swimming',    hint: 'This is an activity people do in water for fitness or to cool off in summer.' },

  // Special & Cultural
  { word: 'Diamond',     hint: 'This precious stone is often seen on rings and symbolizes something very valuable.' },
  { word: 'Lighthouse',  hint: 'This tall tower near the sea flashes a bright light to guide ships safely at night.' },
  { word: 'Treasure',    hint: 'Pirates and adventurers spend their lives searching for this hidden collection of valuables.' },
  { word: 'Bridge',      hint: 'This structure was built to allow people to cross over water or a valley.' },
  { word: 'Castle',      hint: 'This large stone structure was once home to royalty and was built for protection.' },
  { word: 'Statue',      hint: 'This carved or moulded figure is often placed in public areas to represent someone famous.' },
  { word: 'Trophy',      hint: 'Athletes receive this shiny object as a reward for winning a competition.' },
  { word: 'Kite',        hint: 'Children fly this colorful object in the air by holding a long string while the wind pulls it.' },
  { word: 'Guitar',      hint: 'This musical instrument with strings is played by many famous musicians on stage.' },
  { word: 'Piano',       hint: 'This large musical instrument with black and white keys is played at concerts and homes.' },
  { word: 'Circus',      hint: 'Families come here to watch acrobats, clowns, and sometimes trained animals perform.' },
  { word: 'Wedding',     hint: 'This is a ceremony that celebrates two people officially committing their love.' },
  { word: 'Fireworks',   hint: 'These colorful explosions light up the night sky during celebrations and festivals.' },
  { word: 'Sunset',      hint: 'People stop to appreciate this beautiful natural event that happens every evening.' },
  { word: 'Garden',      hint: 'People grow flowers, vegetables, and trees in this outdoor space near a home.' },
];

module.exports = { WORD_BANK };
