import { Translate } from '../../../Components/Translate'
import { input, target } from '../../../Formula'
import { DisplaySub } from '../../../Formula/type'
import { constant, equal, greaterEq, infoMut, lookup, naught, percent, prod } from '../../../Formula/utils'
import { CharacterKey, CharacterSheetKey, ElementKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, sgt, st } from '../../SheetUtil'
import { charTemplates, TalentSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import Traveler from '../Traveler'
import assets from './assets'
import skillParam_gen from './skillParam_gen.json'

export default function geo(key: CharacterSheetKey, charKey: CharacterKey, dmgForms: { [key: string]: DisplaySub }) {
  const elementKey: ElementKey = "geo"
  const condCharKey = "TravelerGeo"
  const ct = charTemplates(key, Traveler.data_gen.weaponTypeKey, assets)

  const tr = (strKey: string) => <Translate ns={`char_${key}_gen`} key18={strKey} />

  let s = 0, b = 0
  const datamine = {
    skill: {
      dmg: skillParam_gen.skill[s++],
      duration: skillParam_gen.skill[s++][0],
      cd: skillParam_gen.skill[s++][0]
    },
    burst: {
      dmg: skillParam_gen.burst[b++],
      numShockwaves: 4,
      duration: skillParam_gen.burst[b++][0],
      cd: skillParam_gen.burst[b++][0],
      enerCost: skillParam_gen.burst[b++][0],
    },
    passive1: {
      skill_cdRed: 2
    },
    passive2: {
      geoDmg: percent(0.6),
    },
    constellation1: {
      critRate_: percent(0.1),
    },
    constellation4: {
      energyRestore: 5,
      maxTriggers: 5
    },
    constellation6: {
      burstDuration: 5,
      skillDuration: 10
    }
  } as const

  const [condC1BurstAreaPath, condC1BurstArea] = cond(condCharKey, `${elementKey}C1BurstArea`)
  const c1BurstArea_critRate_Disp = greaterEq(input.constellation, 1,
    equal(condC1BurstArea, "on", datamine.constellation1.critRate_)
  )
  const c1BurstArea_critRate_ = equal(input.activeCharKey, target.charKey, c1BurstArea_critRate_Disp)

  const [condC4BurstHitPath, condC4BurstHit] = cond(condCharKey, `${elementKey}C4BurstHit`)
  const c4Burst_energyRestore = lookup(condC4BurstHit,
    Object.fromEntries(range(1, datamine.constellation4.maxTriggers).map(stack => [
      stack,
      constant(stack * datamine.constellation4.energyRestore)
    ])),
    naught
  )

  const dmgFormulas = {
    ...dmgForms,
    skill: {
      dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
    },
    burst: {
      dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
    },
    passive2: {
      dmg: customDmgNode(
        prod(input.total.atk, datamine.passive2.geoDmg), "elemental", { hit: { ele: constant("geo") } }
      )
    },
    constellation2: {
      dmg: greaterEq(input.constellation, 2, dmgNode("atk", datamine.skill.dmg, "skill")),
    }
  } as const

  const burstC3 = greaterEq(input.constellation, 3, 3)
  const skillC5 = greaterEq(input.constellation, 5, 3)

  const data = dataObjForCharacterSheet(charKey, elementKey, undefined, Traveler.data_gen, dmgFormulas, {
    bonus: {
      skill: skillC5,
      burst: burstC3,
    },
    teamBuff: {
      premod: {
        critRate_: c1BurstArea_critRate_
      }
    }
  })

  const talent: TalentSheet = {
    skill: ct.talentTemplate("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        text: tr("skill.skillParams.1"),
        value: data => data.get(input.constellation).value >= 6
          ? `${datamine.skill.duration}s + ${datamine.constellation6.skillDuration}s = ${datamine.skill.duration + datamine.constellation6.skillDuration}`
          : datamine.skill.duration,
        unit: "s",
      }, {
        text: sgt("cd"),
        value: data => data.get(input.asc).value >= 1
          ? `${datamine.skill.cd}s - ${datamine.passive1.skill_cdRed}s = ${datamine.skill.cd - datamine.passive1.skill_cdRed}`
          : datamine.skill.cd,
        unit: "s",
      }]
    }, ct.headerTemplate("passive1", {
      fields: [{
        text: st("skillCDRed"),
        value: datamine.passive1.skill_cdRed,
        unit: "s"
      }]
    }), ct.headerTemplate("constellation2", {
      fields: [{
        node: infoMut(dmgFormulas.constellation2.dmg, { key: `char_${condCharKey}:c2.key` }),
      }]
    }), ct.headerTemplate("constellation6", {
      fields: [{
        text: st("durationInc"),
        value: datamine.constellation6.skillDuration,
        unit: "s"
      }]
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmg,
          { key: `sheet_gen:skillDMG` }
        ),
        textSuffix: st("brHits", { count: datamine.burst.numShockwaves })
      }, {
        text: tr("burst.skillParams.1"),
        value: data => data.get(input.constellation).value >= 6
          ? `${datamine.burst.duration}s + ${datamine.constellation6.burstDuration}s = ${datamine.burst.duration + datamine.constellation6.burstDuration}`
          : datamine.burst.duration,
        unit: "s"
      }, {
        text: sgt("cd"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: sgt("energyCost"),
        value: datamine.burst.enerCost,
      }]
    }, ct.conditionalTemplate("constellation1", {
      value: condC1BurstArea,
      path: condC1BurstAreaPath,
      name: st("activeCharField"),
      teamBuff: true,
      states: {
        on: {
          fields: [{
            node: infoMut(c1BurstArea_critRate_Disp, { key: "critRate_" }),
          }, {
            text: st("incInterRes"),
          }]
        }
      }
    }), ct.conditionalTemplate("constellation4", {
      value: condC4BurstHit,
      path: condC4BurstHitPath,
      name: st("hitOp.burst"),
      states: Object.fromEntries(range(1, datamine.constellation4.maxTriggers).map(stack => [
        stack,
        {
          name: st("hits", { count: stack }),
          fields: [{
            node: infoMut(c4Burst_energyRestore, { key: "sheet:energyRegen" }),
          }]
        }
      ]))
    }), ct.headerTemplate("constellation6", {
      fields: [{
        text: st("durationInc"),
        value: datamine.constellation6.burstDuration,
        unit: "s"
      }]
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2", [ct.fieldsTemplate("passive2", {
      fields: [{
        node: infoMut(dmgFormulas.passive2.dmg, { key: `char_${condCharKey}:passive2.key` })
      }]
    })]),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: burstC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: skillC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  }
  return {
    talent,
    data,
    elementKey
  }
}
