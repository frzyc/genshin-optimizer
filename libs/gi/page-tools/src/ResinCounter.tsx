import { CardThemed, ImgIcon } from '@genshin-optimizer/common/ui'
import { timeString } from '@genshin-optimizer/common/util'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import { RESIN_RECH_MS } from '@genshin-optimizer/gi/consts'
import { RESIN_MAX } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import {
  Button,
  ButtonGroup,
  CardContent,
  Divider,
  Grid,
  InputBase,
  Typography,
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'

const RESIN_COUNTER_VALUES = [0, -1, -10, -20, -30, -40, -60, 1, 60, RESIN_MAX]

export default function ResinCounter() {
  const database = useDatabase()
  const [{ resin, resinDate }, setState] = useState(() =>
    database.displayTool.get()
  )
  useEffect(
    () => database.displayTool.follow((_r, s) => setState(s)),
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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
  }, [])

  const nextResinDateNum =
    resin >= RESIN_MAX ? resinDate : resinDate + RESIN_RECH_MS

  const resinFullDateNum =
    resin >= RESIN_MAX
      ? resinDate
      : resinDate + (RESIN_MAX - resin) * RESIN_RECH_MS
  const resinFullDate = new Date(resinFullDateNum)

  const nextDeltaString = timeString(Math.abs(nextResinDateNum - Date.now()))

  const handleResinChange = (val: string) => {
    const MAX_ORIGINAL_RESIN = 2000
    const newResin = Number.parseInt(val)
    if (newResin >= 0 && newResin <= MAX_ORIGINAL_RESIN) {
      setResin(newResin)
    }
  }

  return (
    <CardThemed>
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
                sx={{ width: '2.5em', fontSize: '4rem' }}
                value={resin}
                inputProps={{ min: 0, max: 999, sx: { textAlign: 'right' } }}
                onChange={(e) => handleResinChange(e.target.value)}
              />
              <span>/{RESIN_MAX}</span>
            </Typography>
          </Grid>
          <Grid item flexGrow={1}>
            <ButtonGroup fullWidth>
              {RESIN_COUNTER_VALUES.map((rcv) => {
                if (rcv === 0) {
                  return (
                    <Button
                      key={rcv}
                      onClick={() => setResin(rcv)}
                      disabled={resin === 0}
                    >
                      {rcv}
                    </Button>
                  )
                }
                if (rcv === RESIN_MAX) {
                  return (
                    <Button
                      key={rcv}
                      onClick={() => setResin(RESIN_MAX)}
                      disabled={resin >= RESIN_MAX}
                    >
                      MAX {rcv}
                    </Button>
                  )
                }
                if (rcv > 0) {
                  return (
                    <Button
                      key={rcv}
                      onClick={() => setResin(resin + rcv)}
                      disabled={resin >= RESIN_MAX}
                    >
                      +{rcv}
                    </Button>
                  )
                }

                return (
                  <Button
                    key={rcv}
                    onClick={() => setResin(resin + rcv)}
                    disabled={resin < Math.abs(rcv)}
                  >
                    {rcv}
                  </Button>
                )
              })}
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
    </CardThemed>
  )
}
