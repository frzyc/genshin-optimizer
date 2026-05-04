import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Cissia } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet } from '../sheetUtil'

const key: CharacterKey = 'Cissia'
// TODO: Cleanup
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const [, ch] = trans('char', key)
// TODO: Cleanup
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cond = Cissia.conditionals
// TODO: Cleanup
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const buff = Cissia.buffs

const sheet = createBaseSheet(key)

export default sheet
