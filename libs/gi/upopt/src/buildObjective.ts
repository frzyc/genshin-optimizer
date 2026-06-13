import { objMap } from '@genshin-optimizer/common/util'
import type { ArtifactSlotKey, SubstatKey } from '@genshin-optimizer/gi/consts'
import {
  allArtifactSlotKeys,
  allSubstatKeys,
} from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import type { ArtifactBuildData, DynStat } from '@genshin-optimizer/gi/solver'
import { getMainStatValue } from '@genshin-optimizer/gi/util'
import {
  type OptNode,
  ddx,
  optimize,
  precompute,
  zero_deriv,
} from '@genshin-optimizer/gi/wr'

import type { Objective } from './markov-tree/markov.types'
import type { Build } from './upOpt.types'

export type SlotObjectiveMap = Record<ArtifactSlotKey, Objective>

export function makeSlotObjectives(
  nodes: OptNode[],
  thresholds: number[],
  equippedBuild: Build
): {
  baseBuild: Record<ArtifactSlotKey, ArtifactBuildData>
  objectives: SlotObjectiveMap
  updateEquippedArtifact: (art: ICachedArtifact) => void
} {
  const baseBuild = objMap(equippedBuild, (art, slotKey) =>
    art ? toArtifact(art) : { id: '', slot: slotKey, values: {} }
  ) as Record<ArtifactSlotKey, ArtifactBuildData>

  const toEval: OptNode[] = []
  nodes.forEach((n) => {
    toEval.push(
      n,
      ...allSubstatKeys.map((sub) => ddx(n, (fo) => fo.path[1], sub))
    )
  })
  const evalOpt = optimize(toEval, {}, ({ path: [p] }) => p !== 'dyn')
  const evalFn = precompute(evalOpt, {}, (f) => f.path[1], 5)

  /**
   * Track substats whose derivatives are always zero so they can be skipped
   * during exact evaluation.
   */
  const zeroDeriv = allSubstatKeys.filter((sub) =>
    nodes.every((n) => zero_deriv(n, (f) => f.path[1], sub))
  )

  thresholds[0] = evalFn(
    Object.values(baseBuild) as ArtifactBuildData[] & { length: 5 }
  )[0] // dmg threshold is current objective value

  function makeObjectiveForSlot(slot: ArtifactSlotKey): Objective {
    return {
      threshold: thresholds,
      zeroDeriv,
      computeWithDerivs: (stats: DynStat) => {
        const build = objMap(baseBuild, (_, buildSlot) => ({
          id: '',
          slot: buildSlot,
          values: buildSlot === slot ? stats : {},
        })) as Record<ArtifactSlotKey, ArtifactBuildData>
        const out = evalFn(
          Object.values(build) as ArtifactBuildData[] & { length: 5 }
        )
        const f = out.slice(0, nodes.length)
        return [
          f,
          nodes.map((_, i) => {
            const ix = i * (1 + allSubstatKeys.length)
            return Object.fromEntries(
              allSubstatKeys.map((sub, si) => [sub, out[ix + 1 + si]])
            ) as DynStat
          }),
        ]
      },
    }
  }

  const objectives = Object.fromEntries(
    allArtifactSlotKeys.map((slot) => [slot, makeObjectiveForSlot(slot)])
  ) as SlotObjectiveMap

  return {
    baseBuild,
    objectives,
    updateEquippedArtifact: (art) => {
      baseBuild[art.slotKey] = toArtifact(art)
    },
  }
}

function toDecimal(key: SubstatKey | '', value: number) {
  return key.endsWith('_') ? value / 100 : value
}

/* ICachedArtifact to ArtifactBuildData. */
function toArtifact(art: ICachedArtifact): ArtifactBuildData {
  const mainStatVal = getMainStatValue(art.mainStatKey, art.rarity, art.level)
  const buildData = {
    id: art.id,
    slot: art.slotKey,
    level: art.level,
    rarity: art.rarity,
    values: {
      [art.setKey]: 1,
      [art.mainStatKey]: mainStatVal,
      ...Object.fromEntries(
        art.substats
          .map((substat) => [
            substat.key,
            toDecimal(substat.key, substat.accurateValue),
          ])
          .filter(([, value]) => value !== 0)
      ),
    },
    subs: art.substats.reduce((sub: SubstatKey[], x) => {
      if (x.key !== '') sub.push(x.key)
      return sub
    }, []),
  }
  delete buildData.values['']
  return buildData
}
