import { addCustomOperation } from '@genshin-optimizer/pando/engine'

export * from './calculator'
export * from './IConditionalData'
export * from './listing'
export * from './read'
export * from './tag'
export * from './util'

{
  const floorCalc = (args: (number | string)[]): number => {
    const x = args[0] as number
    return Math.floor(x)
  }
  addCustomOperation('floor', {
    range: ([r]) => ({ min: floorCalc([r.max]), max: floorCalc([r.min]) }),
    monotonicity: () => [{ inc: true, dec: false }],
    calc: floorCalc,
  })
}
