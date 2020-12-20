const ArtifactMainSlotKeys = [
  "hp", "hp_", "atk", "atk_", "def", "def_", "phy_dmg", "ele_dmg", "ele_mas", "ener_rech", "crit_rate", "crit_dmg", "heal_bonu"
]

const ArtifactStarsData = {
  3: { subsBaselow: 1, subBaseHigh: 2, numUpgradesOrUnlocks: 3 },
  4: { subsBaselow: 2, subBaseHigh: 3, numUpgradesOrUnlocks: 4 },
  5: { subsBaselow: 3, subBaseHigh: 4, numUpgradesOrUnlocks: 5 }
};

const ArtifactMainStatsData = {
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
    phy_dmg: [8.7, 11.2, 13.7, 16.2, 18.6, 21.1, 23.6, 26.1, 28.6, 31, 33.5, 36, 38.5, 40.9, 43.4, 45.9, 48.4, 50.8, 53.3, 55.8, 58.3],
    ele_dmg: [7.0, 9.0, 11.0, 12.9, 14.9, 16.9, 18.9, 20.9, 22.8, 24.8, 26.8, 28.8, 30.8, 32.8, 34.7, 36.7, 38.7, 40.7, 42.7, 44.6, 46.6],
    ele_mas: [28, 36, 44, 52, 60, 68, 76, 84, 91, 99, 107, 115, 123, 131, 139, 147, 155, 163, 171, 179, 187],
    ener_rech: [7.8, 10.0, 12.2, 14.4, 16.6, 18.8, 21.0, 23.2, 25.4, 27.6, 29.8, 32.0, 34.2, 36.4, 38.6, 40.8, 43.0, 45.2, 47.4, 49.6, 51.8],
    crit_rate: [4.7, 6.0, 7.4, 8.7, 10.0, 11.4, 12.7, 14.0, 15.4, 16.7, 18.0, 19.3, 20.7, 22.0, 23.3, 24.7, 26.0, 27.3, 28.7, 30.0, 31.3],
    crit_dmg: [9.3, 11.9, 14.6, 17.2, 19.9, 22.5, 25.5, 27.8, 30.5, 33.1, 35.8, 38.4, 41.1, 43.7, 46.3, 49.0, 51.6, 54.3, 56.9, 59.6, 62.2],
    heal_bonu: [5.4, 6.9, 8.4, 10.0, 11.5, 13.0, 14.5, 16.1, 17.6, 19.1, 20.6, 22.2, 23.7, 25.2, 26.7, 28.3, 29.8, 31.3, 32.8, 34.4, 35.9],
  }
}

const ArtifactSubStatsData = {
  hp: { 2: [50, 61, 72], 3: [100, 115, 129, 143], 4: [167, 191, 215, 239], 5: [209, 239, 269, 299] },
  hp_: { 2: [1.6, 2, 2.3], 3: [2.5, 2.8, 3.2, 3.5], 4: [3.3, 3.7, 4.2, 4.7], 5: [4.1, 4.7, 5.3, 5.8] },
  atk: { 2: [3, 4, 5], 3: [7, 8, 9], 4: [11, 12, 14, 16], 5: [14, 16, 18, 19] },
  atk_: { 2: [1.6, 2, 2.3], 3: [2.5, 2.8, 3.2, 3.5], 4: [3.3, 3.7, 4.2, 4.7], 5: [4.1, 4.7, 5.3, 5.8] },
  def: { 2: [4, 5, 6], 3: [8, 9, 10, 11], 4: [13, 15, 17, 19], 5: [16, 19, 21, 23] },
  def_: { 2: [2, 2.5, 2.9], 3: [3.1, 3.5, 3.9, 4.4], 4: [4.1, 4.7, 5.3, 5.8], 5: [5.1, 5.8, 6.6, 7.3] },
  ele_mas: { 2: [7, 8, 9], 3: [10, 11, 13, 14], 4: [13, 15, 17, 19], 5: [16, 19, 21, 23] },
  ener_rech: { 2: [1.8, 2.2, 2.6], 3: [2.7, 3.1, 3.5, 3.9], 4: [3.6, 4.1, 4.7, 5.2], 5: [4.5, 5.2, 5.8, 6.5] },
  crit_rate: { 2: [1.1, 1.3, 1.6], 3: [1.6, 1.9, 2.1, 2.3], 4: [2.2, 2.5, 2.8, 3.1], 5: [2.7, 3.1, 3.5, 3.9] },
  crit_dmg: { 2: [2.2, 2.6, 3.1], 3: [3.3, 3.7, 4.2, 4.7], 4: [4.4, 5, 5.6, 6.2], 5: [5.4, 6.2, 7, 7.8] },
}

const ArtifactSlotsData = {
  flower: { name: "Flower of Life", stats: ["hp"] },
  plume: { name: "Plume of Death", stats: ["atk"] },
  sands: { name: "Sands of Eon", stats: ["hp_", "def_", "atk_", "ele_mas", "ener_rech"] },
  goblet: { name: "Goblet of Eonothem", stats: ["hp_", "def_", "atk_", "ele_mas", "phy_dmg", "anemo_ele_dmg", "geo_ele_dmg", "electro_ele_dmg", "hydro_ele_dmg", "pyro_ele_dmg", "cryo_ele_dmg",] },
  circlet: { name: "Circlet of Logos", stats: ["hp_", "def_", "atk_", "ele_mas", "crit_rate", "crit_dmg", "heal_bonu"] },
};
const ArtifactSetsData = {
  "Wanderer's Troupe": {
    name: "Wanderer's Troupe", rarity: [4, 5], pieces: {
      flower: "Troupe's Dawnlight",
      plume: "Bard's Arrow Feather",
      sands: "Concert's Final Hour",
      goblet: "Wanderer's String-Kettle",
      circlet: "Conductor's Top Hat"
    },
    sets: {
      2: {
        text: "Elemental Mastery +80",
        stats: {
          ele_mas: 80
        }
      },
      4: {
        text: "Increases Charged Attack DMG by 35% if the character uses a Catalyst or Bow.",
        stats: {}
      }
    }
  }, "Viridescent Venerer": {
    name: "Viridescent Venerer", rarity: [4, 5], pieces: {
      flower: "In Remembrance of Viridescent Fields",
      plume: "Viridescent Arrow Feather",
      sands: "Viridescent Venerer's Determination",
      goblet: "Viridescent Venerer's Vessel",
      circlet: "Viridescent Venerer's Diadem"
    },
    sets: {
      2: {
        text: "Anemo DMG Bonus +15%",
        stats: { anemo_ele_dmg: 15 }
      },
      4: {
        text: "Increases Swirl DMG by 60%. Decreases opponent's Elemental RES to the element infused in the Swirl by 40% for 10s.",
        stats: {}
      }
    }
  }, "Thundersoother": {
    name: "Thundersoother", rarity: [4, 5], pieces: {
      flower: "Thundersoother's Heart",
      plume: "Thundersoother's Plume",
      sands: "Hour of Soothing Thunder",
      goblet: "Thundersoother's Goblet",
      circlet: "Thundersoother's Diadem"
    },
    sets: {
      2: {
        text: "Electro RES increased by 40%",
        stats: { electro_ele_Res: 40 }
      },
      4: {
        text: "Increases DMG against enemies affected by Electro by 35%.",
        stats: {}
      }
    }
  }, "Thundering Fury": {
    name: "Thundering Fury", rarity: [4, 5], pieces: {
      flower: "Thunderbird's Mercy",
      plume: "Survivor of Catastrophe",
      sands: "Hourglass of Thunder",
      goblet: "Omen of Thunderstorm",
      circlet: "Thunder Summoner's Crown"
    },
    sets: {
      2: {
        text: "Electro DMG Bonus +15%",
        stats: { electro_ele_dmg: 15 }
      },
      4: {
        text: "Increases damage caused by Overloaded, Electro-Charged, and Superconduct DMG by 40%. Triggering such effects decreases Elemental Skill CD by 1s. Can only occur once every 0.8s.",
        stats: {}
      }
    }
  }, "Retracing Bolide": {
    name: "Retracing Bolide", rarity: [4, 5], pieces: {
      flower: "Summer Night's Bloom",
      plume: "Summer Night's Finale",
      sands: "Summer Night's Moment",
      goblet: "Summer Night's Waterballoon",
      circlet: "Summer Night's Mask"
    },
    sets: {
      2: {
        text: "Increases the effectiveness of shields by 35%",
        stats: { pow_shield: 35 }
      },
      4: {
        text: "Gain an additional 40% Normal and Charged Attack DMG while under the protection of a shield.",
        stats: {}
      }
    }
  }, "Noblesse Oblige": {
    name: "Noblesse Oblige", rarity: [4, 5], pieces: {
      flower: "Royal Flora",
      plume: "Royal Plume",
      sands: "Royal Pocket Watch",
      goblet: "Royal Silver Urn",
      circlet: "Royal Masque"
    },
    sets: {
      2: {
        text: "Elemental Burst DMG +20%",
        stats: { burst_dmg: 20 }
      },
      4: {
        text: "Using an Elemental Burst increase all party members' ATK by 20% for 12s. This effect cannot stack.",
        stats: {}
      }
    }
  }, "Maiden Beloved": {
    name: "Maiden Beloved", rarity: [4, 5], pieces: {
      flower: "Maiden's Distant Love",
      plume: "Maiden's Heart-stricken Infatuation",
      sands: "Maiden's Passing Youth",
      goblet: "Maiden's Fleeting Leisure",
      circlet: "Maiden's Fading Beauty"
    },
    sets: {
      2: {
        text: "Character Healing Effectiveness +15%",
        stats: { heal_bonu: 15 }
      },
      4: {
        text: "Using an Elemental Skill or Burst increases healing received by all party members by 20% for 10s.",
        stats: {}
      }
    }
  }, "Lavawalker": {
    name: "Lavawalker", rarity: [4, 5], pieces: {
      flower: "Lavawalker's Resolution",
      plume: "Lavawalker's Salvation",
      sands: "Lavawalker's Torment",
      goblet: "Lavawalker's Epiphany",
      circlet: "Lavawalker's Wisdom"
    },
    sets: {
      2: {
        text: "Pyro RES increased by 40%",
        stats: { pyro_ele_res: 40 }
      },
      4: {
        text: "Increases DMG against enemies that are Burning or affected by Pyro by 35%.",
        stats: {}
      }
    }
  }, "Gladiator's Finale": {
    name: "Gladiator's Finale", rarity: [4, 5], pieces: {
      flower: "Gladiator's Nostalgia",
      plume: "Gladiator's Destiny",
      sands: "Gladiator's Longing",
      goblet: "Gladiator's Intoxication",
      circlet: "Gladiator's Triumphus"
    },
    sets: {
      2: {
        text: "ATK +18%",
        stats: { atk_: 18 }
      },
      4: {
        text: "If the wielder of this artifact set uses a Sword, Claymore or Polearm, increases their Normal Attack DMG by 35%.",
        stats: {}
      }
    }
  }, "Crimson Witch of Flames": {
    name: "Crimson Witch of Flames", rarity: [4, 5], pieces: {
      flower: "Witch's Flower of Blaze",
      plume: "Witch's Ever-Burning Plume",
      sands: "Witch's End Time",
      goblet: "Witch's Heart Flames",
      circlet: "Witch's Scorching Hat"
    },
    sets: {
      2: {
        text: "Pyro DMG Bonus +15%",
        stats: { pyro_ele_dmg: 15 }
      },
      4: {
        text: "Increases Overloaded and Burning DMG by 40%. Increases Vaporize and Melt DMG by 15%. Using an Elemental Skill increases 2-Piece Set effects by 50% for 10s. Max 3 stacks.",
        stats: {}
      }
    }
  }, "Bloodstained Chivalry": {
    name: "Bloodstained Chivalry", rarity: [4, 5], pieces: {
      flower: "Bloodstained Flower of Iron",
      plume: "Bloodstained Black Plume",
      sands: "Bloodstained Final Hour",
      goblet: "Bloodstained Chevalier's Goblet",
      circlet: "Bloodstained Iron Mask"
    },
    sets: {
      2: {
        text: "Physical DMG +25%",
        stats: { phy_dmg: 25 }
      },
      4: {
        text: "After defeating an opponent, increases Charged Attack DMG by 50%, and reduces its Stamina cost to 0 for 10s.",
        stats: {}
      }
    }
  }, "Archaic Petra": {
    name: "Archaic Petra", rarity: [4, 5], pieces: {
      flower: "Flower of Creviced Cliff",
      plume: "Feather of Jagged Peaks",
      sands: "Sundial of Enduring Jade",
      goblet: "Goblet of Chiseled Crag",
      circlet: "Mask of Solitude Basalt"
    },
    sets: {
      2: {
        text: "	Gain a 15% Geo DMG Bonus",
        stats: { geo_ele_dmg: 15 }
      },
      4: {
        text: "Upon obtaining a crystal created through a Geo Elemental Reaction, all party members gain 35% RES to that particular element for 10s. Only one form of Elemental RES can be gained in this manner at any one time. Upon obtaining a crystal created through a Geo Elemental Reaction, all party members gain 35% RES to that particular element for 10s. Only one form of Elemental RES can be gained in this manner at any one time.",
        stats: {}
      }
    }
  },
  "Scholar": {
    name: "Scholar", rarity: [3, 4], pieces: {
      flower: "Scholar's Bookmark",
      plume: "Scholar's Quill Pen",
      sands: "Scholar's Clock",
      goblet: "Scholar's Ink Cup",
      circlet: "Scholar's Lens"
    },
    sets: {
      2: {
        text: "Energy Recharge +20%",
        stats: { ener_rech: 20 }
      },
      4: {
        text: "Gaining Energy gives 3 Energy to all party members who have a bow or a catalyst equipped. Can only occur once every 3s.",
        stats: {}
      }
    }
  },
  "Gambler": {
    name: "Gambler", rarity: [3, 4], pieces: {
      flower: "Gambler's Brooch",
      plume: "Gambler's Feathered Accessory",
      sands: "Gambler's Pocket Watch",
      goblet: "Gambler's Dice Cup",
      circlet: "Gambler's Earrings"
    },
    sets: {
      2: {
        text: "Elemental Skill DMG increased by 20%",
        stats: { skill_dmg: 20 }
      },
      4: {
        text: "Defeating an enemy has 100% chance to remove Elemental Skill CD. Can only occur once every 15s.",
        stats: {}
      }
    }
  },
  "Brave Heart": {
    name: "Brave Heart", rarity: [3, 4], pieces: {
      flower: "Medal of the Brave",
      plume: "Prospect of the Brave",
      sands: "Fortitude of the Brave",
      goblet: "Outset of the Brave",
      circlet: "Crown of the Brave"
    },
    sets: {
      2: {
        text: "2-piece Set Bonus: ATK +18%",
        stats: { atk_: 18 }
      },
      4: {
        text: "Increases DMG by 30% against enemies with more than 50% HP.",
        stats: {}
      }
    }
  },
  "Tiny Miracle": {
    name: "Tiny Miracle", rarity: [3, 4], pieces: {
      flower: "Tiny Miracle's Flower",
      plume: "Tiny Miracle's Feather",
      sands: "Tiny Miracle's Hourglass",
      goblet: "Tiny Miracle's Goblet",
      circlet: "Tiny Miracle's Earrings"
    },
    sets: {
      2: {
        text: "All Elemental RES increased by 20%",
        stats: {
          anemo_ele_res: 20,
          geo_ele_res: 20,
          electro_ele_res: 20,
          hydro_ele_res: 20,
          pyro_ele_res: 20,
          cryo_ele_res: 20,
        }
      },
      4: {
        text: "Incoming elemental DMG increases corresponding Elemental RES by 30% for 10s. Can only occur once every 10s.",
        stats: {}
      }
    }
  },
  "Defender's Will": {
    name: "Defender's Will", rarity: [3, 4], pieces: {
      flower: "Guardian's Flower",
      plume: "Guardian's Sigil",
      sands: "Guardian's Clock",
      goblet: "Guardian's Vessel",
      circlet: "Guardian's Band"
    },
    sets: {
      2: {
        text: "Base DEF +30%",
        stats: { def_: 30 }
      },
      4: {
        text: "Increases Elemental RES by 30% for each element present in the party.",
        stats: {}
      }
    }
  },
  "Martial Artist": {
    name: "Martial Artist", rarity: [3, 4], pieces: {
      flower: "Martial Artist's Red Flower",
      plume: "Martial Artist's Feathered Accessory",
      sands: "Martial Artist's Water Hourglass",
      goblet: "Martial Artist's Wine Cup",
      circlet: "Martial Artist's Bandana"
    },
    sets: {
      2: {
        text: "Increases Normal Attack and Charged Attack DMG by 15%.",
        stats: {
          norm_atk_dmg: 15,
          char_atk_dmg: 15
        }
      },
      4: {
        text: "After using Elemental Skill, increases Normal Attack and Charged Attack DMG by 25% for 8s.",
        stats: {}
      }
    }
  },
  "Resolution of Sojourner": {
    name: "Resolution of Sojourner", rarity: [3, 4], pieces: {
      flower: "Heart of Comradeship",
      plume: "Feather of Homecoming",
      sands: "Sundial of the Sojourner",
      goblet: "Goblet of the Sojourner",
      circlet: "Crown of Parting"
    },
    sets: {
      2: {
        text: "ATK +18%",
        stats: { atk_: 18 }
      },
      4: {
        text: "Increases Charged Attack CRIT Rate by 30%.",
        stats: {}
      }
    }
  },
  "The Exile": {
    name: "The Exile", rarity: [3, 4], pieces: {
      flower: "Exile's Flower",
      plume: "Exile's Feather",
      sands: "Exile's Pocket Watch",
      goblet: "Exile's Goblet",
      circlet: "Exile's Circlet"
    },
    sets: {
      2: {
        text: "Energy Recharge +20%",
        stats: { ener_rech: 20 }
      },
      4: {
        text: "Using an Elemental Burst regenerates 2 Energy for other party members every 2s for 6s. This effect cannot stack.",
        stats: {}
      }
    }
  },
  "Berserker": {
    name: "Berserker", rarity: [3, 4], pieces: {
      flower: "Berserker's Rose",
      plume: "Berserker's Indigo Feather",
      sands: "Berserker's Timepiece",
      goblet: "Berserker's Bone Goblet",
      circlet: "Berserker's Battle Mask"
    },
    sets: {
      2: {
        text: "CRIT Rate +12%",
        stats: { crit_rate: 12 }
      },
      4: {
        text: "When HP is below 70%, CRIT Rate increases by an additional 24%.",
        stats: {}
      }
    }
  },
  "Instructor": {
    name: "Instructor", rarity: [3, 4], pieces: {
      flower: "Instructor's Brooch",
      plume: "Instructor's Feathered Accessory",
      sands: "Instructor's Pocket Watch",
      goblet: "Instructor's Tea Cup",
      circlet: "Instructor's Cap"
    },
    sets: {
      2: {
        text: "Increases Elemental Mastery by 80.",
        stats: { ele_mas: 80 }
      },
      4: {
        text: "After using Elemental Skill, increases all party members' Elemental Mastery by 120 for 8s.",
        stats: {}
      }
    }
  },
  "Traveling Doctor": {
    name: "Traveling Doctor", rarity: [3], pieces: {
      flower: "Traveling Doctor's Medicine Pot",
      plume: "Traveling Doctor's Handkerchief",
      sands: "Traveling Doctor's Pocket Watch",
      goblet: "Traveling Doctor's Silver Lotus",
      circlet: "Traveling Doctor's Owl Feather"
    },
    sets: {
      2: {
        text: "Increases incoming healing by 20%.",
        stats: { inc_heal: 20 }
      },
      4: {
        text: "Using Elemental Burst restores 20% HP.",
        stats: {}
      }
    }
  },
  "Lucky Dog": {
    name: "Lucky Dog", rarity: [3], pieces: {
      flower: "Lucky Dog's Clover",
      plume: "Lucky Dog's Eagle Feather",
      sands: "Lucky Dog's Hourglass",
      goblet: "Lucky Dog's Goblet",
      circlet: "Lucky Dog's Silver Circlet"
    },
    sets: {
      2: {
        text: "DEF increased by 100.",
        stats: { def: 100 }
      },
      4: {
        text: "Picking up Mora restores 300 HP.",
        stats: {}
      }
    }
  },
  "Adventurer": {
    name: "Adventurer", rarity: [3], pieces: {
      flower: "Adventurer's Flower",
      plume: "Adventurer's Tail Feather",
      sands: "Adventurer's Pocket Watch",
      goblet: "Adventurer's Golden Goblet",
      circlet: "Adventurer's Bandana"
    },
    sets: {
      2: {
        text: "Max HP increased by 1,000.",
        stats: { hp: 1000 }
      },
      4: {
        text: "Opening chest regenerates 30% Max HP over 5s.",
        stats: {}
      }
    }
  },
  "Prayers of Wisdom": {
    name: "Prayers of Wisdom", rarity: [3, 4], pieces: {
      circlet: "Tiara of Thunder"
    },
    sets: {
      1: {
        text: "Affected by Electro for 40% less time.",
        stats: {}
      }
    }
  },
  "Prayers of Springtime": {
    name: "Prayers of Springtime", rarity: [3, 4], pieces: {
      circlet: "Tiara of Frost"
    },
    sets: {
      1: {
        text: "Affected by Cryo for 40% less time.",
        stats: {}
      }
    }
  },
  "Prayers of Illumination": {
    name: "Prayers of Illumination", rarity: [3, 4], pieces: {
      circlet: "Tiara of Flame"
    },
    sets: {
      1: {
        text: "Affected by Pyro for 40% less time.",
        stats: {}
      }
    }
  },
  "Prayers of Destiny": {
    name: "Prayers of Destiny", rarity: [3, 4], pieces: {
      circlet: "Tiara of Torrents"
    },
    sets: {
      1: {
        text: "Affected by Hydro for 40% less time.",
        stats: {}
      }
    }
  },
  // "": {
  //   name: "", rarity: [4, 5], pieces: {
  //     flower: "",
  //     plume: "",
  //     sands: "",
  //     goblet: "",
  //     circlet: ""
  //   },
  //   sets: {
  //     2: {
  //       text: "",
  //       stats: {}
  //     },
  //     4: {
  //       text: "",
  //       stats: {}
  //     }
  //   }
  // },
}
export {
  ArtifactMainSlotKeys,
  ArtifactSlotsData,
  ArtifactSetsData,
  ArtifactSubStatsData,
  ArtifactStarsData,
  ArtifactMainStatsData
}