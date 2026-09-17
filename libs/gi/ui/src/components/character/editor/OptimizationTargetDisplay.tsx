import { SqBadge } from '@genshin-optimizer/common/ui'
import { objPathValue } from '@genshin-optimizer/common/util'
import type { CustomMultiTarget } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import { Box, Typography } from '@mui/material'
import { useContext, useMemo } from 'react'
import { DataContext } from '../../../context'
import { getDisplayHeader, resolveInfo } from '../../../util'
export function OptimizationTargetDisplay({
  optimizationTarget,
  customMultiTargets,
}: {
  optimizationTarget: string[]
  customMultiTargets: CustomMultiTarget[]
}) {
  const { data } = useContext(DataContext)
  const database = useDatabase()
  const displayHeader = useMemo(
    () => getDisplayHeader(data, optimizationTarget[0], database),
    [data, optimizationTarget, database]
  )

  const { title, icon, action } = displayHeader ?? {}
  const node: CalcResult | undefined = objPathValue(
    data.getDisplay(),
    optimizationTarget
  ) as any

  const {
    textSuffix,
    icon: infoIcon,
    // Since mtargets are not passed in the character UIData, retrieve the name manually.
    name = optimizationTarget[0] === 'custom'
      ? customMultiTargets[Number.parseInt(optimizationTarget[1] ?? '')]?.name
      : undefined,
  } = (node && resolveInfo(node.info)) ?? {}

  const suffixDisplay = textSuffix && <span> {textSuffix}</span>
  const iconDisplay = icon ? icon : infoIcon
  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {iconDisplay}
        <span>{title}</span>
        {!!action && (
          <SqBadge color="success" sx={{ whiteSpace: 'normal' }}>
            {action}
          </SqBadge>
        )}
      </Box>
      <Typography sx={{ display: 'flex', alignItems: 'center' }}>
        <SqBadge sx={{ whiteSpace: 'normal' }}>
          <strong>{name}</strong>
          {suffixDisplay}
        </SqBadge>
      </Typography>
    </>
  )
}
