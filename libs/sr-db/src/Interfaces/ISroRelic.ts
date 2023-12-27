import type { IRelic, ISubstat } from '@genshin-optimizer/sr-srod'

export interface ICachedRelic extends IRelic {
  id: string
  mainStatVal: number
  substats: ICachedSubstat[]
  probability?: number
}

export interface ICachedSubstat extends ISubstat {
  rolls: number[]
  efficiency: number
  accurateValue: number
}
