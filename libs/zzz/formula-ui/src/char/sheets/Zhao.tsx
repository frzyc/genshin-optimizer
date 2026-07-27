import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Zhao } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet } from '../sheetUtil'

const key: CharacterKey = 'Zhao'
// TODO: Cleanup
// biome-ignore lint/suspicious/noTsIgnore: temp
//@ts-ignore
// biome-ignore lint/correctness/noUnusedVariables: temp
const [, ch] = trans('char', key)
// TODO: Cleanup
// biome-ignore lint/suspicious/noTsIgnore: temp
//@ts-ignore
// biome-ignore lint/correctness/noUnusedVariables: temp
const cond = Zhao.conditionals
// TODO: Cleanup
// biome-ignore lint/suspicious/noTsIgnore: temp
//@ts-ignore
// biome-ignore lint/correctness/noUnusedVariables: temp
const buff = Zhao.buffs

const sheet = createBaseSheet(key)

export default sheet
