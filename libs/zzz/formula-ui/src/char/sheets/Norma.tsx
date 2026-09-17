import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Norma } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet } from '../sheetUtil'

const key: CharacterKey = 'Norma'
// TODO: Cleanup
// biome-ignore lint/suspicious/noTsIgnore: temp
//@ts-ignore
// biome-ignore lint/correctness/noUnusedVariables: temp
const [, ch] = trans('char', key)
// TODO: Cleanup
// biome-ignore lint/suspicious/noTsIgnore: temp
//@ts-ignore
// biome-ignore lint/correctness/noUnusedVariables: temp
const cond = Norma.conditionals
// TODO: Cleanup
// biome-ignore lint/suspicious/noTsIgnore: temp
//@ts-ignore
// biome-ignore lint/correctness/noUnusedVariables: temp
const buff = Norma.buffs

const sheet = createBaseSheet(key)

export default sheet
