import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, splitScaleDmg } from './util'

const key: CharacterKey = 'Alhaitham'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = -1,
  s = -1,
  b = -1
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[++a], // 3x2
      skillParam_gen.auto[(a += 2)], // 4
      skillParam_gen.auto[++a], // 5
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a], // x2
    stamina: skillParam_gen.auto[(a += 2)][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    rushDmgAtk: skillParam_gen.skill[++s],
    rushDmgEm: skillParam_gen.skill[++s],
    atkInterval: skillParam_gen.skill[++s][0],
    mirrorDmgAtk: skillParam_gen.skill[++s],
    mirrorDmgEm: skillParam_gen.skill[++s],
    // mirrorDmgAtk2: skillParam_gen.skill[++s], // extras
    // mirrorDmgEm2: skillParam_gen.skill[++s],
    // mirrorDmgAtk3: skillParam_gen.skill[++s],
    // mirrorDmgEm3: skillParam_gen.skill[++s],
    mirrorRemovalInterval: skillParam_gen.skill[(s += 5)][0],
    cd: skillParam_gen.skill[++s][0],
  },
  burst: {
    instanceDmgAtk: skillParam_gen.burst[++b],
    instanceDmgEm: skillParam_gen.burst[++b],
    attackInstances: [
      skillParam_gen.burst[++b][0],
      skillParam_gen.burst[++b][0],
      skillParam_gen.burst[++b][0],
      skillParam_gen.burst[++b][0],
    ],
    cd: skillParam_gen.burst[++b][0],
    enerCost: skillParam_gen.burst[++b][0],
  },
  passive1: {
    cd: skillParam_gen.passive1[0][0],
  },
  passive2: {
    dmgInc: skillParam_gen.passive2[0][0],
    maxDmgInc: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    cdReduction: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    eleMas: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    numStacks: skillParam_gen.constellation2[2],
  },
  constellation4: {
    eleMas: skillParam_gen.constellation4[0],
    eleMasDuration: skillParam_gen.constellation4[1],
    dendro_dmg_: skillParam_gen.constellation4[2],
    dendroDuration: skillParam_gen.constellation4[3],
  },
  constellation6: {
    critRate_: skillParam_gen.constellation6[0],
    critDMG_: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'withMirrors' | 'excessMirror')
const { withMirrors, excessMirror } = allBoolConditionals(info.key)
// WR lookup debateStacks 1..numStacks; mirrorsConsumed 0..3 (0 is a real state)
const { debateStacks } = allNumConditionals(
  info.key,
  true,
  0,
  dm.constellation2.numStacks
)
const { mirrorsConsumed } = allNumConditionals(info.key, true, 0, 3)

const withMirrorsOn = cmpGE(withMirrors.ifOn(1), 1, 'infer', '')
const a4_skill_dmg_ = cmpGE(
  ascension,
  4,
  min(
    prod(percent(dm.passive2.dmgInc), final.eleMas),
    percent(dm.passive2.maxDmgInc)
  )
)
const a4_burst_dmg_ = a4_skill_dmg_
const c2DebateStacks_eleMas = cmpGE(
  constellation,
  2,
  prod(debateStacks, dm.constellation2.eleMas)
)
const c4MirrorsConsumed_eleMas = cmpGE(
  constellation,
  4,
  prod(mirrorsConsumed, dm.constellation4.eleMas)
)
// WR C6 compareEq: any set cond (incl. 0) → 3 generated. Else lookup 3-count.
// Pando 0 is unset/off, so gate >= 1; WR `'0'` (0 consumed → 3 generated) is lost.
const c4GeneratedMirrors = cmpGE(
  constellation,
  6,
  3,
  sum(3, prod(-1, mirrorsConsumed))
)
const c4MirrorsGenerated_dendro_dmg_ = cmpGE(
  constellation,
  4,
  cmpGE(
    mirrorsConsumed,
    1,
    prod(c4GeneratedMirrors, percent(dm.constellation4.dendro_dmg_))
  )
)
const c6ExcessMirror_critRate_ = excessMirror.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.critRate_))
)
const c6ExcessMirror_critDMG_ = excessMirror.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.critDMG_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Negation (skill); C5 Sagacity (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.eleMas.add(c2DebateStacks_eleMas),
  // WR teamBuff.premod.eleMas + unequal(activeCharKey, key) (not target.charKey).
  teamBuff.premod.eleMas.add(c4MirrorsConsumed_eleMas),
  ownBuff.premod.dmg_.dendro.add(c4MirrorsGenerated_dendro_dmg_),
  ownBuff.premod.critRate_.add(c6ExcessMirror_critRate_),
  ownBuff.premod.critDMG_.add(c6ExcessMirror_critDMG_),
  // WR infusion.nonOverridableSelf dendro. infusionPrio has no dendro channel —
  // listing-local `{ ele: 'dendro' }` on withMirrors NA/CA/plunge.

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal'),
    ...dmg(`normal_${i}_dendro`, info, 'atk', arr, 'normal', {
      ele: 'dendro',
      cond: withMirrorsOn,
    }),
  ]),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  dmg('charged_dendro', info, 'atk', dm.charged.dmg, 'charged', {
    ele: 'dendro',
    cond: withMirrorsOn,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) => [
    ...dmg(`plunging_${k}`, info, 'atk', v, 'plunging'),
    ...dmg(`plunging_${k}_dendro`, info, 'atk', v, 'plunging', {
      ele: 'dendro',
      cond: withMirrorsOn,
    }),
  ]),
  splitScaleDmg(
    'skill_rushDmg',
    info,
    ['atk', 'eleMas'],
    [dm.skill.rushDmgAtk, dm.skill.rushDmgEm],
    'skill'
  ),
  splitScaleDmg(
    'skill_mirrorDmg1',
    info,
    ['atk', 'eleMas'],
    [dm.skill.mirrorDmgAtk, dm.skill.mirrorDmgEm],
    'skill',
    undefined,
    ownBuff.premod.dmg_.skill.add(a4_skill_dmg_)
  ),
  splitScaleDmg(
    'burst_instanceDmg',
    info,
    ['atk', 'eleMas'],
    [dm.burst.instanceDmgAtk, dm.burst.instanceDmgEm],
    'burst',
    undefined,
    ownBuff.premod.dmg_.burst.add(a4_burst_dmg_)
  )
)
