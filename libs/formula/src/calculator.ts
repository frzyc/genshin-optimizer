import { AnyNode, CalcResult, Calculator as Base, Tag } from '@genshin-optimizer/waverider'

type Output = {} // TODO

export class Calculator extends Base<Output> {
  override computeMeta(_op: AnyNode['op'], _tag: Tag | undefined, _value: any, _x: (CalcResult<any, Output> | undefined)[], _br: CalcResult<any, Output>[], _ex: any): Output {
    return {} // TODO
  }
}
