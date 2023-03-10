const cards = [
    "Abomination",
    "Absorbing Man",
    "Adam Warlock",
    "Aero",
    "Agatha Harkness",
    "Agent 13",
    "Agent Coulson",
    "America Chavez",
    "Angel",
    "Angela",
    "Ant-Man",
    "Apocalypse",
    "Armor",
    "Arnim Zola",
    "Baron Mordo",
    "Bast",
    "Beast",
    "Bishop",
    "Black Bolt",
    "Black Cat",
    "Black Panther",
    "Black Widow",
    "Blade",
    "Blue Marvel",
    "Brood",
    "Bucky Barnes",
    "Cable",
    "Captain America",
    "Captain Marvel",
    "Carnage",
    "Cerebro",
    "Cloak",
    "Colleen Wing",
    "Colossus",
    "Cosmo",
    "Crossbones",
    "Crystal",
    "Cyclops",
    "Dagger",
    "Daredevil",
    "Darkhawk",
    "Deadpool",
    "Death",
    "Deathlok",
    "Debrii",
    "Destroyer",
    "Devil Dinosaur",
    "Doctor Doom",
    "Doctor Octopus",
    "Doctor Strange",
    "Domino",
    "Dracula",
    "Drax",
    "Ebony Maw",
    "Electro",
    "Elektra",
    "Enchantress",
    "Falcon",
    "Forge",
    "Galactus",
    "Gambit",
    "Gamora",
    "Ghost Rider",
    "Giganto",
    "Goose",
    "Green Goblin",
    "Groot",
    "Hawkeye",
    "Hazmat",
    "Heimdall",
    "Hela",
    "Helicarrier",
    "Hellcow",
    "Hobgoblin",
    "Hulk",
    "Hulk Buster",
    "Human Torch",
    "Iceman",
    "Invisible Woman",
    "Iron Fist",
    "Iron Man",
    "Ironheart",
    "Jane Foster Mighty Thor",
    "Jubilee",
    "Juggernaut",
    "Kazar",
    "Killmonger",
    "Kingpin",
    "Klaw",
    "Knull",
    "Korg",
    "Kraven",
    "Lady Sif",
    "Leader",
    "Leech",
    "Lizard",
    "Lockjaw",
    "Luke Cage",
    "M'Baku",
    "Magik",
    "Magneto",
    "Mantis",
    "Maria Hill",
    "Maximus",
    "Medusa",
    "Mister Fantastic",
    "Mister Negative",
    "Mister Sinister",
    "Misty Knight",
    "Mojo",
    "Moon Girl",
    "Moon Knight",
    "Morbius",
    "Morph",
    "Multiple Man",
    "Mysterio",
    "Mystique",
    "Nakia",
    "Namor",
    "Nick Fury",
    "Nightcrawler",
    "Nova",
    "Odin",
    "Okoye",
    "Omega Red",
    "Onslaught",
    "Orka",
    "Patriot",
    "Polaris",
    "Professor X",
    "Psylocke",
    "Quake",
    "Quicksilver",
    "Quinjet",
    "Red Skull",
    "Rescue",
    "Rhino",
    "Rocket Raccoon",
    "Rockslide",
    "Rogue",
    "Ronan the Accuser",
    "Sabretooth",
    "Sandman",
    "Scarlet Witch",
    "Scorpion",
    "Sentinel",
    "Sentry",
    "Sera",
    "Shadow King",
    "Shang-Chi",
    "She-Hulk",
    "Shocker",
    "Shuri",
    "Silver Surfer",
    "Spectrum",
    "Spider-Man",
    "Spider-Man (Miles Morales)",
    "Spider-Woman",
    "Squirrel Girl",
    "Star Lord",
    "Storm",
    "Strong Guy",
    "Sunspot",
    "Super Skrull",
    "Swarm",
    "Sword Master",
    "Taskmaster",
    "Thanos",
    "The Collector",
    "The Hood",
    "The Infinaut",
    "The Punisher",
    "The Thing",
    "Thor",
    "Titania",
    "Typhoid Mary",
    "Uatu the Watcher",
    "Ultron",
    "Valkyrie",
    "Venom",
    "Viper",
    "Vision",
    "Vulture",
    "Warpath",
    "Wasp",
    "Wave",
    "White Queen",
    "White Tiger",
    "Wolfsbane",
    "Wolverine",
    "Wong",
    "Yellowjacket",
    "Yondu",
    "Zabu",
    "Zero"
]

export function randomDeck() {
  const deck = []

  while (deck.length < 12) {
    const randomCard = cards[Math.floor(Math.random() * cards.length)]
    if (!deck.includes(randomCard)) {
      deck.push(randomCard)
    }
  }

  return deck
}
