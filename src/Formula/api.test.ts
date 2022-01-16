import { computeUIData, dataObjForCharacter, dataObjForWeapon } from "./api";
import { data as sucroseData } from "../Data/Characters/Sucrose/index_WR"
import { data as moonglowData } from "../Data/Weapons/Catalyst/EverlastingMoonglow/index_WR"
import artifact from "../Data/Artifacts/index_WR"
import { common } from "./index";
import { constant } from "./internal";

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
  test("none", () => {
    console.log(computeUIData([charData, sucroseData, weaponData, moonglowData, common, artifact.EmblemOfSeveredFate.data, { art: { EmblemOfSeveredFate: constant(4) } }]))
  })
})
