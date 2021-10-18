import { Alert, Grid, LinearProgress, styled, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
import { timeStringMs } from '../../Util/TimeUtil';

export const warningBuildNumber = 10000000

const Monospace = styled("strong")({
  fontFamily: "monospace"
})

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
}));
export default function BuildAlert({ totBuildNumber, generatingBuilds, generationSkipped, generationProgress, generationDuration, characterName, maxBuildsToShow }) {
  const totalBuildNumberString = totBuildNumber?.toLocaleString() ?? totBuildNumber
  const totalUnskipped = totBuildNumber - generationSkipped
  const generationProgressString = generationProgress?.toLocaleString() ?? generationProgress
  const generationSkippedString = generationSkipped?.toLocaleString() ?? generationSkipped
  const totalUnskippedString = totalUnskipped?.toLocaleString() ?? totalUnskipped
  const generationSkippedText = !!generationSkipped && <span>(<b>{generationSkippedString}</b> skipped)</span>

  let color = "success" as "success" | "warning" | "error"
  let title = "" as ReactNode
  let subtitle = "" as ReactNode
  let progress = undefined as undefined | number

  if (generatingBuilds) {
    progress = generationProgress * 100 / (totalUnskipped)
    title = <Typography>Generating and testing <Monospace>{generationProgressString}/{totalUnskippedString}</Monospace> build configurations against the criteria for <b>{characterName}</b>. {generationSkippedText}</Typography>
    subtitle = <Typography>Time elapsed: <Monospace>{timeStringMs(generationDuration)}</Monospace></Typography>
  } else if (!generatingBuilds && generationProgress) {//done
    progress = 100
    title = <Typography>Generated and tested <Monospace>{totalUnskippedString}</Monospace> Build configurations against the criteria for <b>{characterName}</b>. {generationSkippedText}</Typography>
    subtitle = <Typography>Total duration: <Monospace>{timeStringMs(generationDuration)}</Monospace></Typography>
  } else {
    if (totBuildNumber === 0) {
      title = <Typography>Current configuration will not generate any builds for <b>{characterName}</b>. Please change your Artifact configurations, or add/include more Artifacts.</Typography>
      color = "error"
    } else if (totBuildNumber > warningBuildNumber) {
      title = <Typography>Current configuration will generate <Monospace>{totalBuildNumberString}</Monospace> potential builds for <b>{characterName}</b>. This might take quite a while to generate...</Typography>
      color = "warning"
    } else
      title = <Typography>Current configuration {totBuildNumber <= maxBuildsToShow ? "generated" : "will generate"} <Monospace>{totalBuildNumberString}</Monospace> builds for <b>{characterName}</b>.</Typography>
  }

  return <Alert severity={color} variant="filled" sx={{
    "& .MuiAlert-message": {
      flexGrow: 1
    }
  }}>
    {title && title}
    {subtitle && subtitle}
    {progress !== undefined && <Grid container spacing={1} alignItems="center">
      <Grid item>
        <Typography>{`${progress.toFixed(1)}%`}</Typography>
      </Grid>
      <Grid item flexGrow={1} >
        <BorderLinearProgress variant="determinate" value={progress} color="primary" />
      </Grid>
    </Grid>}
  </Alert>
}

