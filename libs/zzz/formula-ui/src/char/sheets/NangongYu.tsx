import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { NangongYu } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet } from '../sheetUtil'

const key: CharacterKey = 'NangongYu'
// TODO: Cleanup
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const [, ch] = trans('char', key)
// TODO: Cleanup
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cond = NangongYu.conditionals
// TODO: Cleanup
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const buff = NangongYu.buffs

const sheet = createBaseSheet(key)

export default sheet
