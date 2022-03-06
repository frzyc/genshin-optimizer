import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, equalStr, greaterEq, infoMut, percent, prod, subscript, sum, unequal } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, st, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode, healNodeTalent, shieldNode, shieldNodeTalent } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Noelle"
const elementKey: ElementKey = "geo"
const [tr, trm] = trans("char", key)

let a = 0, s = 0, b = 0, p1 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], 
      skillParam_gen.auto[a++], 
      skillParam_gen.auto[a++], 
      skillParam_gen.auto[a++], 
    ]
  },
  charged: {
    spinningDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    shieldDef: skillParam_gen.skill[s++],
    healDef: skillParam_gen.skill[s++],
    healChance: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    skillDmg: skillParam_gen.skill[s++],
    shieldFlat: skillParam_gen.skill[s++],
    healFlat: skillParam_gen.skill[s++],
  },
  burst: {
    burstDmg: skillParam_gen.burst[b++],
    skillDmg: skillParam_gen.burst[b++],
    defToAtk: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: { // Devotion Shield
    hpThreshold: skillParam_gen.passive1[p1++][0],
    shield: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
    cooldown: skillParam_gen.passive1[p1++][0],
  },
  constellation1: {
    healingChance: skillParam_gen.constellation1[0],
  },
  constellation2: {
    chargeStamina: skillParam_gen.constellation2[0],
    chargeDmg_: skillParam_gen.constellation2[1],
  },
  constellation4: {
    skillDmg: skillParam_gen.constellation4[0],
  },
  constellation6: {
    burstAtkBonus: skillParam_gen.constellation6[0],
  },
} as const

const [condBurstPath, condBurst] = cond(key, "SweepingTime")
const nodeBurstAtk = equal("on", condBurst, prod(
    input.total.def, 
    sum( 
        subscript(input.total.burstIndex, datamine.burst.defToAtk, {key:'_'}),
        greaterEq(input.constellation, 6, percent(datamine.constellation6.burstAtkBonus))
        )
    ),
) 

const nodeBurstInfusion = equalStr(condBurst, "on", "geo")



const nodeSkillHealChanceBase = subscript(input.total.skillIndex, datamine.skill.healChance, { key:`char_${key}:skillHeal_` })
const nodeSkillHealChanceC1BurstOn = equal("on", condBurst, percent(datamine.constellation1.healingChance), { key: `char_${key}:skillHeal_` }) 
const nodeSkillHealChanceC1BurstOff = unequal("on", condBurst, nodeSkillHealChanceBase) 

const nodeC2ChargeDMG = greaterEq(input.constellation, 2, percent(datamine.constellation2.chargeDmg_))

const nodeC4dmg = customDmgNode(prod(input.total.def, percent(datamine.constellation4.skillDmg)), "elemental",
{ hit: { ele: constant(elementKey) } })

const geoShieldStrength = { "customBonus": { "shield_": percent(0.5) } }

const dmgFormulas = {
    normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
      [i, dmgNode("atk", arr, "normal")])),
    charged: {
      spinningDmg: dmgNode("atk", datamine.charged.spinningDmg, "charged"),
      finalDmg: dmgNode("atk", datamine.charged.finalDmg, "charged"),
    },
    plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
      [key, dmgNode("atk", value, "plunging")])),
    skill: {
      dmg: dmgNode("def", datamine.skill.skillDmg, "skill"),
      //dmg: customDmgNode( prod(input.total.def , subscript(input.total.skillIndex,datamine.skill.skillDmg)), "elemental" ),
      shield: shieldNodeTalent("def", datamine.skill.shieldDef, datamine.skill.shieldFlat, "skill", geoShieldStrength),
      //shield: customShieldNode( sum( subscript(input.total.skillIndex,datamine.skill.shieldFlat), prod(input.total.def , subscript(input.total.skillIndex,datamine.skill.shieldDef))) ),
      heal: healNodeTalent("def", datamine.skill.healDef, datamine.skill.healFlat, "skill"),
      //heal: customHealNode( sum( subscript(input.total.skillIndex,datamine.skill.healFlat), prod(input.total.def , subscript(input.total.skillIndex,datamine.skill.healDef))) ),
    },
    burst: {
        defConv: nodeBurstAtk,
        burstDmg: dmgNode("atk", datamine.burst.burstDmg, "burst"),
        skillDmg: dmgNode("atk", datamine.burst.skillDmg, "burst"),
    },
    passive1: {
      devotionShield: shieldNode("def", percent(datamine.passive1.shield), 0, geoShieldStrength )
    },
    constellation4: {
        dmg: nodeC4dmg
      }
  }

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

const sheet: ICharacterSheet = {
    name: tr("name"),
    cardImg: card,
    thumbImg: thumb,
    thumbImgSide: thumbSide,
    bannerImg: banner,
    rarity: data_gen.star,
    elementKey: "geo",
    weaponTypeKey: data_gen.weaponTypeKey,
    gender: "F",
    constellationName: tr("constellationName"),
    title: tr("title"),
    talent: {
      sheets: {
        auto: {
          name: tr("auto.name"),
          img: normalSrc(data_gen.weaponTypeKey),
          sections: [{
            text: tr("auto.fields.normal"),
            fields: datamine.normal.hitArr.map((_, i) => ({
              node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
            }))
          },
          {
            text: tr("auto.fields.charged"),
            fields: [{
              node: infoMut(dmgFormulas.charged.spinningDmg, { key: `char_${key}_gen:auto.skillParams.4` }),
            }, {
              node: infoMut(dmgFormulas.charged.finalDmg, { key: `char_${key}_gen:auto.skillParams.5` }),
            }, {
              text: tr("auto.skillParams.6"),
              value: datamine.charged.stamina,
              unit: '/s'
            }, {
              text: tr("auto.skillParams.7"),
              value: datamine.charged.duration,
              unit: 's'
            }]
          }, {
            text: tr(`auto.fields.plunging`),
            fields: [{
              node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
            }, {
              node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
            }, {
              node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
            }]
          }
          ],
        },
        skill: {
          name: tr("skill.name"),
          img: skill,
          sections: [{
            text: tr("skill.description"),
            fields: [
              {
                node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` }),
              }, {
                node: infoMut(dmgFormulas.skill.shield, { key: `char_${key}_gen:skill.skillParams.1`}),
              }, {
                node: infoMut(dmgFormulas.skill.heal, { key: `char_${key}_gen:skill.skillParams.2`, variant: "success"  }),
              }, 
              //Heal trigger chance 
              {
                canShow: data => data.get(input.constellation).value === 0,
                node: nodeSkillHealChanceBase,
              },
              {
                canShow: data => data.get(input.constellation).value >= 1,
                node: nodeSkillHealChanceC1BurstOff,
              }, 
              {
                canShow: data => data.get(input.constellation).value >= 1,
                node: nodeSkillHealChanceC1BurstOn,
              }, 
              //Shield Duration
              {
                text: tr("skill.skillParams.4"), 
                value: datamine.skill.shieldDuration,
                unit: "s"
              },
              //Cooldown
              {
                canShow: data => data.get(input.asc).value < 4,
                text: tr("skill.skillParams.5"), 
                value: datamine.skill.cd,
                unit: "s"
              },
              {
                canShow: data => data.get(input.asc).value >= 4,
                text: tr("skill.skillParams.5"), 
                value: trm(`p4cd`),
              }
            ],
          }],
        },
        burst: {
          name: tr("burst.name"),
          img: burst,
          sections: [{
            text: tr("burst.description"),
            fields: [
              { node: infoMut(dmgFormulas.burst.burstDmg, { key: `char_${key}_gen:burst.skillParams.0` }), },
              { node: infoMut(dmgFormulas.burst.skillDmg, { key: `char_${key}_gen:burst.skillParams.1` }), },
              {
                canShow: data => data.get(input.constellation).value < 6,
                text: tr("burst.skillParams.3"),
                value: datamine.burst.duration,
                unit: "s"
              }, 
              {
                canShow: data => data.get(input.constellation).value >= 6,
                text: tr("burst.skillParams.3"),
                value: trm(`c6duration`),
              }, 
              {
                text: tr("burst.skillParams.4"),
                value: datamine.burst.cd,
              }, 
              {
                text: tr("burst.skillParams.5"),
                value: datamine.burst.enerCost,
              }
            ],
            conditional: {
              name: tr("burst.name"),
              value: condBurst,
              path: condBurstPath,
              states: {
                on: {
                  fields: [
                    {
                      text: st("infusion.geo"),
                      variant: "geo",
                    },
                    {
                        text:trm("qlarger")
                    },
                    {
                      node: infoMut(nodeBurstAtk, { key: `char_${key}_gen:burst.skillParams.2`})
                    }
                  ]
                }
              }
            }
          }],
        },
        passive1: talentTemplate("passive1", tr, passive1, [
          {
            node:infoMut(dmgFormulas.passive1.devotionShield, {key: `char_${key}_gen:skill.skillParams.1`})
          },{
            text: tr("skill.skillParams.4"), 
            value: datamine.passive1.duration,
            unit: "s"
          },
          {
            text: tr("skill.skillParams.5"), 
            value: datamine.passive1.cooldown,
            unit: "s"
          }
        ]),
        passive2: talentTemplate("passive2", tr, passive2),
        passive3: talentTemplate("passive3", tr, passive3),
        constellation1: talentTemplate("constellation1", tr, c1),
        constellation2: talentTemplate("constellation2", tr, c2),
        constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
        constellation4: talentTemplate("constellation4", tr, c4, [{
            canShow: data => data.get(input.constellation).value >= 4,
            node: infoMut(nodeC4dmg, { key: `char_${key}:c4dmg` })
          }]),
        constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
        constellation6: talentTemplate("constellation6", tr, c6),
      },
    },
  };

export const data = dataObjForCharacterSheet(key, "geo", "mondstadt", data_gen, dmgFormulas, {
    bonus: {
      skill: nodeC5,
      burst: nodeC3,
    },
    premod: {
        charged_dmg_: nodeC2ChargeDMG,
        atk: nodeBurstAtk,
      },
      infusion: nodeBurstInfusion
  })

export default new CharacterSheet(sheet, data);
