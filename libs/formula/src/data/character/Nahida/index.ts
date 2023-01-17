import { AnyNode, cmpEq, cmpGE, min, prod, RawTagMapEntries, subscript } from "@genshin-optimizer/waverider"
import { activeChar, enemy, percent, reader, team } from "../../util"
import { entriesForChar } from "../util"

import data_gen from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

let a = 0, s = 0, b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
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
    pressDmg: skillParam_gen.skill[s++],
    holdDmg: skillParam_gen.skill[s++],
    karmaAtkDmg: skillParam_gen.skill[s++],
    karmaEleMasDmg: skillParam_gen.skill[s++],
    triggerInterval: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    pressCd: skillParam_gen.skill[s++][0],
    holdCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg_1: skillParam_gen.burst[b++],
    dmg_2: skillParam_gen.burst[b++],
    intervalDec_1: skillParam_gen.burst[b++],
    intervalDec_2: skillParam_gen.burst[b++],
    durationInc1: skillParam_gen.burst[b++],
    durationInc2: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    energyCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    eleMas_: skillParam_gen.passive1[0][0],
    maxEleMas: skillParam_gen.passive1[1][0],
  },
  passive2: {
    eleMas_min: skillParam_gen.passive2[0][0],
    eleMas_maxCounted: skillParam_gen.passive2[1][0],
    eleMas_dmg_: skillParam_gen.passive2[2][0],
    eleMas_critRate_: skillParam_gen.passive2[3][0],
  },
  constellation2: {
    critRate_: skillParam_gen.constellation2[0],
    critDMG_: 1,
    defDec_: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
  },
  constellation4: {
    eleMas: [...skillParam_gen.constellation4]
  },
  constellation6: {
    atkDmg: skillParam_gen.constellation6[0],
    eleMasDmg: skillParam_gen.constellation6[1],
    cd: skillParam_gen.constellation6[2],
    duration: skillParam_gen.constellation6[3],
    triggers: skillParam_gen.constellation6[4],
  }
} as const

const charKey = 'Nahida', ele = 'dendro'
const r = reader.char(charKey), { premod, final } = r
const { auto, skill, burst, constellation, ascension } = r.qq
const { a1ActiveInBurst, c2Bloom, c2QSA, c4Count } = r.base.customQ

const c2_critRate_ = cmpGE(constellation, 2, cmpEq(c2Bloom, "on", percent(dm.constellation2.critRate_)))
const c2_critDMG_ = cmpGE(constellation, 2, cmpEq(c2Bloom, "on", percent(dm.constellation2.critDMG_)))
const c2qsa_defRed_ = cmpGE(constellation, 2, cmpEq(c2QSA, "on", percent(dm.constellation2.defDec_)))
const a1InBurst_eleMasDisp = cmpGE(ascension, 1, cmpEq(a1ActiveInBurst, "on",
  min(
    prod(dm.passive1.eleMas_, team.q('eleMas')),
    dm.passive1.maxEleMas,
  )
))

// TODO: DMG Formulas

const a1InBurst_eleMas = cmpEq(activeChar, charKey, a1InBurst_eleMasDisp)
const data: RawTagMapEntries<AnyNode> = [
  ...entriesForChar(r, ele, 'sumeru', data_gen),
  skill.addNode(cmpGE(constellation, 3, 3)),
  burst.addNode(cmpGE(constellation, 5, 3)),

  premod.q('eleMas').addNode(cmpGE(constellation, 4, subscript(c4Count, [NaN, ...dm.constellation4.eleMas]))),

  team.premod.burning.q('critRate_').addNode(c2_critRate_),
  team.premod.bloom.q('critRate_').addNode(c2_critRate_),
  team.premod.hyperbloom.q('critRate_').addNode(c2_critRate_),
  team.premod.burgeon.q('critRate_').addNode(c2_critRate_),

  team.premod.burning.q('critDMG_').addNode(c2_critDMG_),
  team.premod.bloom.q('critDMG_').addNode(c2_critDMG_),
  team.premod.hyperbloom.q('critDMG_').addNode(c2_critDMG_),
  team.premod.burgeon.q('critDMG_').addNode(c2_critDMG_),

  enemy.q('defRed_').addNode(c2qsa_defRed_),

  team.final.q('eleMas').addNode(a1InBurst_eleMas),
]
export default data
