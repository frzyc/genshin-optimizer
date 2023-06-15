import type { IArtifact, ISubstat } from '@genshin-optimizer/gi-good'
export interface ICachedArtifact extends IArtifact {
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
