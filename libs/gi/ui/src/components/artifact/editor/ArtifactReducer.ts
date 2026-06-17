import { clamp } from '@genshin-optimizer/common/util'
import { validateArtifact } from '@genshin-optimizer/gi/db'
import type { IArtifact, ISubstat } from '@genshin-optimizer/gi/good'

type ResetMessage = { type: 'reset' }
type SubstatMessage = { type: 'substat'; index: number; substat: ISubstat }
type UnactivatedSubstatMessage = {
  type: 'unactivatedSubstat'
  index: number
  substat: ISubstat
}
type OverwriteMessage = { type: 'overwrite'; artifact: IArtifact }
type UpdateMessage = { type: 'update'; artifact: Partial<IArtifact> }
export type ArtifactReducerMessage =
  | ResetMessage
  | SubstatMessage
  | OverwriteMessage
  | UpdateMessage
  | UnactivatedSubstatMessage

function activeSubstatCount(artifact: IArtifact): number {
  return artifact.substats.filter(({ key }) => key).length
}

function upgradeRollCount(level: number): number {
  return Math.floor(level / 4)
}

export function artifactReducer(
  state: IArtifact | undefined,
  action: ArtifactReducerMessage
): IArtifact | undefined {
  const prev = state && {
    activeSubstatCount: activeSubstatCount(state),
    startingRolls:
      state.totalRolls === undefined
        ? undefined // don't assume totalRolls if it is undefined
        : state.totalRolls - upgradeRollCount(state.level),
  }
  const handle = () => {
    switch (action.type) {
      case 'reset':
        return undefined
      case 'substat': {
        const { index, substat } = action
        const substatWithInitialValue =
          substat.key &&
          substat.initialValue === undefined &&
          state!.substats[index].key === substat.key &&
          state!.substats[index].initialValue !== undefined
            ? { ...substat, initialValue: state!.substats[index].initialValue }
            : substat
        const oldIndex = substat.key
          ? state!.substats.findIndex((current) => current.key === substat.key)
          : -1

        if (oldIndex === -1 || oldIndex === index)
          state!.substats[index] = substatWithInitialValue
        // Already in used, swap the items instead
        else
          [state!.substats[index], state!.substats[oldIndex]] = [
            state!.substats[oldIndex],
            state!.substats[index],
          ]

        // Reset unactivated substat data if it exists
        if (
          state!.unactivatedSubstats?.length &&
          state!.unactivatedSubstats[0].key
        ) {
          state!.unactivatedSubstats = []
        }
        return { ...state! }
      }
      case 'unactivatedSubstat': {
        if (!state?.unactivatedSubstats) {
          return { ...state! }
        }

        const { index, substat } = action
        const findSubstatIndex = (
          substats: typeof state.substats,
          key: string
        ) => substats.findIndex((current) => current.key === key)
        const oldActivatedIndex = substat.key
          ? findSubstatIndex(state.substats, substat.key)
          : -1
        const unactivatedIndex = substat.key
          ? findSubstatIndex(state.unactivatedSubstats, substat.key)
          : -1
        const oldUnactivatedIndex =
          unactivatedIndex !== -1 ? unactivatedIndex + 3 : -1
        const newUnactivatedSubstat =
          substat.key &&
          substat.initialValue === undefined &&
          state.unactivatedSubstats.length > 0 &&
          state.unactivatedSubstats[0].key === substat.key &&
          state.unactivatedSubstats[0].initialValue !== undefined
            ? {
                ...substat,
                initialValue: state.unactivatedSubstats[0].initialValue,
              }
            : substat
        const activeSubstat = state.substats[3].key
          ? state.substats[3]
          : newUnactivatedSubstat

        // Allow swapping of substats between unactivated and activated
        if (index === 3) {
          // check if unactivated stat needs to swap with activated stat
          if (oldUnactivatedIndex === -1 || oldUnactivatedIndex === index) {
            if (
              oldActivatedIndex !== -1 &&
              oldUnactivatedIndex !== oldActivatedIndex
            ) {
              const tempStat = state!.unactivatedSubstats[0]
              state!.unactivatedSubstats[0] = state!.substats[oldActivatedIndex]
              state!.substats[oldActivatedIndex] = tempStat
            } else {
              state!.unactivatedSubstats[0] = activeSubstat
            }
          }
        } else {
          // check if activated stat needs to swap with unactivated stat
          if (oldActivatedIndex === -1 || oldActivatedIndex === index) {
            if (
              oldUnactivatedIndex !== -1 &&
              oldUnactivatedIndex !== oldActivatedIndex
            ) {
              const tempStat = state!.substats[index]
              state!.substats[index] = state!.unactivatedSubstats[0]
              state!.unactivatedSubstats[0] = tempStat
            } else {
              state!.substats[index] = activeSubstat
            }
          } else {
            // swap between activated stats
            const tempStat = state!.substats[index]
            state!.substats[index] = state!.substats[oldActivatedIndex]
            state!.substats[oldActivatedIndex] = tempStat
          }
        }

        // Reset activated substat
        if (state.substats[3].key) {
          state.substats[3] = { key: '', value: 0 }
        }

        return { ...state! }
      }
      case 'overwrite':
        return action.artifact
      case 'update':
        return { ...state!, ...action.artifact }
    }
  }
  const art = handle()
  if (!art) return art
  // If totalRolls is known and the artifact is updated, update totalRolls
  if (prev && prev.startingRolls !== undefined && action.type !== 'overwrite') {
    const activeDelta =
      action.type === 'substat' || action.type === 'update'
        ? activeSubstatCount(art) - prev.activeSubstatCount
        : 0
    art.totalRolls = clamp(
      prev.startingRolls + activeDelta + upgradeRollCount(art.level),
      0,
      9
    )
  }
  return validateArtifact(art, true)
}
