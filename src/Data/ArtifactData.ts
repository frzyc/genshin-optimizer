import { MainStatKey } from '../Types/artifact';
import { Rarity, SlotKey } from '../Types/consts'

const ArtifactSubstatRollData: StrictDict<Rarity, { low: number, high: number, numUpgrades: number }> = {
  1: { low: 0, high: 0, numUpgrades: 1 },
  2: { low: 0, high: 1, numUpgrades: 2 },
  3: { low: 1, high: 2, numUpgrades: 3 },
  4: { low: 2, high: 3, numUpgrades: 4 },
  5: { low: 3, high: 4, numUpgrades: 5 }
};

const ArtifactSlotsData: StrictDict<SlotKey, { name: string, stats: readonly MainStatKey[] }> = {
  flower: { name: "Flower of Life", stats: ["hp"] },
  plume: { name: "Plume of Death", stats: ["atk"] },
  sands: { name: "Sands of Eon", stats: ["hp_", "def_", "atk_", "eleMas", "enerRech_"] },
  goblet: { name: "Goblet of Eonothem", stats: ["hp_", "def_", "atk_", "eleMas", "physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_",] },
  circlet: { name: "Circlet of Logos", stats: ["hp_", "def_", "atk_", "eleMas", "critRate_", "critDMG_", "heal_"] },
};

export {
  ArtifactSlotsData,
  ArtifactSubstatRollData as ArtifactStarsData,
};
