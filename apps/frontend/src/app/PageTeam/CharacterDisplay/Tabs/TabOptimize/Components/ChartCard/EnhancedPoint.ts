import type { GeneratedBuild } from '@genshin-optimizer/gi/db'

export default class EnhancedPoint {
  public x: number
  public trueY?: number
  public build: GeneratedBuild
  public min?: number
  public current?: number
  public highlighted?: number
  public generBuildNumber?: number
  public graphBuildNumber?: number

  public constructor(x: number, y: number, build: GeneratedBuild) {
    this.x = x
    this.trueY = y
    this.build = build
  }

  public get y(): number {
    return (this.trueY || this.current || this.highlighted) as number
  }
  public set y(y: number | undefined) {
    this.trueY = y
  }
}
