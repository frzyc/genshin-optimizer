import type {
  AscensionKey,
  LightConeKey,
  LocationKey,
  SuperimposeKey,
} from '@genshin-optimizer/sr/consts'

export interface ILightCone {
  key: LightConeKey
  level: number
  ascension: AscensionKey
  superimpose: SuperimposeKey
  location: LocationKey // where '' means not equipped
  lock: boolean
}
