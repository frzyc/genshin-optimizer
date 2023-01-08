import char from './Characters'
import sheet from './sheet'
export const mapHashData = {
  char,
  charNames: {}, // will be populated from datamine parsing pipeline
  weapon: {}, // will be populated from datamine parsing pipeline
  weaponNames: {}, // will be populated from datamine parsing pipeline
  artifact: {}, // will be populated from datamine parsing pipeline
  artifactNames: {}, // will be populated from datamine parsing pipeline
  material: {}, // will be populated from datamine parsing pipeline
  sheet,
  weaponKey: {
    sword: 1338971918,
    polearm: 1654223994,
    bow: 4066070434,
    claymore: 2037297130,
    catalyst: 43479985
  },
  elementalResonance: {
    ProtectiveCanopy: {
      name: 2109006394,
      desc: 3556079627
    },
    FerventFlames: {
      name: 2012776706,
      desc: 3981421851
    },
    SoothingWater: {
      name: 2733620714,
      desc: 740980787
    },
    ShatteringIce: {
      name: 1853529306,
      desc: 2601161539
    },
    HighVoltage: {
      name: 2331327954,
      desc: 1982396323
    },
    ImpetuousWinds: {
      name: 166087994,
      desc: 170982675
    },
    EnduringRock: {
      name: 3018382842,
      desc: 1707021043
    },
    SprawlingGreenery: {
      name: 1292621586,
      desc: 2900013027
    }
  }
}
export function mapHashDataOverride() {
  (mapHashData.charNames as any).TravelerF = 3241049361;
  (mapHashData.charNames as any).TravelerM = 2329553598;
  (mapHashData.char as any).TravelerF.name = 3241049361;
  (mapHashData.char as any).TravelerM.name = 2329553598;
}
type WeaponIcon = { icon: string, awakenIcon: string }
type WeaponIconData = { [key: string]: WeaponIcon }

type CharacterIcon = {
  icon: string,
  iconSide: string,
  banner: string,
  bar: string
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
