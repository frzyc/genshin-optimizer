import { applyArtifacts, computeAllStats, createProxiedStats } from "../TestUtils"
import formula, { data } from "./data"
import urlon from 'urlon'

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?$dbv:2&characterKey=diona&levelKey=L80A&hitMode=hit&reactionMode:null&artifactConditionals@;&baseStatOverrides$;&weapon$key=FavoniusWarbow&levelKey=L85&refineIndex:0&overrideMainVal:0&overrideSubVal:0&conditionalNum:0;&autoInfused:false&talentConditionals@;&constellation:0&artifacts@$level:12&numStars:5&mainStatKey=hp&setKey=MaidenBeloved&slotKey=flower&substats$atk:19&enerRech_:11&hp_:4.1&critDMG_:14;;&$level:9&numStars:5&mainStatKey=atk&setKey=MaidenBeloved&slotKey=plume&substats$hp_:11.7&hp:269&def:19&def_:12.4;;&$level:10&numStars:5&mainStatKey=enerRech_&setKey=MaidenBeloved&slotKey=sands&substats$def:23&eleMas:21&critDMG_:5.4&atk:37;;&$level:12&numStars:4&mainStatKey=hp_&setKey=MaidenBeloved&slotKey=goblet&substats$atk:16&eleMas:30&def:19&hp:167;;&$level:12&numStars:4&mainStatKey=atk_&setKey=MaidenBeloved&slotKey=circlet&substats$hp_:4.7&hp:406&enerRech_:5.2&atk:16;;;&tlvl@:0&:0&:0"
const charObj = urlon.parse(url.split("flex?")[1])
charObj.artifacts.map(art => delete art.substats[""])//delete empty substats
let setupStats
describe("Testing Diona's Formulas (⛧ Sin ⛧#0663)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 8907, characterATK: 638 - 440, characterDEF: 559,
      characterEle: "cryo", characterLevel: 80,
      weaponType: "bow", weaponATK: 440, enerRech_: 58.6,//Favonius Warbow Lvl. 85 (Refinement 1)
      cryo_dmg_: 24,//specialized
      skill_dmg_: 15,//C2

      enemyLevel: 82, physical_enemyRes_: 70, // Ruin Guard 
      tlvl: Object.freeze({ auto: 6 - 1, skill: 10 - 1, burst: 11 - 1 }),
      constellation: 6,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 3155, ...(charObj.artifacts.find(art => art.slotKey === "flower")?.substats ?? {}) }, // Flower of Life
      { atk: 166, ...(charObj.artifacts.find(art => art.slotKey === "plume")?.substats ?? {}) }, // Plume of Death
      { enerRech_: 29.8, ...(charObj.artifacts.find(art => art.slotKey === "sands")?.substats ?? {}) }, // Sands of Eon
      { hp_: 27.7, ...(charObj.artifacts.find(art => art.slotKey === "goblet")?.substats ?? {}) }, // Goblet of Eonothem
      { atk_: 27.7, ...(charObj.artifacts.find(art => art.slotKey === "circlet")?.substats ?? {}) }, // Circlet of Logos
      { heal_: 15 }, // 4 piece maiden
    ]))

    describe('no crit', () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(83)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(77)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(105)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(99)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(124)

        expect(formula.charged.aimShot(stats)[0](stats)).toApproximate(101)
        expect(formula.charged.fullAimedShot(stats)[0](stats)).toApproximate(1029)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate()
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(328)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(501)

        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(901)
        expect(formula.burst.continuousDmg(stats)[0](stats)).toApproximate(593)

        expect(stats.superconduct_hit).toApproximate(525)
      })
      test('4p Maiden', () => {
        setupStats.incHeal_ += 20
        const stats = computeAllStats(setupStats)
        expect(formula.burst.regen(stats)[0](stats)).toApproximate(3998)//3407.2124601399996
      })
      test('4p Maiden + C6', () => {
        setupStats.incHeal_ += 50
        const stats = computeAllStats(setupStats)
        expect(formula.burst.regen(stats)[0](stats)).toApproximate(4886)
      })
      test('melt', () => {
        setupStats.reactionMode = "cryo_melt"
        const stats = computeAllStats(setupStats)
        expect(formula.charged.fullAimedShot(stats)[0](stats)).toApproximate(1694)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(825)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(1483)
        expect(formula.burst.continuousDmg(stats)[0](stats)).toApproximate(976)
      })
    })
    describe('crit', () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(141)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(131)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(178)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(168)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(210)

        expect(formula.charged.aimShot(stats)[0](stats)).toApproximate(172)
        expect(formula.charged.fullAimedShot(stats)[0](stats)).toApproximate(1743)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.high(stats)[0](stats)).toApproximate()

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(849)

        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(1526)
        expect(formula.burst.continuousDmg(stats)[0](stats)).toApproximate(1004)
      })
    })
  })
})
