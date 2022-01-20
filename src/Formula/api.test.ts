import { computeUIData, dataObjForArtifact, dataObjForCharacter, dataObjForWeapon } from "./api";
import { data as sucroseData, dmgFormulas } from "../Data/Characters/Sucrose/index_WR"
import { data as moonglowData } from "../Data/Weapons/Catalyst/EverlastingMoonglow/index_WR"
import artifact from "../Data/Artifacts/index_WR"
import { common, input } from "./index";
import { constant } from "./internal";
import { randomizeArtifact } from "../Util/ArtifactUtil";
import { validateArtifact } from "../Database/validation";

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

describe("API", () => {
  test("none", async () => {
    const art = validateArtifact(await randomizeArtifact(), "asdf").artifact
    const computed = computeUIData([
      // ...(dmgFormulas.normal[0] as DataNode).data,
      common, charData, sucroseData, weaponData, moonglowData,
      artifact.EmblemOfSeveredFate.data,
      { art: { EmblemOfSeveredFate: constant(4) } }, dataObjForArtifact(art, 0)
    ])
    console.log(computed.getDisplay().burst)
  })
})
