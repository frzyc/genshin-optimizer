export const hitTypes = { hit: "DMG", avgHit: "Avg. DMG", critHit: "CRIT Hit DMG" } as const
export const hitMoves = { normal: "Normal Att.", charged: "Charged Att.", plunging: "Plunging Att.", elemental: "Elemental Att.", skill: "Ele. Skill", burst: "Ele. Burst" } as const
export type HitMoveKey = keyof typeof hitMoves
export const transformativeReactions = {
  overloaded: { name: "Overloaded", multi: 2, variants: ["pyro"] },
  shattered: { name: "Shattered", multi: 1.5, variants: ["physical"] },
  electrocharged: { name: "Electro-Charged", multi: 1.2, variants: ["electro"] },
  superconduct: { name: "Superconduct", multi: 0.5, variants: ["cryo"] },
  swirl: { name: "Swirl", multi: 0.6, variants: ["pyro", "hydro", "electro", "cryo"] },
} as const
export type TransformativeReactionsKey = keyof typeof transformativeReactions
export const amplifyingReactions = {
  vaporize: { name: "Vaporize", variants: { pyro: 1.5, hydro: 2 } },
  melt: { name: "Melt", variants: { pyro: 2, cryo: 1.5 } },
} as const
export type AmplifyingReactionsKey = keyof typeof amplifyingReactions
export const otherReactions = {
  burning: "Burning",
  crystallize: "Crystallize",
} as const
