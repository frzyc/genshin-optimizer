import type {
  ArtifactSetKey,
  CharacterKey,
  CharacterSheetKey,
  ElementKey,
  NonTravelerCharacterKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { charKeyToLocCharKey, charKeyToLocGenderedCharKey, locCharKeyToCharKey, sheetKeyToCharKey } from '@genshin-optimizer/gi/consts'
import * as allStat_gen from './allStat_gen.json'
import type { AllStats, CharacterDataGen } from './executors/gen-stats/executor'

// Make sure these are type-only imports/exports.
// Importing the executor is quite costly.
export type {
  CharacterDataGen,
  WeaponDataGen,
} from './executors/gen-stats/executor'

const allStats = allStat_gen as AllStats

export { allStats }

export function getCharEle(ck: CharacterSheetKey | CharacterKey): ElementKey {
  if (ck.startsWith('TravelerAnemo')) return 'anemo'
  else if (ck.startsWith('TravelerGeo')) return 'geo'
  else if (ck.startsWith('TravelerElectro')) return 'electro'
  else if (ck.startsWith('TravelerDendro')) return 'dendro'
  else if (ck.startsWith('TravelerHydro')) return 'hydro'
  else if (ck.startsWith('TravelerPyro')) return 'pyro'
  else return allStats.char.data[ck as NonTravelerCharacterKey].ele!
}

// Omit the ele, should use getCharEle to get char element.
export function getCharStat(ck: CharacterKey): Omit<CharacterDataGen, 'ele'> {
  const locCharKey = charKeyToLocCharKey(ck)
  return allStats.char.data[locCharKey]
}

export function getCharParam(ck: CharacterSheetKey) {
  return allStats.char.skillParam[ck]
}

export function isCharMelee(ck: CharacterKey) {
  const charStat = getCharStat(ck)
  const weaponTypeKey = charStat.weaponType
  return (
    weaponTypeKey === 'sword' ||
    weaponTypeKey === 'polearm' ||
    weaponTypeKey === 'claymore'
  )
}

export function getArtSetStat(setKey: ArtifactSetKey) {
  return allStats.art.data[setKey]
}

export function getWeaponStat(weaponKey: WeaponKey) {
  return allStats.weapon.data[weaponKey]
}
export function weaponHasRefinement(weaponKey: WeaponKey) {
  return getWeaponStat(weaponKey).rarity > 2
}
