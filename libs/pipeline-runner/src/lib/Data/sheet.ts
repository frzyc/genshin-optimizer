const data = {
  normal: {
    hit1: [3055536446, "skillParam"],
    hit2: [4227359038, "skillParam"],
    hit3: [2305589495, "skillParam"],
    hit4: [3199213815, "skillParam"],
    hit5: [2341141698, "skillParam"],
    hit6: [3407801690, "skillParam"],
  },
  charged: {
    //Charged Attack DMG
    dmg: [2106332570, "skillParam"],
    //Charged Attack Spinning DMG
    spinning: [1418022206, "skillParam"],
    //Charged Attack Final DMG
    final: [2546438498, "skillParam"],
    //Charged Attack Stamina Cost
    stamina: [156974530, "skillParam"],
    //Aimed Shot
    aimed: [552178514, "skillParam"],
    //Fully-Charged Aimed Shot
    fullyAimed: [2413134783, "skillParam"],
  },
  plunging: {
    dmg: [1427729869, "skillParam"],
    low: [3909231348, "plungeLow"],
    high: [3909231348, "plungeHigh"],
  },

  //COMMON

  //Max Duration
  maxDuration: [3941187316, "skillParam"],
  //Max Stacks
  maxStacks: [3866880591, "skillParam"],
  //Skill DMG
  skillDMG: [2068254014, "skillParam"],
  //Burst DMG
  burstDMG: [1434446270, "skillParam"],
  //DMG Absorption
  dmgAbsorption: [1339275302, "skillParam"],
  //Healing
  healing: [1082735766, "skillParam"],
  //Duration
  duration: [1150944327, "skillParam"],
  //CD
  cd: [2052795463, "skillParam"],
  //Energy Cost
  energyCost: [3073197810, "skillParam"],
  //Base DMG
  baseDMG: [430832806, "skillParam"],
  //DoT
  dot: [1521507646, "skillParam"],
  //Additional Elemental DMG
  addEleDMG: [3006681174, "skillParam"],

  press: {
    //Press DMG
    dmg: [3774314422, "skillParam"],
    //Press CD
    cd: [956030924, "skillParam"],
  },
  hold: {
    //Hold DMG
    dmg: [1066722967, "skillParam"],
    //CD (Hold)
    cd: [824598127, "skillParam"],
  },
  element: {
    anemo: 126875444,
    geo: 1844983962,
    pyro: 313529204,
    hydro: 514679490,
    cryo: 1695600284,
    electro: 1821644548,
    dendro: 3552853794,
  },
  reaction: {
    swirl: 3332129203,
    crystallize: 4119674923,
    overloaded: 3538822411,
    electrocharged: 1625280307,
    superconduct: 3913817859,
    vaporize: 3111567595,
    melt: 3497793651,
    // Technically this should be 'rupture', but I don't see a 'rupture' string
    bloom: 3593652061, // or maybe it is 4074539307
    burgeon: 2021015747,
    hyperbloom: 2697794115,
    quicken: 347446227,
    aggravate: 2961120579,
    spread: 2191579811, // or maybe it is 982642368
  }
} as const
export default data
