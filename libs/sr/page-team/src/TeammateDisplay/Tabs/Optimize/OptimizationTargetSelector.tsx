import {
  ColorText,
  DropdownButton,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import type { Read } from '@genshin-optimizer/sr/formula'
import { own } from '@genshin-optimizer/sr/formula'
import {
  getDmgType,
  getVariant,
  tagFieldMap,
  useSrCalcContext,
} from '@genshin-optimizer/sr/formula-ui'
import { Box, ListItemText, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function OptimizationTargetSelector({
  optTarget,
  setOptTarget,
}: {
  optTarget: Read | undefined
  setOptTarget: (o: Read) => void
}) {
  const { t } = useTranslation('optimize')
  const calc = useSrCalcContext()
  return (
    <DropdownButton
      title={`${t('optTarget')}${
        optTarget ? `: ${optTarget.tag.name || optTarget.tag.q}` : ''
      }`}
    >
      {calc?.listFormulas(own.listing.formulas).map((read, index) => (
        <MenuItem
          key={`${index}_${read.tag.name || read.tag.q}`}
          onClick={() => setOptTarget(read)}
        >
          <ListItemText>
            <ColorText color={getVariant(read.tag)}>
              {tagFieldMap.subset(read.tag)[0]?.title ||
                read.tag.name ||
                read.tag.q}
            </ColorText>
          </ListItemText>
          {/* Show DMG type */}
          <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
            {getDmgType(read.tag).map((dmgType) => (
              <SqBadge>{dmgType}</SqBadge>
            ))}
          </Box>
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
