import { CardThemed, SqBadge } from '@genshin-optimizer/common/ui'
import { objPathValue } from '@genshin-optimizer/common/util'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import TrackChangesIcon from '@mui/icons-material/TrackChanges'
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataContext } from '../../../Context/DataContext'
import { getDisplayHeader } from '../../../Formula/DisplayUtil'
import type { NodeDisplay } from '../../../Formula/uiData'
import ImgIcon from '../../Image/ImgIcon'
export default function OptimizationTargetDisplay({
  optimizationTarget,
  showEmptyTargets = false,
}: {
  optimizationTarget?: string[]
  showEmptyTargets?: boolean
}) {
  const { t } = useTranslation('page_character_optimize')

  const { data } = useContext(DataContext)
  const database = useDatabase()
  const displayHeader = useMemo(
    () =>
      optimizationTarget &&
      getDisplayHeader(data, optimizationTarget[0], database),
    [data, optimizationTarget, database]
  )

  const defaultText = t('targetSelector.selectOptTarget')

  const { title, icon, action } = displayHeader ?? {}
  const node: NodeDisplay | undefined =
    optimizationTarget &&
    (objPathValue(data.getDisplay(), optimizationTarget) as any)

  const invalidTarget =
    !optimizationTarget ||
    !displayHeader ||
    !node ||
    // Make sure the opt target is valid, if we are not in multi-target
    (!showEmptyTargets && node.isEmpty)

  const prevariant = invalidTarget ? 'secondary' : node.info.variant
  const variant = prevariant === 'invalid' ? undefined : prevariant

  const { textSuffix } = node?.info ?? {}
  const suffixDisplay = textSuffix && <span> {textSuffix}</span>
  const iconDisplay = icon ? <ImgIcon src={icon} size={2} /> : node?.info.icon
  return (
    <CardThemed bgt="light">
      <CardHeader
        title={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TrackChangesIcon />
            <span>Optimization Target</span>
          </Box>
        }
      />
      <Divider />
      <CardContent>
        {invalidTarget ? (
          <strong>{defaultText}</strong>
        ) : (
          <Stack
            // direction="row"
            divider={<Divider orientation="vertical" flexItem />}
            spacing={1}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {iconDisplay}
              <span>{title}</span>
              {!!action && (
                <SqBadge color="success" sx={{ whiteSpace: 'normal' }}>
                  {action}
                </SqBadge>
              )}
            </Box>
            <Typography
              variant="h6"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <SqBadge color={variant} sx={{ whiteSpace: 'normal' }}>
                <strong>{node.info.name}</strong>
                {suffixDisplay}
              </SqBadge>
            </Typography>
          </Stack>
        )}
      </CardContent>
    </CardThemed>
  )
}
