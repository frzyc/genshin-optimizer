import char from './Characters'
import sheet from './sheet'
export const mapHashData = {
  char,
  weapon: {},//will be populated from datamine parsing pipeline
  artifact: {},
  sheet,
  weaponKey: {
    sword: 1338971918,
    polearm: 1654223994,
    bow: 4066070434,
    claymore: 2037297130,
    catalyst: 43479985
  }
}
type WeaponIcon = { Icon: string, AwakenIcon: string }
type WeaponIconData = { [key: string]: WeaponIcon }

type CharacterIcon = {
  Icon: string,
  IconSide: string,
  Banner: string,
  Bar: string
}
type CharacterIconData = { [key: string]: CharacterIcon }
//An object to store all the asset related data.
export const AssetData = {
  weapon: {
    sword: {} as WeaponIconData,
    bow: {} as WeaponIconData,
    catalyst: {} as WeaponIconData,
    claymore: {} as WeaponIconData,
    polearm: {} as WeaponIconData,
  },
  artifact: {},
  char: {} as CharacterIconData,
}