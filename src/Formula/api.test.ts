import moonglow_data from "../Data/Weapons/Catalyst/EverlastingMoonglow/data_gen.json";
import { dataObjForArtifactSheets, dataObjForWeaponSheet } from "./api";
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
    premod: {
      normal: constant(NaN) // TODO: Formula for normal atk bonus
    }
  }
)

/*
const artData = dataObjForArtifact({} as any)
const charData = dataObjForCharacter({} as any)
const weaponData = dataObjForWeapon({} as any)

const merged1 = mergeData({ number: common, string: {} }, artSheetData, charSheetData, charData, weaponSheetData)
const merged2 = mergeData(merged1, artData, weaponData)
*/
describe("API", () => {
  test("Sucrose", () => {
    console.log(artSheetData)
  })
})
