import type { AbilityKey } from './character';
export declare const allRarityKeys: readonly [5, 4, 3, 2, 1];
export type RarityKey = (typeof allRarityKeys)[number];
export declare const otherStatKeys: readonly ["spd_", "dmg_", "weakness_", "resPen_", "incHeal_", "baseSpd", "common_dmg_"];
export declare const allStatKeys: ("hp" | "atk" | "def" | "hp_" | "atk_" | "def_" | "spd" | "crit_" | "crit_dmg_" | "eff_" | "eff_res_" | "brEffect_" | "physical_dmg_" | "fire_dmg_" | "ice_dmg_" | "lightning_dmg_" | "wind_dmg_" | "quantum_dmg_" | "imaginary_dmg_" | "heal_" | "enerRegen_" | "spd_" | "dmg_" | "weakness_" | "resPen_" | "incHeal_" | "baseSpd" | "common_dmg_")[];
export type StatKey = (typeof allStatKeys)[number];
export declare const allElementalDamageKeys: readonly ["physical_dmg_", "fire_dmg_", "ice_dmg_", "wind_dmg_", "lightning_dmg_", "quantum_dmg_", "imaginary_dmg_"];
export type ElementalDamageKey = (typeof allElementalDamageKeys)[number];
export declare const allAscensionKeys: readonly [0, 1, 2, 3, 4, 5, 6];
export type AscensionKey = (typeof allAscensionKeys)[number];
export declare const ascensionMaxLevel: readonly [20, 30, 40, 50, 60, 70, 80];
export declare const maxLevel = 80;
export declare const ambiguousLevel: (level: number) => boolean;
export declare const milestoneLevels: readonly [readonly [80, 6], readonly [70, 6], readonly [70, 5], readonly [60, 5], readonly [60, 4], readonly [50, 4], readonly [50, 3], readonly [40, 3], readonly [40, 2], readonly [30, 2], readonly [30, 1], readonly [20, 1], readonly [20, 0], readonly [1, 0]];
export declare const getLevelString: (level: number, ascension: AscensionKey) => string;
export declare function validateLevelAsc(level: number, ascension: AscensionKey): {
    level: number;
    ascension: AscensionKey;
};
export declare const abilityLimits: readonly [1, 2, 3, 4, 6, 8, 10];
export declare const basicAbilityLimits: readonly [1, 1, 2, 3, 4, 5, 6];
export declare const allAbilityLimits: Record<Exclude<AbilityKey, 'technique' | 'overworld'>, typeof abilityLimits | typeof basicAbilityLimits>;
export declare const allPathKeys: readonly ["Erudition", "Preservation", "Abundance", "Nihility", "Destruction", "Harmony", "TheHunt", "Remembrance"];
export type PathKey = (typeof allPathKeys)[number];
//# sourceMappingURL=common.d.ts.map