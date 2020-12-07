
const artifactStats = {
  hp: { name: "HP", key: "hp" },
  hp_: { name: "HP%", key: "hp_", unit: "%" },
  atk: { name: "ATK", key: "atk" },
  atk_: { name: "ATK%", key: "atk_", unit: "%" },
  def: { name: "DEF", key: "def" },
  def_: { name: "DEF%", key: "def_", unit: "%" },
  phy_dmg: { name: "Physical DMG%", key: "phy_dmg", unit: "%" },
  ele_dmg: { name: "Elemental DMG%", key: "ele_dmg", unit: "%" },
  ele_mas: { name: "Elemental Mastery", key: "ele_mas" },
  ener_rech: { name: "Energy Recharge%", key: "ener_rech", unit: "%" },
  crit_rate: { name: "Crit Rate%", key: "crit_rate", unit: "%" },
  crit_dmg: { name: "Crit DMG%", key: "crit_dmg", unit: "%" },
  heal_bonu: { name: "Healing Bonus%", key: "heal_bonu", unit: "%" },
};

const artifactSubStats = {
  hp: { 3: { low: 100, high: 143 }, 4: { low: 167, high: 239 }, 5: { low: 209, high: 299 } },
  hp_: { 3: { low: 2.5, high: 3.5 }, 4: { low: 3.3, high: 4.7 }, 5: { low: 4.1, high: 5.8 } },
  atk: { 3: { low: 7, high: 9 }, 4: { low: 11, high: 16 }, 5: { low: 14, high: 19 } },
  atk_: { 3: { low: 2.5, high: 3.5 }, 4: { low: 3.3, high: 4.7 }, 5: { low: 4.1, high: 5.8 } },
  def: { 3: { low: 8, high: 11 }, 4: { low: 13, high: 19 }, 5: { low: 16, high: 23 } },
  def_: { 3: { low: 3.1, high: 4.4 }, 4: { low: 4.1, high: 5.8 }, 5: { low: 5.1, high: 7.3 } },
  ele_mas: { 3: { low: 10, high: 14 }, 4: { low: 13, high: 19 }, 5: { low: 16, high: 23 } },
  ener_rech: { 3: { low: 2.7, high: 3.5 }, 4: { low: 4.1, high: 5.8 }, 5: { low: 4.5, high: 6.5 } },
  crit_rate: { 3: { low: 1.6, high: 2.3 }, 4: { low: 2.2, high: 3.1 }, 5: { low: 2.7, high: 3.9 } },
  crit_dmg: { 3: { low: 3.3, high: 4.7 }, 4: { low: 4.4, high: 6.2 }, 5: { low: 5.4, high: 7.8 } },
}

const artifactSlots = {
  flower: { name: "Flower of Life", stats: ["hp"] },
  plume: { name: "Plume of Death", stats: ["atk"] },
  sands: { name: "Sands of Eon", stats: ["hp_", "def_", "atk_", "ele_mas", "ener_rech"] },
  goblet: { name: "Goblet of Eonothem", stats: ["hp_", "def_", "atk_", "ele_mas", "ele_dmg", "phy_dmg"] },
  circlet: { name: "Circlet of Logos", stats: ["hp_", "def_", "atk_", "ele_mas", "crit_rate", "crit_dmg", "heal_bonu"] },
};
const star5ArtifactsSets = {
  "Wanderer's Troupe": {
    name: "Wanderer's Troupe", rarity: [4, 5], pieces: {
      flower: "Troupe's Dawnlight",
      plume: "Bard's Arrow Feather",
      sands: "Concert's Final Hour",
      goblet: "Wanderer's String-Kettle",
      circlet: "Conductor's Top Hat"
    }
  }, "Viridescent Venerer": {
    name: "Viridescent Venerer", rarity: [4, 5], pieces: {
      flower: "In Remembrance of Viridescent Fields",
      plume: "Viridescent Arrow Feather",
      sands: "Viridescent Venerer's Determination",
      goblet: "Viridescent Venerer's Vessel",
      circlet: "Viridescent Venerer's Diadem"
    }
  }, "Thundersoother": {
    name: "Thundersoother", rarity: [4, 5], pieces: {
      flower: "Thundersoother's Heart",
      plume: "Thundersoother's Plume",
      sands: "Hour of Soothing Thunder",
      goblet: "Thundersoother's Goblet",
      circlet: "Thundersoother's Diadem"
    }
  }, "Thundering Fury": {
    name: "Thundering Fury", rarity: [4, 5], pieces: {
      flower: "Thunderbird's Mercy",
      plume: "Survivor of Catastrophe",
      sands: "Hourglass of Thunder",
      goblet: "Omen of Thunderstorm",
      circlet: "Thunder Summoner's Crown"
    }
  }, "Retracing Bolide": {
    name: "Retracing Bolide", rarity: [4, 5], pieces: {
      flower: "Summer Night's Bloom",
      plume: "Summer Night's Finale",
      sands: "Summer Night's Moment",
      goblet: "Summer Night's Waterballoon",
      circlet: "Summer Night's Mask"
    }
  }, "Noblesse Oblige": {
    name: "Noblesse Oblige", rarity: [4, 5], pieces: {
      flower: "Royal Flora",
      plume: "Royal Plume",
      sands: "Royal Pocket Watch",
      goblet: "Royal Silver Urn",
      circlet: "Royal Masque"
    }
  }, "Maiden Beloved": {
    name: "Maiden Beloved", rarity: [4, 5], pieces: {
      flower: "Maiden's Distant Love",
      plume: "Maiden's Heart-stricken Infatuation",
      sands: "Maiden's Passing Youth",
      goblet: "Maiden's Fleeting Leisure",
      circlet: "Maiden's Fading Beauty"
    }
  }, "Lavawalker": {
    name: "Lavawalker", rarity: [4, 5], pieces: {
      flower: "Lavawalker's Resolution",
      plume: "Lavawalker's Salvation",
      sands: "Lavawalker's Torment",
      goblet: "Lavawalker's Epiphany",
      circlet: "Lavawalker's Wisdom"
    }
  }, "Gladiator's Finale": {
    name: "Gladiator's Finale", rarity: [4, 5], pieces: {
      flower: "Gladiator's Nostalgia",
      plume: "Gladiator's Destiny",
      sands: "Gladiator's Longing",
      goblet: "Gladiator's Intoxication",
      circlet: "Gladiator's Triumphus"
    }
  }, "Crimson Witch of Flames": {
    name: "Crimson Witch of Flames", rarity: [4, 5], pieces: {
      flower: "Witch's Flower of Blaze",
      plume: "Witch's Ever-Burning Plume",
      sands: "Witch's End Time",
      goblet: "Witch's Heart Flames",
      circlet: "Witch's Scorching Hat"
    }
  }, "Bloodstained Chivalry": {
    name: "Bloodstained Chivalry", rarity: [4, 5], pieces: {
      flower: "Bloodstained Flower of Iron",
      plume: "Bloodstained Black Plume",
      sands: "Bloodstained Final Hour",
      goblet: "Bloodstained Chevalier's Goblet",
      circlet: "Bloodstained Iron Mask"
    }
  }, "Archaic Petra": {
    name: "Archaic Petra", rarity: [4, 5], pieces: {
      flower: "Flower of Creviced Cliff",
      plume: "Feather of Jagged Peaks",
      sands: "Sundial of Enduring Jade",
      goblet: "Goblet of Chiseled Crag",
      circlet: "Mask of Solitude Basalt"
    }
  },
  // "":{
  //   name: "", rarity: [4, 5], pieces: {
  //     flower: "",
  //     plume: "",
  //     sands: "",
  //     goblet: "",
  //     circlet: ""
  //   }
  // },
}
const stars = {
  3: { subsBaselow: 1, subBaseHigh: 2, numUpgradesOrUnlocks: 3 },
  4: { subsBaselow: 2, subBaseHigh: 3, numUpgradesOrUnlocks: 4 },
  5: { subsBaselow: 3, subBaseHigh: 4, numUpgradesOrUnlocks: 5 }
};

const mainStats = {
  3: {
    hp: [430, 552, 674, 796, 918, 1040, 1162, 1283, 1405, 1527, 1649, 1771, 1893],
    atk: [28, 36, 44, 52, 60, 68, 76, 84, 91, 99, 107, 115, 123],
    hp_: [5.2, 6.7, 8.2, 9.7, 11.2, 12.7, 14.2, 15.6, 17.1, 18.6, 20.1, 21.6, 23.1],
    atk_: [5.2, 6.7, 8.2, 9.7, 11.2, 12.7, 14.2, 15.6, 17.1, 18.6, 20.1, 21.6, 23.1],
    def_: [6.6, 8.4, 10.3, 12.1, 14.0, 15.8, 17.7, 19.6, 21.4, 23.3, 25.1, 27.0, 28.8],
    phy_dmg: [6.6, 8.4, 10.3, 12.1, 14.0, 15.8, 17.7, 19.6, 21.4, 23.3, 25.1, 27.0, 28.8],
    ele_dmg: [5.2, 6.7, 8.2, 9.7, 11.2, 12.7, 14.2, 15.6, 17.1, 18.6, 20.1, 21.6, 23.1],
    ele_mas: [21, 27, 33, 39, 45, 51, 57, 63, 69, 75, 80, 86, 92],
    ener_rech: [5.8, 7.5, 9.1, 10.8, 12.4, 14.1, 15.7, 17.4, 19.0, 20.7, 22.3, 24.0, 25.6],
    crit_rate: [3.5, 4.5, 5.5, 6.5, 7.5, 8.4, 9.4, 10.4, 11.4, 12.4, 13.4, 14.4, 15.4],
    crit_dmg: [7.0, 9.0, 11.0, 12.9, 14.9, 16.9, 18.9, 20.9, 22.8, 24.8, 26.8, 28.8, 30.8],
    heal_bonu: [4.0, 5.2, 6.3, 7.5, 8.6, 9.8, 10.9, 12.0, 13.2, 14.3, 15.5, 16.6, 17.8],
  },
  4: {
    hp: [645, 828, 1011, 1194, 1377, 1559, 1742, 1925, 2108, 2291, 2474, 2657, 2839, 3022, 3205, 3388, 3571],
    atk: [42, 54, 66, 78, 90, 102, 113, 125, 137, 149, 161, 173, 185, 197, 209, 221, 232],
    hp_: [6.3, 8.1, 9.9, 11.6, 13.4, 15.2, 17.0, 18.8, 20.6, 22.3, 24.1, 25.9, 27.7, 29.5, 31.3, 33.0, 34.8],
    atk_: [6.3, 8.1, 9.9, 11.6, 13.4, 15.2, 17.0, 18.8, 20.6, 22.3, 24.1, 25.9, 27.7, 29.5, 31.3, 33.0, 34.8],
    def_: [7.9, 10.1, 12.3, 14.6, 16.8, 19.0, 21.2, 23.5, 25.7, 27.9, 30.2, 32.4, 34.6, 36.8, 39.1, 41.3, 43.5],
    phy_dmg: [7.9, 10.1, 12.3, 14.6, 16.8, 19.0, 21.2, 23.5, 25.7, 27.9, 30.2, 32.4, 34.6, 36.8, 39.1, 41.3, 43.5],
    ele_dmg: [6.3, 8.1, 9.9, 11.6, 13.4, 15.2, 17.0, 18.8, 20.6, 22.3, 24.1, 25.9, 27.7, 29.5, 31.3, 33.0, 34.8],
    ele_mas: [25, 32, 39, 47, 54, 61, 68, 75, 82, 89, 97, 104, 111, 118, 125, 132, 139],
    ener_rech: [7.0, 9.0, 11.0, 12.9, 14.9, 16.9, 18.9, 20.9, 22.8, 24.8, 26.8, 28.8, 30.8, 32.8, 34.7, 36.7, 38.7],
    crit_rate: [4.2, 5.4, 6.6, 7.8, 9.0, 10.1, 11.3, 12.5, 13.7, 14.9, 16.1, 17.3, 18.5, 19.7, 20.8, 22.0, 23.2],
    crit_dmg: [8.4, 10.8, 13.1, 15.5, 17.9, 20.3, 22.7, 25.0, 27.4, 29.8, 32.2, 34.5, 36.9, 39.3, 41.7, 44.1, 46.4],
    heal_bonu: [4.8, 6.2, 7.6, 9.0, 10.3, 11.7, 13.1, 14.4, 15.8, 17.2, 18.6, 19.9, 21.3, 22.7, 24.0, 25.4, 26.8],
  },
  5: {
    hp: [717, 920, 1123, 1326, 1530, 1733, 1936, 2139, 2342, 2545, 2749, 2952, 3155, 3358, 3561, 3764, 3967, 4171, 4374, 4577, 4780],
    atk: [47, 60, 73, 86, 100, 113, 126, 139, 152, 166, 179, 192, 205, 219, 232, 245, 258, 272, 285, 298, 311],
    hp_: [7.0, 9.0, 11.0, 12.9, 14.9, 16.9, 18.9, 20.9, 22.8, 24.8, 26.8, 28.8, 30.8, 32.8, 34.7, 36.7, 38.7, 40.7, 42.7, 44.6, 46.6],
    atk_: [7.0, 9.0, 11.0, 12.9, 14.9, 16.9, 18.9, 20.9, 22.8, 24.8, 26.8, 28.8, 30.8, 32.8, 34.7, 36.7, 38.7, 40.7, 42.7, 44.6, 46.6],
    def_: [8.7, 11.2, 13.7, 16.2, 18.6, 21.1, 23.6, 26.1, 28.6, 31, 33.5, 36, 38.5, 40.9, 43.4, 45.9, 48.4, 50.8, 53.3, 55.8, 58.3],
    phy_dmg: [8.7, 11.2, 13.7, 16.2, 16.2, 21.1, 23.6, 26.1, 28.6, 31, 33.5, 36, 38.5, 40.9, 43.4, 45.9, 48.4, 50.8, 53.3, 55.8, 58.3],
    ele_dmg: [7.0, 9.0, 11.0, 12.9, 14.9, 16.9, 18.9, 20.9, 22.8, 24.8, 26.8, 28.8, 30.8, 32.8, 34.7, 36.7, 38.7, 40.7, 42.7, 44.6, 46.6],
    ele_mas: [28, 36, 44, 52, 60, 68, 76, 84, 91, 99, 107, 115, 123, 131, 139, 147, 155, 163, 171, 179, 187],
    ener_rech: [7.8, 10.0, 12.2, 14.4, 16.6, 18.8, 21.0, 23.2, 25.4, 27.6, 29.8, 32.0, 34.2, 36.4, 38.6, 40.8, 43.0, 45.2, 47.4, 49.6, 51.8],
    crit_rate: [4.7, 6.0, 7.4, 8.7, 10.0, 11.4, 12.7, 14.0, 15.4, 16.7, 18.0, 19.3, 20.7, 22.0, 23.3, 24.7, 26.0, 27.3, 28.7, 30.0, 31.3],
    crit_dmg: [9.3, 11.9, 14.6, 17.2, 19.9, 22.5, 25.5, 27.8, 30.5, 33.1, 35.8, 38.4, 41.1, 43.7, 46.3, 49.0, 51.6, 54.3, 56.9, 59.6, 62.2],
    heal_bonu: [5.4, 6.9, 8.4, 10.0, 11.5, 13.0, 14.5, 16.1, 17.6, 19.1, 20.6, 22.2, 23.7, 25.2, 26.7, 28.3, 29.8, 31.3, 32.8, 34.4, 35.9],
  }
}

export {
  artifactStats,
  artifactSlots,
  star5ArtifactsSets,
  artifactSubStats,
  stars,
  mainStats
}