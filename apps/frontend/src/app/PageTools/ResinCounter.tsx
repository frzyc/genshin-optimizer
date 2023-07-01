import { imgAssets } from '@genshin-optimizer/gi-assets'
import { MINUTE_MS, timeString } from '@genshin-optimizer/util'
import {
  Button,
  ButtonGroup,
  CardContent,
  Divider,
  Grid,
  InputBase,
  Typography,
} from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import CardDark from '../Components/Card/CardDark'
import ImgIcon from '../Components/Image/ImgIcon'
import { DatabaseContext } from '../Database/Database'
import { RESIN_MAX } from '../Database/DataEntries/DisplayTool'

export const RESIN_RECH_MS = 8 * MINUTE_MS

export default function ResinCounter() {
  const { database } = useContext(DatabaseContext)
  const [{ resin, resinDate }, setState] = useState(() =>
    database.displayTool.get()
  )
  useEffect(
    () => database.displayTool.follow((r, s) => setState(s)),
    [database]
  )
  const resinIncrement = useRef(undefined as undefined | NodeJS.Timeout)

  const setResin = (newResin: number) => {
    if (newResin >= RESIN_MAX) {
      resinIncrement.current && clearTimeout(resinIncrement.current)
      resinIncrement.current = undefined
    } else
      resinIncrement.current = setTimeout(
        () => console.log('set resin', newResin + 1),
        RESIN_RECH_MS
      )
    database.displayTool.set({
      resin: newResin,
      resinDate: new Date().getTime(),
    })
  }

  useEffect(() => {
    if (resin < RESIN_MAX) {
      const now = Date.now()
      const resinToMax = RESIN_MAX - resin
      const resinSinceLastDate = Math.min(
        Math.floor((now - resinDate) / RESIN_RECH_MS),
        resinToMax
      )
      const catchUpResin = resin + resinSinceLastDate
      const newDate = resinDate + resinSinceLastDate * RESIN_RECH_MS
      database.displayTool.set({ resin: catchUpResin, resinDate: newDate })
      if (catchUpResin < RESIN_MAX)
        resinIncrement.current = setTimeout(
          () => setResin(catchUpResin + 1),
          now - newDate
        )
    }
    return () => resinIncrement.current && clearTimeout(resinIncrement.current)
    // eslint-disable-next-line
  }, [])

  const nextResinDateNum =
    resin >= RESIN_MAX ? resinDate : resinDate + RESIN_RECH_MS

  const resinFullDateNum =
    resin >= RESIN_MAX
      ? resinDate
      : resinDate + (RESIN_MAX - resin) * RESIN_RECH_MS
  const resinFullDate = new Date(resinFullDateNum)

  const nextDeltaString = timeString(Math.abs(nextResinDateNum - Date.now()))

  return (
    <CardDark>
      <Grid container sx={{ px: 2, py: 1 }} spacing={2}>
        <Grid item>
          <ImgIcon src={imgAssets.resin.fragile} size={2} />
        </Grid>
        <Grid item>
          <Typography variant="h6">Resin Counter</Typography>
        </Grid>
      </Grid>
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item>
            <Typography variant="h2">
              <ImgIcon src={imgAssets.resin.fragile} />
              <InputBase
                type="number"
                sx={{ width: '2em', fontSize: '4rem' }}
                value={resin}
                inputProps={{ min: 0, max: 999, sx: { textAlign: 'right' } }}
                onChange={(e) => setResin(parseInt(e.target.value))}
              />
              <span>/{RESIN_MAX}</span>
            </Typography>
          </Grid>
          <Grid item flexGrow={1}>
            <ButtonGroup fullWidth>
              <Button onClick={() => setResin(0)} disabled={resin === 0}>
                0
              </Button>
              <Button
                onClick={() => setResin(resin - 1)}
                disabled={resin === 0}
              >
                -1
              </Button>
              <Button
                onClick={() => setResin(resin - 20)}
                disabled={resin < 20}
              >
                -20
              </Button>
              <Button
                onClick={() => setResin(resin - 40)}
                disabled={resin < 40}
              >
                -40
              </Button>
              <Button
                onClick={() => setResin(resin - 60)}
                disabled={resin < 60}
              >
                -60
              </Button>
              <Button onClick={() => setResin(resin + 1)}>+1</Button>
              <Button onClick={() => setResin(resin + 60)}>+60</Button>
              <Button
                onClick={() => setResin(RESIN_MAX)}
                disabled={resin === RESIN_MAX}
              >
                MAX {RESIN_MAX}
              </Button>
            </ButtonGroup>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              {resin < RESIN_MAX ? (
                <span>
                  Next resin in {nextDeltaString}, full Resin at{' '}
                  {resinFullDate.toLocaleTimeString()}{' '}
                  {resinFullDate.toLocaleDateString()}
                </span>
              ) : (
                <span>
                  Resin has been full for at least {nextDeltaString}, since{' '}
                  {resinFullDate.toLocaleTimeString()}{' '}
                  {resinFullDate.toLocaleDateString()}
                </span>
              )}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption">
              Because we do not provide a mechanism to synchronize resin time,
              actual resin recharge time might be as much as 8 minutes earlier
              than predicted.
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </CardDark>
  )
}
