import {
  getUnitStr,
  shouldShowDevComponents,
  valueString,
} from '@genshin-optimizer/common/util'
import type { Read } from '@genshin-optimizer/game-opt/engine'
import { DebugReadContext } from '@genshin-optimizer/game-opt/formula-ui'
import { FormulaHelpIcon } from '@genshin-optimizer/game-opt/sheet-ui'
import type { StatKey } from '@genshin-optimizer/zzz/consts'
import { applyDamageTypeToTag } from '@genshin-optimizer/zzz/db'
import { useCharOpt, useCharacterContext } from '@genshin-optimizer/zzz/db-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { own } from '@genshin-optimizer/zzz/formula'
import {
  TagDisplay,
  useZzzCalcContext,
} from '@genshin-optimizer/zzz/formula-ui'
import {
  StatHighlightContext,
  ZCard,
  getHighlightRGBA,
  isHighlight,
} from '@genshin-optimizer/zzz/ui'
import { Box, CardContent } from '@mui/material'
import { useContext, useMemo } from 'react'
export function CharStatsDisplay() {
  const calc = useZzzCalcContext()
  return (
    <ZCard>
      <CardContent>
        {calc?.listFormulas(own.listing.formulas).map((read, index) => (
          <StatLine key={index} read={read} />
        ))}
      </CardContent>
    </ZCard>
  )
}
/**
 * @deprecated need to be merged with TagFieldDisplay in `libs\game-opt\sheet-ui\src\components\FieldDisplay.tsx`, but need game-opt `formulaText`
 */
function StatLine({ read }: { read: Read<Tag> }) {
  const calc = useZzzCalcContext()
  const { setRead } = useContext(DebugReadContext)

  const character = useCharacterContext()
  const charOpt = useCharOpt(character?.key)

  const emphasize =
    (read.tag.sheet === charOpt?.target?.sheet &&
      read.tag.name === charOpt?.target?.name) ||
    charOpt?.target?.q === read.tag.q
  const tag = useMemo(() => {
    if (
      read.tag.sheet === charOpt?.target?.sheet &&
      read.tag.name === charOpt?.target?.name
    )
      return applyDamageTypeToTag(
        read.tag,
        charOpt?.target?.damageType1,
        charOpt?.target?.damageType2
      )
    return read.tag
  }, [
    read.tag,
    charOpt?.target?.sheet,
    charOpt?.target?.name,
    charOpt?.target?.damageType1,
    charOpt?.target?.damageType2,
  ])
  const newRead = useMemo(
    () => ({
      ...read,
      tag,
    }),
    [tag, read]
  )
  const computed = calc?.compute(newRead)
  const name = tag.name || tag.q

  const { statHighlight, setStatHighlight } = useContext(StatHighlightContext)
  const tagQStatKqy = tag.name
    ? ''
    : tag.attribute
      ? `${tag.attribute}_${tag.q}`
      : tag.q === 'cappedCrit_'
        ? 'crit_'
        : tag.q
  const isHL = tagQStatKqy
    ? isHighlight(statHighlight, tagQStatKqy as StatKey)
    : false

  if (!computed) return null
  const valDisplay = valueString(computed.val, getUnitStr(name ?? ''))
  return (
    <Box
      onMouseEnter={() => tagQStatKqy && setStatHighlight(tagQStatKqy)}
      onMouseLeave={() => setStatHighlight('')}
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        p: 0.5,
        borderRadius: 0.5,
        backgroundColor: emphasize ? 'rgba(0,200,0,0.2)' : undefined,
        position: 'relative',
        '::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: 0.5,
          backgroundColor: getHighlightRGBA(isHL),
          transition: 'background-color 0.3s ease-in-out',
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <TagDisplay tag={tag} />
      </Box>
      {valDisplay}
      <FormulaHelpIcon
        tag={tag}
        onClick={() => {
          shouldShowDevComponents && setRead(newRead)
        }}
      />
    </Box>
  )
}
