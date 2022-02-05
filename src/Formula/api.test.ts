import { computeUIData, dataObjForArtifact, dataObjForCharacter, uiDataForTeam, dataObjForWeapon } from "./api";
import { data as sucroseData, dmgFormulas } from "../Data/Characters/Sucrose"
import { data as moonglowData } from "../Data/Weapons/Catalyst/EverlastingMoonglow"
import artifact from "../Data/Artifacts"
import { common, input } from "./index";
import { constant, customRead } from "./utils";

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
  conditional: {},
  bonusStats: {},
  infusionAura: "",
  compareData: false,
  enemyOverride: {}
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

describe("API", () => {
  test("none", async () => {
    const char1Data = [
      // ...(dmgFormulas.normal[0] as DataNode).data,
      common, charData, sucroseData, weaponData, moonglowData,
      artifact.EmblemOfSeveredFate.data,
      { artSet: { EmblemOfSeveredFate: constant(4) } }
    ]
    const teamData = uiDataForTeam({ Sucrose: char1Data })
    const computed = teamData["Sucrose"]!.target
    console.log(computed.getTeamBuff())
  })
})
