import { applyArtifacts, computeAllStats, createProxiedStats } from "../TestUtils"
import formula, { data } from "./data"
import urlon from 'urlon'

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?$dbv:2&characterKey=lisa&levelKey=L60A&hitMode=hit&reactionMode:null&artifactConditionals@;&baseStatOverrides$;&weapon$key=TwinNephrite&levelKey=L40A&refineIndex:2&overrideMainVal:0&overrideSubVal:0&conditionalNum:0;&autoInfused:false&talentConditionals@;&constellation:0&artifacts@$level:16&numStars:4&mainStatKey=atk&setKey=ThunderingFury&slotKey=plume&substats$critRate_:5.3&critDMG_:11.2&atk_:7&enerRech_:3.6;;&$level:16&numStars:4&mainStatKey=hp&setKey=ThunderingFury&slotKey=flower&substats$eleMas:47&critDMG_:5.6&atk:16&def_:9.9;;&$level:16&numStars:5&mainStatKey=atk_&setKey=ThunderingFury&slotKey=circlet&substats$def_:7.3&atk:19&enerRech_:10.4&critDMG_:20.2;;&$level:16&numStars:4&mainStatKey=enerRech_&setKey=ThunderingFury&slotKey=sands&substats$hp_:7.9&def:15&atk_:3.7&hp:359;;&$level:16&numStars:5&mainStatKey=electro_dmg_&setKey=CrimsonWitchOfFlames&slotKey=goblet&substats$critDMG_:5.4&enerRech_:11&hp:508&atk_:10.5;;;&tlvl@:0&:0&:0"
const charObj = urlon.parse(url.split("flex?")[1])

let setupStats
describe("Testing Lisa's Formulas (Derpy#2132)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 6731, characterATK: 370 - 207, characterDEF: 403,
      characterEle: "electro", characterLevel: 60,
      weaponType: "catalyst", weaponATK: 207, critRate_: 5 + 8.8,//Twin Nephrite R3
      eleMas: 48,//specialized

      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard 
      tlvl: Object.freeze({ auto: 2 - 1, skill: 2 - 1, burst: 2 - 1 }),
      constellation: 1,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 3571, ...(charObj.artifacts.find(art => art.slotKey === "flower")?.substats ?? {}) }, // Flower of Life
      { atk: 232, ...(charObj.artifacts.find(art => art.slotKey === "plume")?.substats ?? {}) }, // Plume of Death
      { enerRech_: 38.7, ...(charObj.artifacts.find(art => art.slotKey === "sands")?.substats ?? {}) }, // Sands of Eon
      { electro_dmg_: 38.7, ...(charObj.artifacts.find(art => art.slotKey === "goblet")?.substats ?? {}) }, // Goblet of Eonothem
      { atk_: 38.7, ...(charObj.artifacts.find(art => art.slotKey === "circlet")?.substats ?? {}) }, // Circlet of Logos
      { electro_dmg_: 15, overloaded_dmg_: 40, electrocharged_dmg_: 40, superconduct_dmg_: 40 }, // 4 piece thundering -fury 
    ]))

    describe('no crit', () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(234)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(212)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(253)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(325)
        expect(formula.charged.hit(stats)[0](stats)).toApproximate(1047)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(338)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(676)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(844)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(473)
        expect(formula.skill.stack0(stats)[0](stats)).toApproximate(1893)
        expect(formula.skill.stack1(stats)[0](stats)).toApproximate(2176)
        expect(formula.skill.stack2(stats)[0](stats)).toApproximate(2508)
        expect(formula.skill.stack3(stats)[0](stats)).toApproximate(2882)

        expect(formula.burst.summon(stats)[0](stats)).toApproximate(55)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(216)

        expect(stats.overloaded_hit).toApproximate(1608)
        expect(stats.electrocharged_hit).toApproximate(964)
        expect(stats.superconduct_hit).toApproximate(402)
      })
      test("hit + Q", () => {
        setupStats.enemyDEFRed_ += 15
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(254)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(231)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(275)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(353)
        expect(formula.charged.hit(stats)[0](stats)).toApproximate(1139)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(367)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(735)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(918)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(514)
        expect(formula.skill.stack0(stats)[0](stats)).toApproximate(2058)
        expect(formula.skill.stack1(stats)[0](stats)).toApproximate(2367)
        expect(formula.skill.stack2(stats)[0](stats)).toApproximate(2727)
        expect(formula.skill.stack3(stats)[0](stats)).toApproximate(3134)

        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(235)
      })
    })
    describe('crit', () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(450)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(408)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(487)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(625)
        expect(formula.charged.hit(stats)[0](stats)).toApproximate(2016)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(650)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(1301)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(1625)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(910)
        expect(formula.skill.stack0(stats)[0](stats)).toApproximate(3642)
        expect(formula.skill.stack1(stats)[0](stats)).toApproximate(4189)
        expect(formula.skill.stack2(stats)[0](stats)).toApproximate(4826)
        expect(formula.skill.stack3(stats)[0](stats)).toApproximate(5546)

        expect(formula.burst.summon(stats)[0](stats)).toApproximate(105)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(416)
      })
      test("hit + Q", () => {
        setupStats.enemyDEFRed_ += 15
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(490)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(444)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(529)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(680)
        expect(formula.charged.hit(stats)[0](stats)).toApproximate(2192)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(707)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(1415)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(1767)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(990)
        expect(formula.skill.stack0(stats)[0](stats)).toApproximate(3961)
        expect(formula.skill.stack1(stats)[0](stats)).toApproximate(4555)
        expect(formula.skill.stack2(stats)[0](stats)).toApproximate(5248)
        expect(formula.skill.stack3(stats)[0](stats)).toApproximate(6031)

        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(452)
      })
    })

  })
})
