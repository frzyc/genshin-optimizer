import type { DArtifactSlotKey, PropTypeKey } from '../mapping'

export type HakushinArtifact = {
  Id: number // 15040,
  Icon: string // "UI_RelicIcon_15040_4",
  Need: number[] // [2, 4],
  Rank: number[] // [4, 5],
  Affix: (
    | {
        id: number // 215040,
        affixId: number // 2150400,
        addProps: { value?: number; propType: PropTypeKey }[]
        // [
        // { "value": 0.15, "propType": "FIGHT_PROP_ICE_ADD_HURT" },
        // { "propType": "FIGHT_PROP_NONE" },
        // { "propType": "FIGHT_PROP_NONE" }
        // ]
        Name: string // "Finale of the Deep Galleries",
        Desc: string // "Cryo DMG Bonus +15%"
      }
    | {
        level: number // 1,
        paramList: number[] // [0.6, 0.6, 6],
        id: number // 215040,
        openConfig: string //"Relic_SpiralAbyss",
        affixId: number // 2150401,
        addProps: { value?: number; propType: PropTypeKey }[]
        Name: string // "Finale of the Deep Galleries",
        Desc: string // "When the equipping character has
      }
  )[]
  Parts: Partial<
    Record<
      DArtifactSlotKey,
      {
        Icon: string // "UI_RelicIcon_15040_1",
        Name: string // "Deep Gallery's Bestowed Banquet",
        Desc: string // "A cup fashioned from northland jade. They say that the people of an ancient civilization once used it as a ceremonial vessel to make offerings to the heavens.",
        Story: number // 185401
      }
    >
  >
}
