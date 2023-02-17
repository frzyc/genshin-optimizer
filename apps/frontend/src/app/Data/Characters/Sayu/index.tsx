import { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { CharacterData } from '@genshin-optimizer/pipeline'
import ColorText from '../../../Components/ColoredText'
import { input } from '../../../Formula'
import { constant, greaterEq, infoMut, lookup, min, naught, percent, prod, subscript, sum } from '../../../Formula/utils'
import { absorbableEle } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import { customHealNode, dataObjForCharacterSheet, dmgNode, healNodeTalent } from '../dataUtil'
import { ICharacterSheet } from '../ICharacterSheet.d'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Sayu"
const elementKey: ElementKey = "anemo"
const ct = charTemplates(key, data_gen.weaponTypeKey)

let s = 0, b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], // 1
      skillParam_gen.auto[1], // 2
      skillParam_gen.auto[2], // 3x2
      skillParam_gen.auto[4], // 4
    ]
  },
  charged: {
    spin: skillParam_gen.auto[5],
    final: skillParam_gen.auto[6],
    stamina: skillParam_gen.auto[7][0],
    duration: skillParam_gen.auto[8][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[9],
    low: skillParam_gen.auto[10],
    high: skillParam_gen.auto[11],
  },
  skill: {
    wheelDmg: skillParam_gen.skill[s++],
    eleWheelDmg: skillParam_gen.skill[s++],
    kickPressDmg: skillParam_gen.skill[s++],
    kickHoldDmg: skillParam_gen.skill[s++],
    eleKickDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cdMin: skillParam_gen.skill[s++][0],
    cdMax: skillParam_gen.skill[s++][0],
  },
  burst: {
    pressDmg: skillParam_gen.burst[b++],
    pressBaseHeal: skillParam_gen.burst[b++],
    pressAtkHeal: skillParam_gen.burst[b++],
    darumaDmg: skillParam_gen.burst[b++],
    darumaBaseHeal: skillParam_gen.burst[b++],
    darumaAtkHeal: skillParam_gen.burst[b++],
    darumaHits: 7,
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0]
  },
  passive1: {
    baseHeal: skillParam_gen.passive1[0][0],
    emHeal: skillParam_gen.passive1[1][0],
    cd: skillParam_gen.passive1[2][0]
  },
  passive2: {
    nearHeal: skillParam_gen.passive2[0][0]
  },
  constellation2: {
    dmgInc: skillParam_gen.constellation2[0],
    maxStacks: skillParam_gen.constellation2[1],
  },
  constellation4: {
    ener: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    darumaDmgInc: skillParam_gen.constellation6[0],
    maxStacks: skillParam_gen.constellation6[1] / skillParam_gen.constellation6[0],
    darumaHealInc: skillParam_gen.constellation6[2]
  }
} as const

const [condSkillAbsorptionPath, condSkillAbsorption] = cond(key, "skillAbsorption")

const [condC2SkillStackPath, condC2SkillStack] = cond(key, "c2SkillStack")
const c2_kickPressDmg_ = greaterEq(input.constellation, 2, percent(dm.constellation2.dmgInc))
const c2_kickDmg_ = greaterEq(input.constellation, 2,
  lookup(condC2SkillStack,
    Object.fromEntries(range(1, dm.constellation2.maxStacks).map(stack => [
      stack,
      prod(stack, percent(dm.constellation2.dmgInc))
    ])),
    naught
  )
)

const c6_daruma_dmg_inc = greaterEq(input.constellation, 6,
  prod(
    min(input.total.eleMas, dm.constellation6.maxStacks),
    dm.constellation6.darumaDmgInc,
    input.total.atk
  )
)
const c6_daruma_heal_inc = greaterEq(input.constellation, 6,
  prod(min(input.total.eleMas, dm.constellation6.maxStacks), dm.constellation6.darumaHealInc)
)
// Using customHealNode so I can have healInc
const darumaHeal = customHealNode(sum(
  prod(
    subscript(input.total.burstIndex, dm.burst.darumaAtkHeal, { unit: "%" }),
    input.total.atk,
  ),
  subscript(input.total.burstIndex, dm.burst.darumaBaseHeal),
  c6_daruma_heal_inc,
))

const dmgFormulas = {
  normal: Object.fromEntries(dm.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    spin: dmgNode("atk", dm.charged.spin, "charged"),
    final: dmgNode("atk", dm.charged.final, "charged")
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    wheelDmg: dmgNode("atk", dm.skill.wheelDmg, "skill"),
    kickPressDmg: dmgNode("atk", dm.skill.kickPressDmg, "skill",
      { premod: { skill_dmg_: sum(c2_kickDmg_, c2_kickPressDmg_) } }),
    kickHoldDmg: dmgNode("atk", dm.skill.kickHoldDmg, "skill",
      { premod: { skill_dmg_: c2_kickDmg_ } }),
    eleWheelDmg: lookup(condSkillAbsorption, Object.fromEntries(absorbableEle.map(eleKey => [
      eleKey,
      dmgNode("atk", dm.skill.eleWheelDmg, "skill", { hit: { ele: constant(eleKey) } })
    ])), naught),
    eleKickDmg: lookup(condSkillAbsorption, Object.fromEntries(absorbableEle.map(eleKey => [
      eleKey,
      dmgNode("atk", dm.skill.eleKickDmg, "skill",
        { hit: { ele: constant(eleKey) }, premod: { skill_dmg_: c2_kickDmg_ } })
    ])), naught)
  },
  burst: {
    pressDmg: dmgNode("atk", dm.burst.pressDmg, "burst"),
    pressHeal: healNodeTalent("atk", dm.burst.pressAtkHeal, dm.burst.pressBaseHeal, "burst"),
    darumaDmg: dmgNode("atk", dm.burst.darumaDmg, "burst",
      { premod: { burst_dmgInc: c6_daruma_dmg_inc } }),
    darumaHeal
  },
  passive1: {
    heal: greaterEq(input.asc, 1,
      customHealNode(
        sum(dm.passive1.baseHeal, prod(dm.passive1.emHeal, input.total.eleMas))
      )
    )
  },
  passive2: {
    extraHeal: greaterEq(input.asc, 4, prod(darumaHeal, percent(dm.passive2.nearHeal)))
  }
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, "anemo", "inazuma", data_gen, dmgFormulas, {
  premod: {
    skillBoost: skillC5,
    burstBoost: burstC3
  }
})

const sheet: ICharacterSheet = {
  key,
  name: ct.chg("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: ct.chg("constellationName"),
  title: ct.chg("title"),
  talent: {
    auto: ct.talentTem("auto", [{
      text: ct.chg("auto.fields.normal")
    }, {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i}`), multi: i === 2 ? 2 : undefined }),
      }))
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.spin, { name: ct.chg(`auto.skillParams.4`) }),
      }, {
        node: infoMut(dmgFormulas.charged.final, { name: ct.chg(`auto.skillParams.5`) }),
      }, {
        text: ct.chg("auto.skillParams.6"),
        value: `${dm.charged.stamina}/s`,
      }]
    }, {
      text: ct.chg("auto.fields.plunging"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.plunging.dmg, { name: stg("plunging.dmg") }),
      }, {
        node: infoMut(dmgFormulas.plunging.low, { name: stg("plunging.low") }),
      }, {
        node: infoMut(dmgFormulas.plunging.high, { name: stg("plunging.high") }),
      }]
    }]),

    skill: ct.talentTem("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.wheelDmg, { name: ct.chg(`skill.skillParams.0`) })
      }, {
        node: infoMut(dmgFormulas.skill.kickPressDmg, { name: ct.chg(`skill.skillParams.1`) })
      }, {
        node: infoMut(dmgFormulas.skill.kickHoldDmg, { name: ct.chg(`skill.skillParams.2`) })
      }, {
        text: ct.chg("skill.skillParams.5"),
        value: dm.skill.duration,
        unit: "s",
      }, {
        text: stg("cd"),
        value: `${dm.skill.cdMin}s ~ ${dm.skill.cdMax}`,
        unit: "s",
      }]
    }, ct.condTem("skill", {
      value: condSkillAbsorption,
      path: condSkillAbsorptionPath,
      name: st("eleAbsor"),
      states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
        name: <ColorText color={eleKey}>{stg(`element.${eleKey}`)}</ColorText>,
        fields: [{
          node: infoMut(dmgFormulas.skill.eleWheelDmg, { name: ct.chg(`skill.skillParams.3`) })
        }, {
          node: infoMut(dmgFormulas.skill.eleKickDmg, { name: ct.chg(`skill.skillParams.4`) })
        }]
      }]))
    }), ct.headerTem("constellation2", {
      fields: [{
        node: infoMut(c2_kickPressDmg_, { name: ct.ch("c2KickPressDmg_"), unit: "%" })
      }]
    }), ct.condTem("constellation2", {
      value: condC2SkillStack,
      path: condC2SkillStackPath,
      name: ct.ch("c2Cond"),
      states: Object.fromEntries(range(1, dm.constellation2.maxStacks).map(stack => [stack, {
        name: st("seconds", { count: stack * 0.5 }),
        fields: [{
          node: infoMut(c2_kickDmg_, { name: ct.ch("c2KickDmg_"), unit: "%" })
        }]
      }]))
    })]),

    burst: ct.talentTem("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.pressDmg, { name: ct.chg(`burst.skillParams.0`) })
      }, {
        node: infoMut(dmgFormulas.burst.pressHeal, { name: ct.chg(`burst.skillParams.1`) })
      }, {
        node: infoMut(dmgFormulas.burst.darumaDmg, { name: ct.chg(`burst.skillParams.2`) })
      }, {
        node: infoMut(dmgFormulas.burst.darumaHeal, { name: ct.chg(`burst.skillParams.3`) })
      }, {
        text: ct.ch("burstHits"),
        value: dm.burst.darumaHits,
      }]
    }, ct.headerTem("passive2", {
      fields: [{
        node: infoMut(dmgFormulas.passive2.extraHeal, { name: ct.ch("p2Heal"), variant: "heal" })
      }, {
        text: ct.ch("p2Aoe")
      }]
    }), ct.headerTem("constellation1", {
      fields: [{
        text: ct.ch("c1Text")
      }]
    }), ct.headerTem("constellation6", {
      fields: [{
        node: infoMut(c6_daruma_dmg_inc, { name: ct.ch("c6DarumaDmgInc"), variant: "anemo" })
      }, {
        node: infoMut(c6_daruma_heal_inc, { name: ct.ch("c6DarumaHealInc"), variant: "heal" })
      }]
    })]),

    passive1: ct.talentTem("passive1", [ct.fieldsTem("passive1", {
      fields: [{
        node: infoMut(dmgFormulas.passive1.heal, { name: stg(`healing`) })
      }, {
        text: stg("cd"),
        value: dm.passive1.cd,
        unit: "s"
      }]
    })]),
    passive2: ct.talentTem("passive2"),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2"),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: burstC3 }] }]),
    constellation4: ct.talentTem("constellation4", [ct.fieldsTem("constellation4", {
      fields: [{
        text: st("energyRegen"),
        value: dm.constellation4.ener,
        fixed: 1
      }, {
        text: stg("cd"),
        value: dm.constellation4.cd,
        unit: "s"
      }]
    })]),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: skillC5 }] }]),
    constellation6: ct.talentTem("constellation6")
  }
}

export default new CharacterSheet(sheet, data)
