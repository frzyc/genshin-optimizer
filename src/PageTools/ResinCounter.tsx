import { Button, ButtonGroup, CardContent, Divider, Grid, InputBase, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import Assets from '../Assets/Assets';
import CardDark from '../Components/Card/CardDark';
import ImgIcon from '../Components/Image/ImgIcon';
import useDBState from '../ReactHooks/useDBState';
import { MINUTE_MS, timeString } from '../Util/TimeUtil';

export const RESIN_MAX = 160
export const RESIN_RECH_MS = 8 * MINUTE_MS
export function initToolsDisplayResin() {
  return {
    resin: RESIN_MAX,
    date: new Date().getTime()
  }
}

export default function ResinCounter() {
  const [{ resin, date }, setResinState] = useDBState("ToolsDisplayResin", initToolsDisplayResin)
  const resinIncrement = useRef(undefined as undefined | NodeJS.Timeout)

  const setResin = (newResin: number) => {
    if (newResin >= RESIN_MAX) {
      resinIncrement.current && clearTimeout(resinIncrement.current)
      resinIncrement.current = undefined
    } else
      resinIncrement.current = setTimeout(() => console.log("set resin", newResin + 1), RESIN_RECH_MS);
    setResinState({ resin: newResin, date: new Date().getTime() })
  }

  useEffect(() => {
    if (resin < RESIN_MAX) {
      const now = Date.now()
      const resinToMax = RESIN_MAX - resin
      const resinSinceLastDate = Math.min(Math.floor((now - date) / (RESIN_RECH_MS)), resinToMax)
      const catchUpResin = resin + resinSinceLastDate
      const newDate = date + resinSinceLastDate * RESIN_RECH_MS
      setResinState({ resin: catchUpResin, date: newDate })
      if (catchUpResin < RESIN_MAX)
        resinIncrement.current = setTimeout(() => setResin(catchUpResin + 1), now - newDate);
    }
    return () => resinIncrement.current && clearTimeout(resinIncrement.current)
    // eslint-disable-next-line
  }, [])

  const nextResinDateNum = resin >= RESIN_MAX ? date : date + RESIN_RECH_MS;

  const resinFullDateNum = resin >= RESIN_MAX ? date : (date + (RESIN_MAX - resin) * RESIN_RECH_MS)
  const resinFullDate = new Date(resinFullDateNum)

  const nextDeltaString = timeString(Math.abs(nextResinDateNum - Date.now()))

  return <CardDark>
    <Grid container sx={{ px: 2, py: 1 }} spacing={2} >
      <Grid item>
        <ImgIcon src={Assets.resin.fragile} sx={{ fontSize: "2em" }} />
      </Grid>
      <Grid item >
        <Typography variant="h6">Resin Counter</Typography>
      </Grid>
    </Grid>
    <Divider />
    <CardContent>
      <Grid container spacing={2}>
        <Grid item>
          <Typography variant="h2">
            <ImgIcon src={Assets.resin.fragile} />
            <InputBase type="number" sx={{ width: "2em", fontSize: "4rem" }} value={resin} inputProps={{ min: 0, max: 999, sx: { textAlign: "right" } }} onChange={(e => setResin(parseInt(e.target.value)))} />
            <span>/{RESIN_MAX}</span>
          </Typography>
        </Grid>
        <Grid item flexGrow={1}>
          <ButtonGroup fullWidth >
            <Button onClick={() => setResin(0)} disabled={resin === 0}>0</Button>
            <Button onClick={() => setResin(resin - 1)} disabled={resin === 0}>-1</Button>
            <Button onClick={() => setResin(resin - 20)} disabled={resin < 20}>-20</Button>
            <Button onClick={() => setResin(resin - 40)} disabled={resin < 40}>-40</Button>
            <Button onClick={() => setResin(resin - 60)} disabled={resin < 60}>-60</Button>
            <Button onClick={() => setResin(resin + 1)}>+1</Button>
            <Button onClick={() => setResin(resin + 60)}>+60</Button>
            <Button onClick={() => setResin(RESIN_MAX)} disabled={resin === RESIN_MAX}>MAX {RESIN_MAX}</Button>
          </ButtonGroup>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            {resin < RESIN_MAX ? <span>Next resin in {nextDeltaString}, full Resin at {resinFullDate.toLocaleTimeString()} {resinFullDate.toLocaleDateString()}</span> :
              <span>Resin has been full for at least {nextDeltaString}, since {resinFullDate.toLocaleTimeString()} {resinFullDate.toLocaleDateString()}</span>}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption">Because we do not provide a mechanism to synchronize resin time, actual resin recharge time might be as much as 8 minutes earlier than predicted.</Typography>
        </Grid>
      </Grid>
    </CardContent>
  </CardDark>
}
