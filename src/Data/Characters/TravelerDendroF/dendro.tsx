import ColorText from '../../../Components/ColoredText'
import { input, target } from '../../../Formula'
import { DisplaySub } from '../../../Formula/type'
import { equal, greaterEq, infoMut, lookup, naught, percent, prod } from '../../../Formula/utils'
import { CharacterKey, CharacterSheetKey, ElementKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, sgt, st } from '../../SheetUtil'
import { charTemplates, TalentSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import Traveler from '../Traveler'
import assets from './assets'
import skillParam_gen from './skillParam_gen.json'

export default function dendro(key: CharacterSheetKey, charKey: CharacterKey, dmgForms: { [key: string]: DisplaySub }) {
  const elementKey: ElementKey = "dendro"
  const condCharKey = "TravelerDendro"
  const ct = charTemplates(key, Traveler.data_gen.weaponTypeKey, assets)

  let s = 0, b = 0
  const datamine = {
    skill: {
      dmg: skillParam_gen.skill[s++],
      cd: skillParam_gen.skill[s++][0],
    },
    burst: {
      lampDmg: skillParam_gen.burst[b++],
      explosionDmg: skillParam_gen.burst[b++],
      unknown1: skillParam_gen.burst[b++],
      unknown2: skillParam_gen.burst[b++],
      lampDuration: skillParam_gen.burst[b++][0],
      cd: skillParam_gen.burst[b++][0],
      enerCost: skillParam_gen.burst[b++][0]
    },
    passive1: {
      eleMas: skillParam_gen.passive1[0][0],
      maxStacks: 10,
    },
    passive2: {
      skill_dmgInc: skillParam_gen.passive2[0][0],
      burst_dmgInc: skillParam_gen.passive2[1][0],
    },
    constellation1: {
      energyRegen: 1
    },
    constellation2: {
      durationInc: skillParam_gen.constellation2[0],
    },
    constellation6: {
      ele_dmg_: skillParam_gen.constellation6[0],
    }
  } as const

  const [condA1StacksPath, condA1Stacks] = cond(condCharKey, "a1Stacks")
  const a1StacksArr = range(1, datamine.passive1.maxStacks)
  const a1_eleMas_disp = greaterEq(input.asc, 1,
    lookup(condA1Stacks, Object.fromEntries(a1StacksArr.map(stack => [
      stack,
      prod(datamine.passive1.eleMas, stack)
    ])), naught),
    { key: "eleMas" }
  )
  const a1_eleMas = equal(input.activeCharKey, target.charKey, a1_eleMas_disp)

  const a4_skill_dmg_ = greaterEq(input.asc, 4,
    prod(percent(datamine.passive2.skill_dmgInc, { fixed: 2 }), input.total.eleMas),
    { key: "_" }
  )
  const a4_burst_dmg_ = greaterEq(input.asc, 4,
    prod(percent(datamine.passive2.burst_dmgInc), input.total.eleMas),
    { key: "_" }
  )

  const [condC6BurstEffectPath, condC6BurstEffect] = cond(condCharKey, "c6BurstEffect")
  const [condC6BurstElePath, condC6BurstEle] = cond(condCharKey, "c6BurstEle")
  const c6_dendro_dmg_disp = greaterEq(input.constellation, 6,
    equal(condC6BurstEffect, "on", percent(datamine.constellation6.ele_dmg_))
  )
  const c6_dendro_dmg_ = equal(input.activeCharKey, target.charKey, c6_dendro_dmg_disp)
  const c6_ele_dmg_disp = Object.fromEntries(["hydro", "pyro", "electro"].map(ele => [
    ele,
    greaterEq(input.constellation, 6,
      equal(condC6BurstEffect, "on",
        equal(condC6BurstEle, ele, percent(datamine.constellation6.ele_dmg_))
      )
    )
  ]))
  const c6_ele_dmg_ = Object.fromEntries(Object.entries(c6_ele_dmg_disp).map(([ele, node]) => [
    `${ele}_dmg_`,
    equal(input.activeCharKey, target.charKey, node)
  ]))

  const dmgFormulas = {
    ...dmgForms,
    skill: {
      dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
    },
    burst: {
      lampDmg: dmgNode("atk", datamine.burst.lampDmg, "burst"),
      explosionDmg: dmgNode("atk", datamine.burst.explosionDmg, "burst")
    }
  } as const

  const skillC3 = greaterEq(input.constellation, 3, 3)
  const burstC5 = greaterEq(input.constellation, 5, 3)

  const data = dataObjForCharacterSheet(charKey, elementKey, undefined, Traveler.data_gen, dmgFormulas, {
    bonus: {
      burst: burstC5,
      skill: skillC3,
    },
    premod: {
      skill_dmg_: a4_skill_dmg_,
      burst_dmg_: a4_burst_dmg_,
    },
    teamBuff: {
      premod: {
        eleMas: a1_eleMas,
        dendro_dmg_: c6_dendro_dmg_,
        ...c6_ele_dmg_,
      },
    }
  })

  const talent: TalentSheet = {
    skill: ct.talentTemplate("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` })
      }, {
        text: sgt("cd"),
        value: datamine.skill.cd,
        unit: "s",
      }]
    }]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.lampDmg,
          { key: `char_${key}_gen:burst.skillParams.0` }
        )
      }, {
        node: infoMut(dmgFormulas.burst.explosionDmg,
          { key: `char_${key}_gen:burst.skillParams.1` }
        )
      }, {
        text: sgt("duration"),
        value: (data) => data.get(input.constellation).value >= 2
          ? `${datamine.burst.lampDuration}s + ${datamine.constellation2.durationInc}s = ${datamine.burst.lampDuration + datamine.constellation2.durationInc}`
          : datamine.burst.lampDuration,
        unit: "s"
      }, {
        text: sgt("cd"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: sgt("energyCost"),
        value: datamine.burst.enerCost,
      }]
    }, ct.conditionalTemplate("passive1", {
      path: condA1StacksPath,
      value: condA1Stacks,
      teamBuff: true,
      name: st("stacks"),
      states: Object.fromEntries(a1StacksArr.map(stack => [
        stack,
        {
          name: st("stack", { count: stack }),
          fields: [{
            node: a1_eleMas_disp
          }]
        }
      ])),
    }), ct.headerTemplate("constellation2", {
      fields: [{
        text: st("durationInc"),
        value: datamine.constellation2.durationInc,
        unit: "s"
      }]
    }), ct.conditionalTemplate("constellation6", {
      path: condC6BurstEffectPath,
      value: condC6BurstEffect,
      teamBuff: true,
      name: st("activeCharField"),
      states: {
        on: {
          fields: [{
            node: infoMut(c6_dendro_dmg_disp, { key: "dendro_dmg_", variant: "dendro", isTeamBuff: true }),
          }]
        }
      }
    }), ct.conditionalTemplate("constellation6", {
      path: condC6BurstElePath,
      value: condC6BurstEle,
      teamBuff: true,
      canShow: equal(condC6BurstEffect, "on", 1),
      name: st("eleAbsor"),
      states: Object.fromEntries(Object.entries(c6_ele_dmg_disp).map(([ele, node]) => [
        ele, {
          name: <ColorText color={ele}>{sgt(`element.${ele}`)}</ColorText>,
          fields: [{ node: infoMut(node, { key: `${ele}_dmg_`, variant: ele as ElementKey, isTeamBuff: true }) }],
        }
      ]))
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2", [ct.fieldsTemplate("passive2", {
      fields: [{
        node: a4_skill_dmg_,
      }, {
        node: a4_burst_dmg_,
      }]
    })]),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: skillC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: burstC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  }

  return {
    talent,
    data,
    elementKey
  }
}
