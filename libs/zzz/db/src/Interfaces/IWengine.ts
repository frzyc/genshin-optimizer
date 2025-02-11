import type {
  LocationKey,
  ModificationKey,
  PhaseKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'

export interface IWengine {
  key: WengineKey
  level: number // 1-60 inclusive
  phase: PhaseKey
  ascension: ModificationKey // 1-5 inclusive
  location: LocationKey // where "" means not equipped.
  lock: boolean
}

export interface ICachedWengine extends IWengine {
  id: string
}
