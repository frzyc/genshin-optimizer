import { timeStringMs } from '@genshin-optimizer/common/util'
import { Alert, Grid, LinearProgress, Typography, styled } from '@mui/material'
import { type ReactNode, useSyncExternalStore } from 'react'

export const warningBuildNumber = 10000000
export type BuildStatus = {
  type: 'active' | 'inactive'
  tested: number // tested, including `failed`
  failed: number // tested but fail the filter criteria, e.g., not enough EM
  skipped: number
  total: number
  testedPerSecond: number // number of configs tested in the last second (none are skipped)
  skippedPerSecond: number // number of configs skipped in the last second (none are tested)
  startTime?: number
  finishTime?: number
  changed: boolean
  cb?: () => void
}

const Monospace = styled('strong')({
  fontFamily: 'monospace',
})

const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: 10,
  borderRadius: 5,
}))

function useBuildStatus(buildStatus: BuildStatus): BuildStatus {
  let last = { ...buildStatus }
  return useSyncExternalStore(
    (cb) => {
      buildStatus.cb = cb
      return () => {}
    },
    () => {
      if (buildStatus.changed) {
        buildStatus.changed = false
        last = { ...buildStatus }
      }
      return last
    }
  )
}

export default function BuildAlert({
  buildStatus,
  characterName,
}: {
  buildStatus: BuildStatus
  characterName: ReactNode
}) {
  const status = useBuildStatus(buildStatus)
  const {
    type,
    tested,
    skipped,
    total,
    testedPerSecond,
    skippedPerSecond,
    startTime,
    finishTime,
  } = status
  const hasTotal = isFinite(total)

  const generatingBuilds = type !== 'inactive'
  const unskipped = total - skipped

  const testedString = <Monospace>{tested.toLocaleString()}</Monospace>
  const unskippedString = <Monospace>{unskipped.toLocaleString()}</Monospace>
  const skippedText = !!skipped && (
    <span>
      (<b>{<Monospace>{skipped.toLocaleString()}</Monospace>}</b> skipped)
    </span>
  )

  const durationString = (
    <Monospace>
      {timeStringMs(
        Math.round((finishTime ?? performance.now()) - (startTime ?? NaN))
      )}
    </Monospace>
  )

  const avgTestedPerSecond =
    (tested / ((finishTime ?? 1) - (startTime ?? 0))) * 1000
  const avgSkippedPerSecond =
    (skipped / ((finishTime ?? 1) - (startTime ?? 0))) * 1000
  const avgTestedPerSecondString = (
    <Monospace>
      {parseFloat(avgTestedPerSecond.toFixed(1)).toLocaleString()}
    </Monospace>
  )
  const avgSkippedPerSecondString = (
    <Monospace>
      {parseFloat(avgSkippedPerSecond.toFixed(1)).toLocaleString()}
    </Monospace>
  )
  const testedPerSecondString = (
    <Monospace>
      {parseFloat(testedPerSecond.toFixed(1)).toLocaleString()}
    </Monospace>
  )
  const skippedPerSecondString = (
    <Monospace>
      {parseFloat(skippedPerSecond.toFixed(1)).toLocaleString()}
    </Monospace>
  )

  const color = 'success' as 'success' | 'warning' | 'error'
  let title = '' as ReactNode
  let subtitle = '' as ReactNode
  let progress = undefined as undefined | number

  if (generatingBuilds) {
    progress = ((tested + skipped) / total) * 100
    title = (
      <Typography>
        Generating and testing {testedString}
        {hasTotal ? <>/{unskippedString}</> : undefined} build configurations
        against the criteria for <b>{characterName}</b>. {skippedText}
      </Typography>
    )
    subtitle = (
      <Typography>
        Time elapsed: {durationString} | {testedPerSecondString} builds tested
        (+{skippedPerSecondString} skipped) per second
      </Typography>
    )
  } else if (tested + skipped) {
    progress = 100
    title = (
      <Typography>
        Generated and tested {testedString} Build configurations against the
        criteria for <b>{characterName}</b>. {skippedText}
      </Typography>
    )
    subtitle = (
      <Typography>
        Total duration: {durationString} | Average {avgTestedPerSecondString}{' '}
        builds tested (+{avgSkippedPerSecondString} skipped) per second
      </Typography>
    )
  } else {
    return null
  }

  return (
    <Alert
      severity={color}
      variant="filled"
      sx={{
        '& .MuiAlert-message': {
          flexGrow: 1,
        },
      }}
    >
      {title}
      {subtitle}
      {progress !== undefined && (
        <Grid container spacing={1} alignItems="center">
          {hasTotal && (
            <Grid item>
              <Typography>{`${progress.toFixed(1)}%`}</Typography>
            </Grid>
          )}
          <Grid item flexGrow={1}>
            <BorderLinearProgress
              variant={hasTotal ? 'determinate' : 'indeterminate'}
              value={progress}
              color="primary"
            />
          </Grid>
        </Grid>
      )}
    </Alert>
  )
}
