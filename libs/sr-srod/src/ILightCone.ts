import type {
  AscensionKey,
  LightConeKey,
  SuperimposeKey,
  LocationKey,
} from '@genshin-optimizer/sr-consts'

export interface ILightCone {
  key: LightConeKey
  level: number
  ascension: AscensionKey
  superimpose: SuperimposeKey
  location: LocationKey // where '' means not equipped
  lock: boolean
}
