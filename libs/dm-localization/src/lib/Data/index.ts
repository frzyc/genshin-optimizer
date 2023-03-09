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
    catalyst: 43479985,
  },
  elementalResonance: {
    ProtectiveCanopy: {
      name: 2109006394,
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
      desc: 2601161539,
    },
    HighVoltage: {
      name: 2331327954,
      desc: 1982396323,
    },
    ImpetuousWinds: {
      name: 166087994,
      desc: 170982675,
    },
    EnduringRock: {
      name: 3018382842,
      desc: 1707021043,
    },
    SprawlingGreenery: {
      name: 1292621586,
      desc: 2900013027,
    },
  },
  statKey: {
    hp: 2404061249,
    hp_: 2404061249,
    atk: 638981362,
    atk_: 638981362,
    def: 527947494,
    def_: 527947494,
    eleMas: 382595279,
    enerRech_: 1735465728,
    critRate_: 1916797986,
    critDMG_: 4137936461,
    heal_: 3911103831,
    physical_dmg_: 3763864883,
    anemo_dmg_: 312842903,
    geo_dmg_: 2557985416,
    electro_dmg_: 3514877774,
    hydro_dmg_: 3619239513,
    pyro_dmg_: 999734248,
    cryo_dmg_: 4054347456,
    dendro_dmg_: 1824382851,
  },
}
export function mapHashDataOverride() {
  ;(mapHashData.charNames as { TravelerF: number }).TravelerF = 3241049361
  ;(mapHashData.charNames as { TravelerM: number }).TravelerM = 2329553598
  ;(mapHashData.char as any).TravelerF.name = 3241049361
  ;(mapHashData.char as any).TravelerM.name = 2329553598
}
