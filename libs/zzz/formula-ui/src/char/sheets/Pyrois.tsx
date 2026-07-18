import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Pyrois } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet } from '../sheetUtil'

const key: CharacterKey = 'Pyrois'
// TODO: Cleanup
// biome-ignore lint/suspicious/noTsIgnore: temp
//@ts-ignore
// biome-ignore lint/correctness/noUnusedVariables: temp
const [, ch] = trans('char', key)
// TODO: Cleanup
// biome-ignore lint/suspicious/noTsIgnore: temp
//@ts-ignore
// biome-ignore lint/correctness/noUnusedVariables: temp
const cond = Pyrois.conditionals
// TODO: Cleanup
// biome-ignore lint/suspicious/noTsIgnore: temp
//@ts-ignore
// biome-ignore lint/correctness/noUnusedVariables: temp
const buff = Pyrois.buffs

const sheet = createBaseSheet(key)

export default sheet
