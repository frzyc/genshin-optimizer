import { BootstrapTooltip } from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  shouldShowDevComponents,
  valueString,
} from '@genshin-optimizer/common/util'
import type { Read } from '@genshin-optimizer/game-opt/engine'
import { DebugReadContext } from '@genshin-optimizer/game-opt/formula-ui'
import { applyDamageTypeToTag } from '@genshin-optimizer/zzz/db'
import { useCharOpt, useCharacterContext } from '@genshin-optimizer/zzz/db-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { own } from '@genshin-optimizer/zzz/formula'
import {
  FullTagDisplay,
  TagDisplay,
  formulaText,
  useZzzCalcContext,
} from '@genshin-optimizer/zzz/formula-ui'
import { ZCard } from '@genshin-optimizer/zzz/ui'
import HelpIcon from '@mui/icons-material/Help'
import { Box, CardContent, Divider, Stack, Typography } from '@mui/material'
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
  const fText = computed && formulaText(computed)

  if (!computed) return null
  const valDisplay = valueString(computed.val, getUnitStr(name ?? ''))
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        p: 0.5,
        borderRadius: 0.5,
        backgroundColor: emphasize ? 'rgba(0,200,0,0.2)' : undefined,
      }}
      onClick={() => {
        shouldShowDevComponents && setRead(newRead)
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <TagDisplay tag={tag} />
      </Box>
      {valDisplay}
      <BootstrapTooltip
        title={
          <Typography component="div">
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FullTagDisplay tag={tag} />
              <span>{valDisplay}</span>
            </Box>
            <Divider />
            <Box>{fText?.formula}</Box>

            <Stack spacing={1} sx={{ pl: 1, pt: 1 }}>
              {fText?.deps.map((dep, i) => (
                <Box key={i}>
                  <Box>{dep.name}</Box>
                  <Divider />
                  <Box> {dep.formula}</Box>
                </Box>
              ))}
            </Stack>
          </Typography>
        }
      >
        <HelpIcon />
      </BootstrapTooltip>
    </Box>
  )
}
