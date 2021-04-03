import { applyArtifacts, computeAllStats, createProxiedStats } from "../TestUtils"
import formula, { data } from "./data"
import urlon from 'urlon'

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?$dbv:2&characterKey=diona&levelKey=L70A&hitMode=hit&reactionMode:null&artifactConditionals@;&baseStatOverrides$;&weapon$key=SacrificialBow&levelKey=L80&refineIndex:0&overrideMainVal:0&overrideSubVal:0&conditionalNum:1;&autoInfused:false&talentConditionals@;&constellation:0&artifacts@$level:0&numStars:4&mainStatKey=cryo_dmg_&setKey=NoblesseOblige&slotKey=goblet&substats$atk_:3.3&critDMG_:6.2&enerRech_:4.1&:0;;&$level:0&numStars:5&mainStatKey=hp&setKey=NoblesseOblige&slotKey=flower&substats$atk_:4.1&hp_:5.8&atk:16&enerRech_:5.2;;&$level:0&numStars:4&mainStatKey=atk&setKey=NoblesseOblige&slotKey=plume&substats$hp_:4.7&critRate_:2.8&:0;;&$level:8&numStars:5&mainStatKey=enerRech_&setKey=GladiatorsFinale&slotKey=sands&substats$def:21&atk:14&hp_:8.2&critDMG_:6.2;;&$level:16&numStars:5&mainStatKey=hp_&setKey=NoblesseOblige&slotKey=circlet&substats$hp:717&critRate_:7&critDMG_:6.2&def_:12.4;;;&tlvl@:0&:0&:0"
const charObj = urlon.parse(url.split("flex?")[1])
charObj.artifacts.map(art => delete art.substats[""])//delete empty substats
let setupStats
describe("Testing Diona's Formulas (VoidAssassin#9930)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 7818, characterATK: 671 - 497, characterDEF: 491,
      characterEle: "cryo", characterLevel: 70,
      weaponType: "bow", weaponATK: 497, enerRech_: 27.9,//Sacrificial Bow Lvl. 80 (Refinement 1)
      cryo_dmg_: 18,//specialized
      skill_dmg_: 15,//C2

      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard 
      tlvl: Object.freeze({ auto: 5 - 1, skill: 9 - 1, burst: 9 - 1 }),
      constellation: 1,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 717, ...(charObj.artifacts.find(art => art.slotKey === "flower")?.substats ?? {}) }, // Flower of Life
      { atk: 42, ...(charObj.artifacts.find(art => art.slotKey === "plume")?.substats ?? {}) }, // Plume of Death
      { enerRech_: 25.4, ...(charObj.artifacts.find(art => art.slotKey === "sands")?.substats ?? {}) }, // Sands of Eon
      { cryo_dmg_: 6.3, ...(charObj.artifacts.find(art => art.slotKey === "goblet")?.substats ?? {}) }, // Goblet of Eonothem
      { hp_: 38.7, ...(charObj.artifacts.find(art => art.slotKey === "circlet")?.substats ?? {}) }, // Circlet of Logos
      { burst_dmg_: 20 }, // 4 piece noblesse
    ]))

    describe('no crit', () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(55)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(51)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(70)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(66)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(83)

        expect(formula.charged.aimShot(stats)[0](stats)).toApproximate(67)
        expect(formula.charged.fullAimedShot(stats)[0](stats)).toApproximate(695)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.high(stats)[0](stats)).toApproximate()

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(338)

        expect(formula.burst.regen(stats)[0](stats)).toApproximate(2289)
      })
      test("burst + noblesse", () => {
        setupStats.atk_ += 20
        const stats = computeAllStats(setupStats)

        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(782)
        expect(formula.burst.continuousDmg(stats)[0](stats)).toApproximate(514)
      })
      test('regen <50% HP', () => {
        setupStats.incHeal_ += 30
        const stats = computeAllStats(setupStats)
        expect(formula.burst.regen(stats)[0](stats)).toApproximate(2976)
      })

    })
    describe('crit', () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(94)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(87)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(118)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(112)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(140)

        expect(formula.charged.aimShot(stats)[0](stats)).toApproximate(114)
        expect(formula.charged.fullAimedShot(stats)[0](stats)).toApproximate(1173)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.high(stats)[0](stats)).toApproximate()

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(570)
      })
      test("burst + noblesse", () => {
        setupStats.atk_ += 20
        const stats = computeAllStats(setupStats)

        // expect(formula.burst.dmg(stats)[0](stats)).toApproximate()
        expect(formula.burst.continuousDmg(stats)[0](stats)).toApproximate(867)
      })
    })
  })
})
