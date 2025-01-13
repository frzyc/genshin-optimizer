import type { IDisc, ISubstat } from './IDisc'

export interface ICachedDisc extends IDisc {
  id: string
  mainStatVal: number
  substats: ICachedSubstat[]
}

export interface ICachedSubstat extends ISubstat {
  rolls: number
  accurateValue: number
}
