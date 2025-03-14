import { BootstrapTooltip, CardThemed } from '@genshin-optimizer/common/ui'
import { getUnitStr, valueString } from '@genshin-optimizer/common/util'
import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { own } from '@genshin-optimizer/zzz/formula'
import {
  formulaText,
  TagDisplay,
  useZzzCalcContext,
} from '@genshin-optimizer/zzz/formula-ui'
import { ZCard } from '@genshin-optimizer/zzz/ui'
import HelpIcon from '@mui/icons-material/Help'
import { Box, CardContent, Divider, Stack, Typography } from '@mui/material'
export function CharStatsDisplay() {
  const calc = useZzzCalcContext()
  return (
    <ZCard>
      <CardThemed>
        <CardContent>
          {calc
            ?.listFormulas(own.listing.formulas)
            .map((read, index) => <StatLine key={index} read={read} />)}
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
  if (!calc) return null
  const computed = calc.compute(read)
  const name = read.tag.name || read.tag.q
  const fText = formulaText(computed)
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Box sx={{ flexGrow: 1 }}>
        <TagDisplay tag={read.tag} />
      </Box>
      {valueString(computed.val, getUnitStr(name ?? ''))}
      <BootstrapTooltip
        title={
          <Typography component="div">
            <Box>
              <TagDisplay tag={read.tag} />
            </Box>
            <Divider />
            <Box>{fText.formula}</Box>

            <Stack spacing={1} sx={{ pl: 1, pt: 1 }}>
              {fText.deps.map((dep, i) => (
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
