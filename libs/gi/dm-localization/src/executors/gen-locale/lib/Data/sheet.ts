const data = {
  normal: {
    hit1: [3055536446, 'skillParam'],
    hit2: [4227359038, 'skillParam'],
    hit3: [2305589495, 'skillParam'],
    hit4: [3199213815, 'skillParam'],
    hit5: [2341141698, 'skillParam'],
    hit6: [3407801690, 'skillParam'],
  },
  charged: {
    //Charged Attack DMG
    dmg: [2106332570, 'skillParam'],
    //Charged Attack Spinning DMG
    spinning: [1418022206, 'skillParam'],
    //Charged Attack Final DMG
    final: [2546438498, 'skillParam'],
    //Charged Attack Stamina Cost
    stamina: [156974530, 'skillParam'],
    //Aimed Shot
    aimed: [552178514, 'skillParam'],
    //Fully-Charged Aimed Shot
    fullyAimed: [2413134783, 'skillParam'],
  },
  plunging: {
    dmg: [1427729869, 'skillParam'],
    low: [3909231348, 'plungeLow'],
    high: [3909231348, 'plungeHigh'],
  },

  //COMMON

  //Max Duration
  maxDuration: [3941187316, 'skillParam'],
  //Max Stacks
  maxStacks: [3866880591, 'skillParam'],
  //Skill DMG
  skillDMG: [2068254014, 'skillParam'],
  //Burst DMG
  burstDMG: [1434446270, 'skillParam'],
  //Shield DMG Absorption
  dmgAbsorption: [3265472006, 'skillParam'],
  //Healing
  healing: [1082735766, 'skillParam'],
  //Continuous Healing
  contHealing: [3331608342, 'skillParam'],
  //Duration
  duration: [1150944327, 'skillParam'],
  //CD
  cd: [2052795463, 'skillParam'],
  //Energy Cost
  energyCost: [3073197810, 'skillParam'],
  //Energy Regeneration
  energyRegen: [2165261751, 'skillParam'],
  //Base DMG
  baseDMG: [430832806, 'skillParam'],
  //DoT
  dot: [1521507646, 'skillParam'],
  //Additional Elemental DMG
  addEleDMG: [3006681174, 'skillParam'],
  //HP Regeneration Per Hit
  hpRegenPerHit: [3642811974, 'skillParam'],
  press: {
    //Press DMG
    dmg: [3774314422, 'skillParam'],
    //Press CD
    cd: [956030924, 'skillParam'],
  },
  hold: {
    //Hold DMG
    dmg: [1066722967, 'skillParam'],
    //CD (Hold)
    cd: [824598127, 'skillParam'],
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
    bloom: 1216168406,
    burgeon: 2021015747,
    hyperbloom: 2697794115,
    quicken: 347446227,
    aggravate: 2961120579,
    spread: 2191579811,
  },
  stat: {
    def: 3591287138, //maybe it's 527947494 or 1575853882
    dmgBonus: {},
    base: {
      atk: 2634860079, //maybe it's 2334963823
    },
    res: {},
    misc: {},
  },
  // Constellation Lv. {{level}}
  constellationLvl: [892900816, 'constellation'],
  // Talent Lv. {{level}}
  talentLvl: [1647967600, 'talent'],
  talents: {
    // Normal Attack
    auto: 1171619685, // or 1653327868
    // Elemental Skill
    skill: 3477257188, // or 4260972229
    // Elemental Burst
    burst: 3250738285, // 2453877364 3626565793 3152729845
    // Altenate Sprint
    altSprint: [3378550992, 'altSprint'], // mona's desc
  },
  // Unlocks at Character Ascension Phase 1
  unlockPassive1: [941237898, 'passive1'],
  // Unlocks at Character Ascension Phase 4
  unlockPassive2: [941237898, 'passive4'],
  // Passive Talent
  unlockPassive3: 2602723764,
  // Unlocks after completing the prerequisite quests
  unlockLockedPassive: 2816162158,
  // Witch's Homework
  witchPassive: 3169849014,
  // Moonsign
  moonsign: 47522259,
  // Hexerei
  hexerei: 218825378,
} as const
export default data
