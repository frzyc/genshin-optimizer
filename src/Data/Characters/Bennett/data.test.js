import { applyArtifacts, computeAllStats, createProxiedStats } from "../TestUtils"
import formula, { data } from "./data"
import urlon from 'urlon'

const url1 = "https://frzyc.github.io/genshin-optimizer/#/flex?$dbv:2&characterKey=bennett&levelKey=L60&hitMode=hit&reactionMode:null&artifactConditionals@$srcKey=CrimsonWitchOfFlames&conditionalNum:3&srcKey2=4;;&baseStatOverrides$atk_:25&physical_enemyRes_:50&enemyLevel:75&anemo_enemyRes_:-10&geo_enemyRes_:-10&electro_enemyRes_:-10&hydro_enemyRes_:-10&pyro_enemyRes_:-10&cryo_enemyRes_:-10;&weapon$key=SkywardBlade&levelKey=L70&refineIndex:0&overrideMainVal:0&overrideSubVal:0&conditionalNum:0;&autoInfused:false&talentConditionals@;&constellation:1&artifacts@$level:20&numStars:5&mainStatKey=hp&setKey=CrimsonWitchOfFlames&slotKey=flower&substats$critRate_:12.4&critDMG_:12.4&enerRech_:5.8&def_:13.1;;&$level:20&numStars:5&mainStatKey=atk&setKey=CrimsonWitchOfFlames&slotKey=plume&substats$enerRech_:5.8&critDMG_:7.8&critRate_:3.9&eleMas:93;;&$level:20&numStars:5&mainStatKey=atk_&setKey=MaidenBeloved&slotKey=sands&substats$critRate_:3.9&def:79&enerRech_:5.8&critDMG_:13.2;;&$level:16&numStars:4&mainStatKey=pyro_dmg_&setKey=CrimsonWitchOfFlames&slotKey=goblet&substats$enerRech_:3.6&atk:16&def_:5.3&hp:598;;&$level:20&numStars:5&mainStatKey=atk_&setKey=CrimsonWitchOfFlames&slotKey=circlet&substats$critRate_:10.9&hp_:10.5&critDMG_:7.8&atk:33;;;&tlvl@:3&:3&:3"
const charObj1 = urlon.parse(url1.split("flex?")[1])

let setupStats
describe("Testing Bennett's Formulas (Mabmab#6492)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 8168, characterATK: 583 - 457, characterDEF: 508,
      characterEle: "pyro", characterLevel: 60,
      weaponType: "sword", weaponATK: 457,
      enerRech_: 45.4, critRate_: 4 + 5,//Skyward Blade
      enerRech_: 13.3,//specialized

      atk_: 25,//pyro reso
      enemyLevel: 75, physical_enemyRes_: 70 - 20, // Ruin Guard with zhongli shield
      pyro_enemyRes_: -10,
      tlvl: Object.freeze({ auto: 4 - 1, skill: 4 - 1, burst: 4 - 1 }),
      constellation: 1,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 4780, ...charObj1.artifacts[0].substats }, // Flower of Life
      { atk: 311, ...charObj1.artifacts[1].substats }, // Plume of Death
      { atk_: 46.6, ...charObj1.artifacts[2].substats }, // Sands of Eon
      { pyro_dmg_: 58.3, ...charObj1.artifacts[3].substats }, // Goblet of Eonothem
      { atk_: 46.6, ...charObj1.artifacts[4].substats }, // Circlet of Logos
      { pyro_dmg_: 15, vaporize_dmg_: 15, overloaded_dmg_: 40, }, // 4 piece crimson witch
    ]))

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(222)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(213)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(272)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(297)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(358)
        expect(formula.charged.atk1(stats)[0](stats)).toApproximate(278)
        expect(formula.charged.atk2(stats)[0](stats)).toApproximate(302)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(318)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(637)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(795)

        expect(formula.skill.press(stats)[0](stats)).toApproximate(2424)
        expect(formula.skill.lvl1hit1(stats)[0](stats)).toApproximate(1480)
        expect(formula.skill.lvl1hit2(stats)[0](stats)).toApproximate(1621)
        expect(formula.skill.lvl2hit1(stats)[0](stats)).toApproximate(1550)
        expect(formula.skill.lvl2hit2(stats)[0](stats)).toApproximate(1691)
        expect(formula.skill.explosion(stats)[0](stats)).toApproximate(2326)

        expect(stats.overloaded_hit).toApproximate(1870)
      })

    })
    describe("no crit burst hit", () => {
      beforeEach(() => {
        setupStats.hitMode = "hit"
        setupStats.modifiers = { finalATK: { baseATK: (data.burst.atkRatio[4 - 1] + 20) / 100, } }
      })
      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(5421)
      })
    })
    describe("no crit, vaporize", () => {
      beforeEach(() => {
        setupStats.hitMode = "hit"
        setupStats.reactionMode = "pyro_vaporize"
      })

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.skill.press(stats)[0](stats)).toApproximate(4814)
      })

    })

    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(424)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(407)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(520)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(568)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(685)
        expect(formula.charged.atk1(stats)[0](stats)).toApproximate(532)
        expect(formula.charged.atk2(stats)[0](stats)).toApproximate(578)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(609)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(1217)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(1521)

        expect(formula.skill.press(stats)[0](stats)).toApproximate(4635)
        expect(formula.skill.lvl1hit1(stats)[0](stats)).toApproximate(2830)
        expect(formula.skill.lvl1hit2(stats)[0](stats)).toApproximate(3099)
        expect(formula.skill.lvl2hit1(stats)[0](stats)).toApproximate(2964)
        expect(formula.skill.lvl2hit2(stats)[0](stats)).toApproximate(3234)
        expect(formula.skill.explosion(stats)[0](stats)).toApproximate(4447)
      })

    })
    describe("crit burst hit", () => {
      beforeEach(() => {
        setupStats.hitMode = "critHit"
        setupStats.modifiers = { finalATK: { baseATK: (data.burst.atkRatio[4 - 1] + 20) / 100, } }
      })
      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(10365)
      })
    })
    describe("no crit, vaporize", () => {
      beforeEach(() => {
        setupStats.hitMode = "critHit"
        setupStats.reactionMode = "pyro_vaporize"
      })

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.skill.press(stats)[0](stats)).toApproximate(9203)
      })
    })
  })
})
