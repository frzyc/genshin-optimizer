import ElementalData from "./Data/ElementalData";

export const hitTypes = { hit: "DMG", avgHit: "Avg. DMG", critHit: "CRIT Hit DMG" }
export const hitMoves = { normal: "Normal Att.", charged: "Charged Att.", plunging: "Plunging Att.", elemental: "Elemental Att.", skill: "Ele. Skill", burst: "Ele. Burst" }
export const hitElements = ElementalData
export const transformativeReactions = {
  overloaded: { name: "Overloaded", multi: 2, variants: [ "pyro" ] },
  shattered: { name: "Shattered", multi: 1.5, variants: [ "physical" ] },
  electrocharged: { name: "Electro-Charged", multi: 1.2, variants: [ "electro" ] },
  superconduct: { name: "Superconduct", multi: 0.5, variants: [ "cryo" ] },
  swirl: { name: "Swirl", multi: 0.6, variants: [ "pyro", "hydro", "electro", "cryo" ] },
}
export const amplifyingReactions = {
  vaporize: { name: "Vaporize", variants: { pyro: 1.5, hydro: 2 } },
  melt: { name: "Melt", variants: { pyro: 2, cryo: 1.5 } },
}
export const otherReactions = {
  burning: "Burning",
  crystalize: "Crystalize",
}
export const transformativeReactionLevelMultipliers = [ 0,
  17.2,  18.5,  19.9,  21.3,  22.6,  24.6,  26.6,  28.9,  31.4,  34.1,
  37.2,  40.7,  44.4,  48.6,  53.7,  59.1,  64.4,  69.7,  75.1,  80.6,
  86.1,  91.7,  97.2, 102.8, 108.4, 113.2, 118.1, 123.0, 129.7, 136.3,
 142.7, 149.0, 155.4, 161.8, 169.1, 176.5, 184.1, 191.7, 199.6, 207.4,
 215.4, 224.2, 233.5, 243.4, 256.1, 268.5, 281.5, 295.0, 309.1, 323.6,
 336.8, 350.5, 364.5, 378.6, 398.6, 416.4, 434.4, 452.6, 471.4, 490.5,
 509.5, 532.8, 556.4, 580.1, 607.9, 630.2, 652.9, 675.2, 697.8, 720.2,
 742.5, 765.2, 784.4, 803.4, 830.9, 854.4, 877.8, 900.1, 923.8, 946.4,
 968.6, 991.0,1013.5,1036.1,1066.6,1090.0,1115.0,1141.7,1171.9,1202.8,
1202.8,1233.9,1264.7,1305.7,1346.1,1468.9,1524.0,1577.0,1627.6,1674.8,
]
export const crystalizeLevelMultipliers = [ 0,
  91,  99, 106, 114, 121, 129, 136, 144, 151, 159,
 170, 181, 192, 204, 216, 228, 248, 268, 287, 304,
 320, 337, 352, 368, 384, 394, 405, 416, 427, 438,
 448, 459, 470, 481, 490, 499, 513, 529, 544, 557,
 574, 591, 607, 622, 638, 649, 667, 684, 702, 715,
 733, 750, 767, 784, 800, 814, 834, 855, 876, 896,
 915, 936, 956, 982,1003,1017,1036,1057,1075,1096,
1114,1135,1149,1170,1191,1205,1224,1243,1260,1277,
1293,1308,1317,1327,1336,1349,1366,1384,1403,1424,
1450,1478,1507,1543,1570,1580,1589,1673,1682,1691,
]