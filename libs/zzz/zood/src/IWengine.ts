import type {
  LocationKey,
  MilestoneKey,
  PhaseKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'

export interface IWengine {
  key: WengineKey
  level: number // 1-60 inclusive
  phase: PhaseKey
  modification: MilestoneKey // 0-5 inclusive
  location: LocationKey // where "" means not equipped.
  lock: boolean
}
