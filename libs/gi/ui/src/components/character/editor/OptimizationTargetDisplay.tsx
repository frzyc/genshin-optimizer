import { CardThemed, ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import { objPathValue } from '@genshin-optimizer/common/util'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { resolveInfo, type NodeDisplay } from '@genshin-optimizer/gi/uidata'
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
import { DataContext } from '../../../context'
import { getDisplayHeader } from '../../../util'
export function OptimizationTargetDisplay({
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
  const {
    variant = invalidTarget ? 'secondary' : undefined,
    textSuffix,
    icon: infoIcon,
    name,
  } = (node && resolveInfo(node.info)) ?? {}

  const suffixDisplay = textSuffix && <span> {textSuffix}</span>
  const iconDisplay = icon ? <ImgIcon src={icon} size={2} /> : infoIcon
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
              <SqBadge
                color={variant === 'invalid' ? undefined : variant}
                sx={{ whiteSpace: 'normal' }}
              >
                <strong>{name}</strong>
                {suffixDisplay}
              </SqBadge>
            </Typography>
          </Stack>
        )}
      </CardContent>
    </CardThemed>
  )
}
