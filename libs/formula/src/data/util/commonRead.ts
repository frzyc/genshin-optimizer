import { constant, NumNode } from '@genshin-optimizer/waverider'
import { reader, todo } from './read'

export function percent(x: number | NumNode): NumNode {
  return typeof x === 'number' ? constant(x) : x
}
export const one = percent(1), naught = percent(0)

export const { team, enemy, none: nosrc } = reader.withAll('src')
export const activeChar = todo

export const cappedCritRate_ = nosrc.q.cappedCritRate_
export const hitEle = todo
