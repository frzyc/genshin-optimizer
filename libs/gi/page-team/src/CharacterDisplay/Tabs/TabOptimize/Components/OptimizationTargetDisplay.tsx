import { SqBadge } from '@genshin-optimizer/common/ui'
import { objPathValue } from '@genshin-optimizer/common/util'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import {
  DataContext,
  getDisplayHeader,
  resolveInfo,
} from '@genshin-optimizer/gi/ui'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import { Box, Divider, Stack, useMediaQuery, useTheme } from '@mui/material'
import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function OptimizationTargetDisplay({
  optimizationTarget,
  defaultText,
}: {
  optimizationTarget?: string[]
  showEmptyTargets?: boolean
  defaultText?: string
}) {
  const { t } = useTranslation('page_character_optimize')

  const { data } = useContext(DataContext)
  const database = useDatabase()
  const displayHeader = useMemo(
    () =>
      optimizationTarget &&
      getDisplayHeader(data, optimizationTarget[0], database),
    [data, optimizationTarget, database],
  )

  if (!defaultText) defaultText = t('targetSelector.selectOptTarget')

  const { title, icon, action } = displayHeader ?? {}
  const node: CalcResult | undefined =
    optimizationTarget &&
    (objPathValue(data.getDisplay(), optimizationTarget) as any)

  const invalidTarget = !optimizationTarget || !displayHeader || !node

  const {
    name,
    textSuffix,
    icon: nodeIcon,
    variant = invalidTarget ? 'secondary' : undefined,
  } = (node?.info && resolveInfo(node?.info)) ?? {}

  const suffixDisplay = textSuffix && <span> {textSuffix}</span>
  const iconDisplay = icon ? icon : nodeIcon

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return invalidTarget ? (
    <strong>{defaultText}</strong>
  ) : (
    <Stack
      direction="row"
      divider={<Divider orientation="vertical" flexItem />}
      spacing={0.5}
    >
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {iconDisplay}
        {!isMobile && <span>{title}</span>}
        {!!action && (
          <SqBadge color="success" sx={{ whiteSpace: 'normal' }}>
            {action}
          </SqBadge>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <SqBadge
          color={variant === 'invalid' ? undefined : variant}
          sx={{ whiteSpace: 'normal' }}
        >
          <strong>{name}</strong>
          {suffixDisplay}
        </SqBadge>
      </Box>
    </Stack>
  )
}
