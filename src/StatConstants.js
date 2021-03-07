import ElementalData from "./Data/ElementalData";

export const hitTypes = { hit: "DMG", avgHit: "Avg. DMG", critHit: "CRIT Hit DMG" }
export const hitMoves = { normal: "Normal Att.", charged: "Charged Att.", plunging: "Plunging Att.", skill: "Ele. Skill", burst: "Ele. Burst" }
export const hitElements = ElementalData
export const transformativeReactions = {
  overloaded: [ "Overloaded", "pyro", 4 ],
  shattered: [ "Shattered", "physical", 3 ],
  electrocharged: [ "Electro-Charged", "electro", 2.4 ],
  superconduct: [ "Superconduct", "cryo", 1 ],
  swirl: [ "Swirl", "anemo", 1.2 ],
}
export const amplifyingReactions = {
  vaporize: ["Vaporize", { pyro: 1.5, hydro: 2 }],
  melt: ["Melt", { pyro: 2, cryo: 1.5 }],
}
export const otherReactions = {
  burning: "Burning",
  crystalize: "Crystalize",
}
export const ReactionMatrix = {
  overloaded: [37.4371542286, -4.3991155718, 0.9268181504, -0.0314790536, 0.0005189440, -0.0000027646],
  superconduct: [7.4972486411, -0.4750909512, 0.1836799174, -0.0064237710, 0.0001110078, -0.0000006038],
  electrocharged: [20.8340255487, -1.6987232790, 0.4742385201, -0.0162160738, 0.0002746679, -0.0000014798],
  shattered: [31.2160750111, -3.7397755267, 0.7174530144, -0.0239673351, 0.0003895953, -0.0000020555],
  swirl: [13.5157684329, -1.7733381829, 0.3097567417, -0.0103922088, 0.0001679502, -0.0000008854],
  crystalize: [83.06561, -4.42541, 0.5568372, -0.01637168, 0.0002253889, -0.000001088197]
}
