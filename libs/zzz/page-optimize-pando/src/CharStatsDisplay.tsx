import {
  BootstrapTooltip,
  CardThemed,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { getUnitStr, valueString } from '@genshin-optimizer/common/util'
import type { Read } from '@genshin-optimizer/game-opt/engine'
import { useCharacterContext, useCharOpt } from '@genshin-optimizer/zzz/db-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { own } from '@genshin-optimizer/zzz/formula'
import {
  formulaText,
  getDmgType,
  TagDisplay,
  useZzzCalcContext,
} from '@genshin-optimizer/zzz/formula-ui'
import { ZCard } from '@genshin-optimizer/zzz/ui'
import HelpIcon from '@mui/icons-material/Help'
import { Box, CardContent, Divider, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
export function CharStatsDisplay() {
  const calc = useZzzCalcContext()
  return (
    <ZCard>
      <CardThemed>
        <CardContent>
          {calc?.listFormulas(own.listing.formulas).map((read, index) => (
            <StatLine key={index} read={read} />
          ))}
        </CardContent>
      </CardThemed>
    </ZCard>
  )
}
/**
 * @deprecated need to be merged with TagFieldDisplay in `libs\game-opt\sheet-ui\src\components\FieldDisplay.tsx`, but need game-opt `formulaText`
 */
function StatLine({ read }: { read: Read<Tag> }) {
  const calc = useZzzCalcContext()

  const character = useCharacterContext()
  const charOpt = useCharOpt(character?.key)

  const computed = calc?.compute(read)
  const name = read.tag.name || read.tag.q
  const fText = computed && formulaText(computed)
  const emphasize =
    read.tag.sheet === charOpt?.targetSheet &&
    read.tag.name === charOpt?.targetName
  const tag = useMemo(() => {
    if (!emphasize || !charOpt?.targetDamageType) return read.tag
    return { ...read.tag, damageType2: charOpt.targetDamageType }
  }, [emphasize, charOpt?.targetDamageType, read.tag])
  if (!computed) return null
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        boxShadow: emphasize ? '0px 0px 0px 2px rgba(0,200,0,0.5)' : undefined,
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <TagDisplay tag={tag} />
      </Box>
      {valueString(computed.val, getUnitStr(name ?? ''))}
      <BootstrapTooltip
        title={
          <Typography component="div">
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TagDisplay tag={tag} />
              {/* Show DMG type */}
              {getDmgType(tag).map((dmgType) => (
                <SqBadge key={dmgType}>{dmgType}</SqBadge>
              ))}
              {/* Show Attribute */}
              {tag.attribute && (
                <SqBadge color={tag.attribute}>{tag.attribute}</SqBadge>
              )}
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
