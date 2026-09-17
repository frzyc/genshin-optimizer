import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Cissia } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet } from '../sheetUtil'

const key: CharacterKey = 'Cissia'
// TODO: Cleanup
// biome-ignore lint/suspicious/noTsIgnore: temp
//@ts-ignore
// biome-ignore lint/correctness/noUnusedVariables: temp
const [, ch] = trans('char', key)
// TODO: Cleanup
// biome-ignore lint/suspicious/noTsIgnore: temp
//@ts-ignore
// biome-ignore lint/correctness/noUnusedVariables: temp
const cond = Cissia.conditionals
// TODO: Cleanup
// biome-ignore lint/suspicious/noTsIgnore: temp
//@ts-ignore
// biome-ignore lint/correctness/noUnusedVariables: temp
const buff = Cissia.buffs

const sheet = createBaseSheet(key)

export default sheet
