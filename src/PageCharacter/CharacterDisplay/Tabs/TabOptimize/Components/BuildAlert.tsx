import { Alert, Grid, LinearProgress, styled, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { timeStringMs } from '../../../../../Util/TimeUtil';

export const warningBuildNumber = 10000000
export type BuildStatus = {
  type: "active" | "inactive"
  tested: number      // tested, including `failed`
  failed: number      // tested but fail the filter criteria, e.g., not enough EM
  skipped: number
  total: number
  startTime?: number
  finishTime?: number
}

const Monospace = styled("strong")({
  fontFamily: "monospace"
})

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
}));
export default function BuildAlert({ status: { type, tested, failed, skipped, total, startTime, finishTime }, characterName }: { status: BuildStatus, characterName: Displayable }) {
  const hasTotal = isFinite(total)

  const generatingBuilds = type !== "inactive"
  const unskipped = total - skipped

  const testedString = <Monospace>{tested.toLocaleString()}</Monospace>
  const unskippedString = <Monospace>{unskipped.toLocaleString()}</Monospace>
  const skippedText = !!skipped && <span>(<b>{<Monospace>{skipped.toLocaleString()}</Monospace>}</b> skipped)</span>

  const durationString = <Monospace>{timeStringMs(Math.round((finishTime ?? performance.now()) - (startTime ?? NaN)))}</Monospace>

  let color = "success" as "success" | "warning" | "error"
  let title = "" as ReactNode
  let subtitle = "" as ReactNode
  let progress = undefined as undefined | number

  if (generatingBuilds) {
    progress = tested * 100 / (unskipped)
    title = <Typography>Generating and testing {testedString}{hasTotal ? <>/{unskippedString}</> : undefined} build configurations against the criteria for <b>{characterName}</b>. {skippedText}</Typography>
    subtitle = <Typography>Time elapsed: {durationString}</Typography>
  } else if (tested + skipped) {
    progress = 100
    title = <Typography>Generated and tested {testedString} Build configurations against the criteria for <b>{characterName}</b>. {skippedText}</Typography>
    subtitle = <Typography>Total duration: {durationString}</Typography>
  } else {
    return null
  }

  return <Alert severity={color} variant="filled" sx={{
    "& .MuiAlert-message": {
      flexGrow: 1
    }
  }}>
    {title}
    {subtitle}
    {progress !== undefined && <Grid container spacing={1} alignItems="center">
      {hasTotal && <Grid item>
        <Typography>{`${progress.toFixed(1)}%`}</Typography>
      </Grid>}
      <Grid item flexGrow={1} >
        <BorderLinearProgress variant={hasTotal ? "determinate" : "indeterminate"} value={progress} color="primary" />
      </Grid>
    </Grid>}
  </Alert>
}
