import { CardThemed, DropdownButton } from '@genshin-optimizer/common/ui'
import {
  DAY_MS,
  MINUTE_MS,
  SECOND_MS,
  timeString,
} from '@genshin-optimizer/common/util'
import type { TimeZoneKey } from '@genshin-optimizer/gi/db'
import { timeZones } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled'
import { CardContent, Divider, Grid, MenuItem, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'

export function initToolsDisplayTimezone() {
  return { timeZoneKey: Object.keys(timeZones)[0] as TimeZoneKey }
}
export default function TeyvatTime() {
  const database = useDatabase()
  const [{ timeZoneKey }, setState] = useState(() => database.displayTool.get())
  useEffect(
    () => database.displayTool.follow((_r, s) => setState(s)),
    [database]
  )
  const setTimeZoneKey = useCallback(
    (timeZoneKey: TimeZoneKey) => database.displayTool.set({ timeZoneKey }),
    [database]
  )

  const [time, setTime] = useState(
    new Date(Date.now() + timeZones[timeZoneKey])
  )
  //set a timer. timer resets when timezone is changed.
  useEffect(() => {
    const setSecondTimeout = () => {
      setTime(new Date(Date.now() + timeZones[timeZoneKey]))
      return setTimeout(
        () => {
          interval = setSecondTimeout()
        },
        SECOND_MS - (Date.now() % SECOND_MS)
      )
    }
    let interval = setSecondTimeout()
    return () => clearTimeout(interval)
  }, [timeZoneKey])

  let resetTime = new Date(time)
  if (resetTime.getUTCHours() < 4) {
    resetTime.setUTCHours(4, 0, 0, 0)
  } else {
    resetTime = new Date(resetTime.getTime() + DAY_MS)
    resetTime.setUTCHours(4, 0, 0, 0)
  }
  const remaningTimeMs = resetTime.getTime() - time.getTime()
  const remainingResetString = timeString(remaningTimeMs)

  return (
    <CardThemed>
      <CardContent sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <AccessTimeFilledIcon />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Teyvat Time
        </Typography>
        <DropdownButton title={timeZoneKey}>
          {Object.keys(timeZones).map((zoneKey) => (
            <MenuItem
              key={zoneKey}
              selected={timeZoneKey === zoneKey}
              disabled={timeZoneKey === zoneKey}
              onClick={() => setTimeZoneKey(zoneKey)}
            >
              {zoneKey}
            </MenuItem>
          ))}
        </DropdownButton>
      </CardContent>
      <Divider />
      <CardContent>
        <Grid container justifyContent="center" spacing={3}>
          <Grid item sx={{ my: 4 }}>
            <Typography variant="h2">
              {time.toLocaleTimeString([], { timeZone: 'UTC' })}
            </Typography>
          </Grid>
          <Grid
            item
            display="flex"
            flexDirection="column"
            justifyContent="space-around"
          >
            <Typography>
              Server Date: <b>{time.toDateString()}</b>
            </Typography>
            <Typography>
              Time until reset: <b>{remainingResetString}</b>
            </Typography>
            <Typography>
              Resin until reset:{' '}
              <b>{Math.floor(remaningTimeMs / (8 * MINUTE_MS))}</b>
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </CardThemed>
  )
}
