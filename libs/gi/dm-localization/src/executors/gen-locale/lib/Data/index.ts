import type {
  ArtifactSetKey,
  LocationGenderedCharacterKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { MediumTextMapOffset } from '../common'
import char from './Characters'
import sheet from './sheet'
export const mapHashData = {
  char,
  charNames: {} as Record<LocationGenderedCharacterKey, number>, // will be populated from datamine parsing pipeline
  weapon: {} as Record<
    WeaponKey,
    {
      name: number
      description: (string | number)[]
      passiveName: number
      passiveDescription: [number, string][] | number[]
    }
  >, // will be populated from datamine parsing pipeline
  weaponNames: {} as Record<WeaponKey, number>, // will be populated from datamine parsing pipeline
  artifact: {} as Record<
    ArtifactSetKey,
    {
      setName: number
      setEffects: Record<string, number>
      pieces: Record<string, { name: number; desc: number }>
    }
  >, // will be populated from datamine parsing pipeline
  artifactNames: {} as Record<ArtifactSetKey, number>, // will be populated from datamine parsing pipeline
  material: {} as Record<string, { name: number }>, // will be populated from datamine parsing pipeline
  tooltips: {} as Record<
    string,
    { name: number; description: [number, string] }
  >, // will be populated from datamine parsing pipeline
  sheet,
  weaponKey: {
    sword: 1338971918 - MediumTextMapOffset,
    polearm: 1654223994,
    bow: 4066070434 - MediumTextMapOffset,
    claymore: 2037297130 - MediumTextMapOffset,
    catalyst: 43479985 - MediumTextMapOffset,
  },
  elementalResonance: {
    ProtectiveCanopy: {
      name: 2109006394 - MediumTextMapOffset,
      desc: 3556079627,
    },
    FerventFlames: {
      name: 2012776706,
      desc: 3981421851,
    },
    SoothingWater: {
      name: 2733620714,
      desc: 740980787,
    },
    ShatteringIce: {
      name: 1853529306,
      desc: 2601161539 - MediumTextMapOffset,
    },
    HighVoltage: {
      name: 2331327954,
      desc: 1982396323 - MediumTextMapOffset,
    },
    ImpetuousWinds: {
      name: 166087994,
      desc: 170982675,
    },
    EnduringRock: {
      name: 3018382842,
      desc: 1707021043 - MediumTextMapOffset,
    },
    SprawlingGreenery: {
      name: 1292621586 - MediumTextMapOffset,
      desc: 2900013027 - MediumTextMapOffset,
    },
    Moonsign: {
      name: 47522259,
      desc: [1400535123, 'paragraph'],
      nascentGleam: {
        name: 3355827977 - MediumTextMapOffset,
        desc: 2507050873 - MediumTextMapOffset,
      },
      ascendantGleam: {
        name: 815173912,
        desc: [
          [856180336 - MediumTextMapOffset, 'paragraph'],
          [604954065, 'paragraph'],
        ],
      },
    },
    Hexerei: {
      name: 1797652852,
      desc: [838432396 - MediumTextMapOffset, 'paragraph'],
    },
  },
  statKey: {
    hp: 2404061249,
    hp_: 2404061249,
    atk: 638981362,
    atk_: 638981362,
    def: 527947494 - MediumTextMapOffset,
    def_: 527947494 - MediumTextMapOffset,
    eleMas: 382595279,
    enerRech_: 1735465728 - MediumTextMapOffset,
    critRate_: 1916797986,
    critDMG_: 4137936461 - MediumTextMapOffset,
    heal_: 3911103831,
    physical_dmg_: 3763864883,
    anemo_dmg_: 312842903 - MediumTextMapOffset,
    geo_dmg_: 2557985416 - MediumTextMapOffset,
    electro_dmg_: 3514877774 - MediumTextMapOffset,
    hydro_dmg_: 3619239513 - MediumTextMapOffset,
    pyro_dmg_: 999734248 - MediumTextMapOffset,
    cryo_dmg_: 4054347456 - MediumTextMapOffset,
    dendro_dmg_: 1824382851 - MediumTextMapOffset,
  },
  teams: {
    team: 1969596378 - MediumTextMapOffset,
    quickSetup: 3714868212 - MediumTextMapOffset,
  },
} as const
export function mapHashDataOverride() {
  mapHashData.charNames.TravelerF = 3241049361
  mapHashData.charNames.TravelerM = 2329553598 - MediumTextMapOffset
  if (!mapHashData.char.TravelerF) mapHashData.char.TravelerF = {}
  mapHashData.char.TravelerF['name'] = 3241049361
  if (!mapHashData.char.TravelerM) mapHashData.char.TravelerM = {}
  mapHashData.char.TravelerM['name'] = 2329553598 - MediumTextMapOffset
}
