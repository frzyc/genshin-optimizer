import { dataObjForArtifactSheets, dataObjForCharacter, dataObjForWeapon } from "./api";

const artSheetData = dataObjForArtifactSheets()

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
