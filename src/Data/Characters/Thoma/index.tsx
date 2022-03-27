import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, lookup, naught, prod } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, sectionTemplate, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode, shieldElement, shieldNodeTalent } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData
const auto = normalSrc(data_gen.weaponTypeKey)

const key: CharacterKey = "Thoma"
const elementKey: ElementKey = "pyro"
const [tr, trm] = trans("char", key)

let a = 0, s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4
    ]
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    hpShield_: skillParam_gen.skill[s++],
    baseShield: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    maxHpShield_: skillParam_gen.skill[s++],
    maxBaseShield: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0]
  },
  burst: {
    pressDmg: skillParam_gen.burst[b++],
    collapseDmg: skillParam_gen.burst[b++],
    hpShield_: skillParam_gen.burst[b++],
    baseShield: skillParam_gen.burst[b++],
    shieldDuration: skillParam_gen.burst[b++][0],
    unknown: skillParam_gen.burst[b++][0],
    scorchingDuration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0]
  },
  passive1: {
    shield_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
    maxStacks: skillParam_gen.passive1[2][0],
    cd: skillParam_gen.passive1[3][0]
  },
  passive2: {
    collapse_dmgInc: skillParam_gen.passive2[0][0],
  },
  c2: {
    burstDuration: skillParam_gen.constellation2[0],
  },
  c4: {
    energyRestore: skillParam_gen.constellation4[0],
  },
  c6: {
    auto_dmg: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
  }
} as const

const [condP1BarrierStacksPath, condP1BarrierStacks] = cond(key, "p1BarrierStacks")
// This should technically only apply to the active character, but I am trying
// to minimize the amount of jank active character fixes.
const p1_shield_ = greaterEq(input.asc, 1,
  lookup(condP1BarrierStacks, Object.fromEntries(range(1, datamine.passive1.maxStacks).map(stacks => [
    stacks,
    constant(stacks * datamine.passive1.shield_)
  ])), naught)
)

const p2Collapse_dmgInc = greaterEq(input.asc, 4, prod(input.total.hp, datamine.passive2.collapse_dmgInc))

const [condC4AfterBurstPath, condC4AfterBurst] = cond(key, "c4AfterBurst")

const [condC6AfterBarrierPath, condC6AfterBarrier] = cond(key, "c6AfterBarrier")
const c6_normal_dmg_ = greaterEq(input.constellation, 6,
  equal(condC6AfterBarrier, "on", datamine.c6.auto_dmg)
)
const c6_charged_dmg_ = { ...c6_normal_dmg_ }
const c6_plunging_dmg_ = { ...c6_normal_dmg_ }

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
    minShield: shieldNodeTalent("hp", datamine.skill.hpShield_, datamine.skill.baseShield, "skill"),
    minPyroShield: shieldElement("pyro", shieldNodeTalent("hp", datamine.skill.hpShield_, datamine.skill.baseShield, "skill")),
    maxShield: shieldNodeTalent("hp", datamine.skill.maxHpShield_, datamine.skill.maxBaseShield, "skill"),
    maxPyroShield: shieldElement("pyro", shieldNodeTalent("hp", datamine.skill.maxHpShield_, datamine.skill.maxBaseShield, "skill")),
  },
  burst: {
    pressDmg: dmgNode("atk", datamine.burst.pressDmg, "burst"),
    collapseDmg: dmgNode("atk", datamine.burst.collapseDmg, "burst",
      { premod: { burst_dmgInc: p2Collapse_dmgInc } }
    ),
    shield: shieldNodeTalent("hp", datamine.burst.hpShield_, datamine.burst.baseShield, "burst"),
    pyroShield: shieldElement("pyro", shieldNodeTalent("hp", datamine.burst.hpShield_, datamine.burst.baseShield, "burst")),
  }
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, "inazuma", data_gen, dmgFormulas, {
  bonus: {
    skill: skillC3,
    burst: burstC5,
  },
  teamBuff: {
    premod: {
      shield_: p1_shield_,
      normal_dmg_: c6_normal_dmg_,
      charged_dmg_: c6_charged_dmg_,
      plunging_dmg_: c6_plunging_dmg_,
    }
  },
})

const sheet: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: talentTemplate("auto", tr, auto, undefined, undefined, [{
        ...sectionTemplate("auto", tr, auto,
          datamine.normal.hitArr.map((_, i) => ({
            node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
            textSuffix: i === 2 ? st("brHits", { count: 2 }) : ""
          }))
        ),
        text: tr("auto.fields.normal"),
      }, {
        ...sectionTemplate("auto", tr, auto, [{
          node: infoMut(dmgFormulas.charged.dmg1, { key: `char_${key}_gen:auto.skillParams.4` }),
        }, {
          text: tr("auto.skillParams.5"),
          value: datamine.charged.stamina,
        }]),
        text: tr("auto.fields.charged"),
      }, {
        ...sectionTemplate("auto", tr, auto, [{
          node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
        }, {
          node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
        }, {
          node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
        }]),
        text: tr("auto.fields.plunging"),
      }]),
      skill: talentTemplate("skill", tr, skill, [{
        node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` })
      }, {
        node: infoMut(dmgFormulas.skill.minShield, { key: "sheet_gen:dmgAbsorption" })
      }, {
        node: infoMut(dmgFormulas.skill.minPyroShield,
          { key: `sheet:dmgAbsorption.${elementKey}`, variant: elementKey }
        ),
      }, {
        node: infoMut(dmgFormulas.skill.maxShield, { key: `char_${key}:maxShield` })
      }, {
        node: infoMut(dmgFormulas.skill.maxPyroShield,
          { key: `char_${key}:maxPyroShield`, variant: elementKey }
        ),
      }, {
        text: sgt("duration"),
        value: datamine.skill.shieldDuration,
        unit: "s"
      }, {
        text: sgt("cd"),
        value: datamine.skill.cd,
        unit: "s"
      }]),
      burst: talentTemplate("burst", tr, burst, [{
        node: infoMut(dmgFormulas.burst.pressDmg, { key: `char_${key}_gen:burst.skillParams.0` })
      }, {
        node: infoMut(dmgFormulas.burst.shield, { key: "sheet_gen:dmgAbsorption" })
      }, {
        node: infoMut(dmgFormulas.burst.pyroShield,
          { key: `sheet:dmgAbsorption.${elementKey}`, variant: elementKey }
        ),
      }, {
        text: tr("burst.skillParams.3"),
        value: datamine.burst.shieldDuration,
        unit: "s",
      }, {
        node: infoMut(dmgFormulas.burst.collapseDmg, { key: `char_${key}_gen:burst.skillParams.1` })
      }, {
        text: tr("burst.skillParams.4"),
        value: data => data.get(input.constellation).value >= 2
          ? `${datamine.burst.scorchingDuration}s + ${datamine.c2.burstDuration}s = ${datamine.burst.scorchingDuration + datamine.c2.burstDuration}`
          : datamine.burst.scorchingDuration,
        unit: "s",
      }, {
        text: sgt("cd"),
        value: datamine.burst.cd,
        unit: "s",
      }, {
        text: sgt("energyCost"),
        value: datamine.burst.enerCost,
      }], undefined, [
        sectionTemplate("passive1", tr, passive1, undefined, {
          value: condP1BarrierStacks,
          path: condP1BarrierStacksPath,
          name: trm("a1"),
          teamBuff: true,
          canShow: greaterEq(input.asc, 1, 1),
          states: Object.fromEntries(range(1, datamine.passive1.maxStacks).map(stacks => [
            stacks,
            {
              name: st("stack", { count: stacks }),
              fields: [{
                node: p1_shield_
              }, {
                text: sgt("duration"),
                value: datamine.passive1.duration,
                unit: "s"
              }, {
                text: st("triggerCD"),
                value: datamine.passive1.cd,
                unit: "s",
                fixed: 1
              }]
            }
          ]))
        }),
        sectionTemplate("passive2", tr, passive2, [{
          node: infoMut(p2Collapse_dmgInc, { key: `char_${key}:a2`, variant: elementKey }),
        }], undefined, data => data.get(input.asc).value >= 4, false, true),
        sectionTemplate("constellation2", tr, c2, [{
          text: trm("c2"),
          value: datamine.c2.burstDuration,
          unit: "s"
        }], undefined, data => data.get(input.constellation).value >= 2, false, true),
        sectionTemplate("constellation4", tr, c4, undefined, {
          value: condC4AfterBurst,
          path: condC4AfterBurstPath,
          name: st("afterUse.burst"),
          canShow: greaterEq(input.constellation, 4, 1),
          states: {
            on: {
              fields: [{
                text: st("energyRegen"),
                value: datamine.c4.energyRestore,
              }]
            }
          }
        }),
        sectionTemplate("constellation6", tr, c6, undefined, {
          value: condC6AfterBarrier,
          path: condC6AfterBarrierPath,
          name: trm("c6"),
          teamBuff: true,
          canShow: greaterEq(input.constellation, 6, 1),
          states: {
            on: {
              fields: [{
                node: c6_normal_dmg_,
              }, {
                node: c6_charged_dmg_,
              }, {
                node: c6_plunging_dmg_,
              }]
            }
          }
        })
      ]),
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: skillC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: burstC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6),
    }
  }
}
export default new CharacterSheet(sheet, data)
