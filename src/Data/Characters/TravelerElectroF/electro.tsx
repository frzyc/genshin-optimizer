import { Translate } from '../../../Components/Translate'
import { input, target } from '../../../Formula'
import { DisplaySub } from '../../../Formula/type'
import { equal, greaterEq, infoMut, percent, prod, subscript, sum } from '../../../Formula/utils'
import { CharacterKey, CharacterSheetKey, ElementKey } from '../../../Types/consts'
import { cond, sgt } from '../../SheetUtil'
import { charTemplates, TalentSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import Traveler from '../Traveler'
import assets from './assets'
import skillParam_gen from './skillParam_gen.json'

export default function electro(key: CharacterSheetKey, charKey: CharacterKey, dmgForms: { [key: string]: DisplaySub }) {
  const elementKey: ElementKey = "electro"
  const condCharKey = "TravelerElectro"
  const ct = charTemplates(key, Traveler.data_gen.weaponTypeKey, assets)

  const tr = (strKey: string) => <Translate ns={`char_${key}_gen`} key18={strKey} />
  const trm = (strKey: string) => <Translate ns={`char_${condCharKey}`} key18={strKey} />

  let s = 0, b = 0
  const datamine = {
    skill: {
      dmg: skillParam_gen.skill[s++],
      energyRestore: skillParam_gen.skill[s++],
      amulets: 2,
      amuletDuration: skillParam_gen.skill[s++][0],
      enerRech_: skillParam_gen.skill[s++][0],
      enerRech_duration: skillParam_gen.skill[s++][0],
      cd: skillParam_gen.skill[s++][0],
    },
    burst: {
      pressDmg: skillParam_gen.burst[b++],
      thunderDmg: skillParam_gen.burst[b++],
      thunderCd: 0.5,
      energyRestore: skillParam_gen.burst[b++],
      duration: skillParam_gen.burst[b++][0],
      cd: skillParam_gen.burst[b++][0],
      enerCost: skillParam_gen.burst[b++][0]
    },
    passive1: {
      cdRed: skillParam_gen.passive1[0][0],
    },
    passive2: {
      enerRech_: skillParam_gen.passive2[0][0],
    },
    constellation1: {
      addlAmulets: 1
    },
    constellation2: {
      duration: skillParam_gen.constellation2[0],
      electro_enemyRes: skillParam_gen.constellation2[1],
    },
    constellation6: {
      numAttacks: skillParam_gen.constellation6[0],
      thunder_dmg_: skillParam_gen.constellation6[0],
      energyRestore: skillParam_gen.constellation6[1]
    }
  } as const

  const [condSkillAmuletPath, condSkillAmulet] = cond(condCharKey, `${elementKey}SkillAmulet`)
  const p2_enerRech_ = greaterEq(input.asc, 4,
    prod(input.premod.enerRech_, percent(datamine.passive2.enerRech_))
  )
  const skillAmulet_enerRech_Disp = equal(condSkillAmulet, "on",
    sum(
      percent(datamine.skill.enerRech_),
      p2_enerRech_
    )
  )
  const skillAmulet_enerRech_ = equal(input.activeCharKey, target.charKey, skillAmulet_enerRech_Disp)

  const burstEnergyRestore = subscript(input.total.burstIndex, datamine.burst.energyRestore,
    { key: `char_${key}_gen:burst.skillParmas.2` }
  )

  const [condC2ThunderPath, condC2Thunder] = cond(condCharKey, `${elementKey}C2Thunder`)
  const c2Thunder_electro_enemyRes_ = greaterEq(input.constellation, 2,
    equal(condC2Thunder, "on", datamine.constellation2.electro_enemyRes)
  )

  const [condC6After2ThunderPath, condC6After2Thunder] = cond(condCharKey, `${elementKey}C6After2Thunder`)
  const c6_thunder_dmg_ = greaterEq(input.constellation, 6, equal(condC6After2Thunder, "on", datamine.constellation6.thunder_dmg_))

  const dmgFormulas = {
    ...dmgForms,
    skill: {
      dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
    },
    burst: {
      pressDmg: dmgNode("atk", datamine.burst.pressDmg, "burst"),
      thunderDmg: dmgNode("atk", datamine.burst.thunderDmg, "burst",
        { premod: { burst_dmg_: c6_thunder_dmg_ } })
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
        electro_enemyRes_: c2Thunder_electro_enemyRes_,
      },
      total: {
        enerRech_: skillAmulet_enerRech_ // In total to avoid loops
      }
    }
  })

  const talent: TalentSheet = {
    skill: ct.talentTemplate("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` })
      }, {
        text: trm("skill.amuletGenAmt"),
        value: data => data.get(input.constellation).value >= 1
          ? datamine.skill.amulets + datamine.constellation1.addlAmulets
          : datamine.skill.amulets
      }, {
        text: tr("skill.skillParams.4"),
        value: datamine.skill.amuletDuration,
        unit: "s"
      }, {
        text: sgt("cd"),
        value: datamine.skill.cd,
        unit: "s",
        fixed: 1
      }]
    }, ct.conditionalTemplate("skill", {
      value: condSkillAmulet,
      path: condSkillAmuletPath,
      name: trm("skill.absorb"),
      teamBuff: true,
      states: {
        on: {
          fields: [{
            node: subscript(input.total.skillIndex, datamine.skill.energyRestore,
              { key: `char_${key}_gen:skill.skillParams.1` }
            )
          }, {
            node: infoMut(skillAmulet_enerRech_Disp, { key: "enerRech_" })
          }, {
            text: sgt("duration"),
            value: datamine.skill.enerRech_duration,
            unit: "s"
          }]
        }
      }
    }), ct.headerTemplate("passive1", {
      fields: [{
        text: tr("passive1.description")
      }]
    }), ct.headerTemplate("passive2", {
      fields: [{
        node: infoMut(p2_enerRech_, { key: `char_${condCharKey}:passive2.enerRech_` })
      }]
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.pressDmg,
          { key: `char_${key}_gen:burst.skillParams.0` }
        )
      }, {
        node: infoMut(dmgFormulas.burst.thunderDmg,
          { key: `char_${key}_gen:burst.skillParams.1` }
        )
      }, {
        text: trm("burst.thunderCd"),
        value: datamine.burst.thunderCd,
        unit: "s",
        fixed: 1
      }, {
        node: infoMut(burstEnergyRestore, { key: `char_${key}_gen:burst.skillParams.2` })
      }, {
        text: sgt("duration"),
        value: datamine.burst.duration,
        unit: "s"
      }, {
        text: sgt("cd"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: sgt("energyCost"),
        value: datamine.burst.enerCost,
      }]
    }, ct.conditionalTemplate("constellation2", {
      value: condC2Thunder,
      path: condC2ThunderPath,
      name: trm("c2.thunderHit"),
      teamBuff: true,
      states: {
        on: {
          fields: [{
            node: c2Thunder_electro_enemyRes_
          }, {
            text: sgt("duration"),
            value: datamine.constellation2.duration,
            unit: "s"
          }]
        }
      }
    }), ct.conditionalTemplate("constellation6", {
      value: condC6After2Thunder,
      path: condC6After2ThunderPath,
      name: trm("c6.fallingThunder3"),
      states: {
        on: {
          fields: [{
            node: infoMut(c6_thunder_dmg_,
              { key: `char_${condCharKey}:c6.fallingThunderBonus_`, variant: "electro" }
            )
          }, {
            text: tr("burst.skillParams.2"),
            value: datamine.constellation6.energyRestore
          }]
        }
      }
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2"),
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
