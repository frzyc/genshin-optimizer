import { Box, Typography, Skeleton } from '@mui/material'
import { Suspense } from 'react'
import { Help } from '@mui/icons-material'
import type { CalcResult } from '@genshin-optimizer/pando'
import { translate, type CalcMeta } from '@genshin-optimizer/gi-formula'
import BootstrapTooltip from './BootstrapTooltip'

export function NodeFieldDisplay({
  calcResult,
  emphasize,
  component = 'div',
}: {
  calcResult: CalcResult<number, CalcMeta>
  component?: React.ElementType
  emphasize?: boolean
}) {
  const formula = translate(calcResult).formula
  return (
    <Box
      width="100%"
      component={component}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 1,
        boxShadow: emphasize ? '0px 0px 0px 2px red inset' : null,
      }}
    >
      <NodeFieldDisplayText calcResult={calcResult} />
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography noWrap></Typography>
        {/* TODO: Add back */}
        {/* {multiDisplay} */}
        {!!formula && (
          <BootstrapTooltip
            placement="top"
            title={
              <Typography>
                <Suspense
                  fallback={
                    <Skeleton variant="rectangular" width={300} height={30} />
                  }
                >
                  {/* TODO: Add back */}
                  {/* {allAmpReactionKeys.includes(node.info.variant as any) && (
                    <Box sx={{ display: 'inline-flex', gap: 1, mr: 1 }}>
                      <Box>
                        <AmpReactionModeText
                          reaction={node.info.variant as AmpReactionKey}
                          trigger={
                            node.info.subVariant as
                              | 'cryo'
                              | 'pyro'
                              | 'hydro'
                              | undefined
                          }
                        />
                      </Box>
                      <Divider orientation="vertical" flexItem />
                    </Box>
                  )} */}
                  <span>{formula}</span>
                </Suspense>
              </Typography>
            }
          >
            {/* TODO: Add back */}
            <Help
              fontSize="inherit"
              sx={{ cursor: 'help' }}
              // onClick={onClick}
            />
          </BootstrapTooltip>
        )}
      </Box>
    </Box>
  )
}

function NodeFieldDisplayText({
  calcResult,
}: {
  calcResult: CalcResult<number, CalcMeta>
}) {
  return (
    <Typography
      component="div"
      sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
    >
      {translate(calcResult).name}
    </Typography>
  )
}
