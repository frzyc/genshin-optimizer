import { CardThemed } from '@genshin-optimizer/common/ui'
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
import { Box, CardContent, Divider, Stack } from '@mui/material'

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
function StatLine({ read }: { read: Read<Tag> }) {
  const calc = useZzzCalcContext()
  if (!calc) return null
  const computed = calc.compute(read)
  const name = read.tag.name || read.tag.q
  const fText = formulaText(computed)
  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
        <TagDisplay tag={read.tag} />
        {valueString(computed.val, getUnitStr(name ?? ''))}
      </Box>
      <CardThemed bgt="dark">
        <CardContent>
          <Box>name: {fText.name}</Box>
          <Divider />
          <Box>formula: {fText.formula}</Box>
          <CardThemed bgt="normal" sx={{ pl: 1 }}>
            <CardContent>
              deps:
              <Stack spacing={1}>
                {fText.deps.map((dep, i) => (
                  <Box key={i}>
                    <Box>name: {dep.name}</Box>
                    <Divider />
                    <Box>formula: {dep.formula}</Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </CardThemed>
        </CardContent>
      </CardThemed>
    </>
  )
}
