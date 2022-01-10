import moonglow_data from "../Data/Weapons/Catalyst/EverlastingMoonglow/data_gen.json";
import { dataObjForArtifactSheets, dataObjForCharacter, dataObjForWeapon, dataObjForWeaponSheet } from "./api";
import { constant } from "./internal";

const artSheetData = dataObjForArtifactSheets()
const weaponSheetData = dataObjForWeaponSheet("EverlastingMoonglow", "catalyst",
  [
    { stat: moonglow_data.mainStat.type as any, offset: moonglow_data.mainStat.base, lvlCurve: moonglow_data.mainStat.curve },
    { stat: moonglow_data.subStat.type as any, offset: moonglow_data.subStat.base, lvlCurve: moonglow_data.subStat.curve, },
    { stat: "heal_", refinement: moonglow_data.addProps.map(x => x.heal_) },
    { stat: "atk", asc: moonglow_data.ascension.map(x => x.addStats.atk ?? 0) },
  ],
  {
    dmgBonus: {
      normal: constant(NaN) // TODO: Formula for normal atk bonus
    }
  }
)

const charData = dataObjForCharacter({
  equippedArtifacts: { "circlet": "", "flower": "", "goblet": "", "plume": "", "sands": "" },
  equippedWeapon: "",
  key: "Sucrose",
  level: 90,
  constellation: 6,
  ascension: 6,
  talent: {
    auto: 10,
    skill: 10,
    burst: 10,
  },
  team: ["", "", ""],
  hitMode: "hit",
  reactionMode: "",
  conditionalValues: {},
  bonusStats: {},
  infusionAura: "",
})
const weaponData = dataObjForWeapon({
  id: "",
  key: "EverlastingMoonglow",
  level: 90,
  ascension: 6,
  refinement: 5,
  location: "",
  lock: false,
})

/*
const merged1 = mergeData({ number: common, string: {} }, artSheetData, charSheetData, charData, weaponSheetData)
const merged2 = mergeData(merged1, artData, weaponData)
*/
describe("API", () => {
  test("Sucrose", () => {
    console.log(artSheetData)
  })
})
