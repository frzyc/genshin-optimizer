export type EnhancedPoint = {
  x: number
  y?: number
  artifactIds: string[]
  min?: number
  current?: number
  highlighted?: number
}
export function getEnhancedPointY(pt: EnhancedPoint) {
  return (pt.y || pt.current || pt.highlighted) as number
}
