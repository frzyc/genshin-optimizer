import type {
  ArtifactSetKey,
  NonTravelerCharacterKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { artifactIdMap, characterIdMap, weaponIdMap } from '../mapping'
import { readHakushinJSON } from '../util'
import type { HakushinArtifact } from './artifact'
import type { HakushinChar } from './character'
import type { HakushinWeapon } from './weapon'

export function getHakushinCharData(key: NonTravelerCharacterKey) {
  const id = Object.entries(characterIdMap).find(
    ([_id, cKey]) => cKey === key
  )?.[0]
  const data = JSON.parse(
    readHakushinJSON(`character/${id}.json`)
  ) as HakushinChar
  return data
}

export function getHakushinArtiData(key: ArtifactSetKey) {
  const id = Object.entries(artifactIdMap).find(
    ([_id, aKey]) => aKey === key
  )?.[0]
  const data = JSON.parse(
    readHakushinJSON(`artifact/${id}.json`)
  ) as HakushinArtifact
  return data
}

export function getHakushinWepData(key: WeaponKey) {
  const id = Object.entries(weaponIdMap).find(
    ([_id, wKey]) => wKey === key
  )?.[0]
  const data = JSON.parse(
    readHakushinJSON(`weapon/${id}.json`)
  ) as HakushinWeapon
  return data
}
