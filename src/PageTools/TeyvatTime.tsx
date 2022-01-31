
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CardContent, Divider, Grid, MenuItem, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import CardDark from '../Components/Card/CardDark';
import DropdownButton from '../Components/DropdownMenu/DropdownButton';
import { dbStorage } from '../Database/DBStorage';
import { DAY_MS, HOUR_MS, MINUTE_MS, SECOND_MS, timeString } from '../Util/TimeUtil';

const timeZones = {
  "America": - 5 * HOUR_MS,
  "Europe": HOUR_MS,
  "Asia": 8 * HOUR_MS,
  "TW, HK, MO": 8 * HOUR_MS,
}
export default function TeyvatTime(props) {
  let [timeZoneKey, setTimeZoneKey] = useState(Object.keys(timeZones)[0])
  let [time, setTime] = useState(new Date(Date.now() + timeZones[timeZoneKey]))
  //load from localstorage
  useEffect(() => setTimeZoneKey(dbStorage.get("server_timezone") || Object.keys(timeZones)[0]), [])
  //set a timer. timer resets when timezone is changed.
  useEffect(() => {
    let setSecondTimeout = () => {
      setTime(new Date(Date.now() + timeZones[timeZoneKey]))
      return setTimeout(() => {
        interval = setSecondTimeout()
      }, SECOND_MS - (Date.now() % SECOND_MS));
    }
    let interval = setSecondTimeout()
    dbStorage.set("server_timezone", timeZoneKey)
    return () => clearTimeout(interval)
  }, [timeZoneKey])

  let resetTime = new Date(time)
  if (resetTime.getUTCHours() < 4) {
    resetTime.setUTCHours(4, 0, 0, 0)
  } else {
    resetTime = new Date(resetTime.getTime() + DAY_MS)
    resetTime.setUTCHours(4, 0, 0, 0)
  }
  let remaningTimeMs = resetTime.getTime() - time.getTime()
  let remainingResetString = timeString(remaningTimeMs)

  return <CardDark>
    <Grid container sx={{ px: 2, py: 1 }} spacing={2}>
      <Grid item>
        <Typography variant="h6"><FontAwesomeIcon icon={faClock} className="fa-fw" /></Typography>
      </Grid>
      <Grid item flexGrow={1}>
        <Typography variant="h6">Teyvat Time</Typography>
      </Grid>
      <Grid item>
        <DropdownButton title={timeZoneKey}>
          {Object.keys(timeZones).map(zoneKey =>
            <MenuItem key={zoneKey} selected={timeZoneKey === zoneKey} disabled={timeZoneKey === zoneKey} onClick={() => setTimeZoneKey(zoneKey)} >{zoneKey}</MenuItem>)}
        </DropdownButton>
      </Grid>
    </Grid>
    <Divider />
    <CardContent>
      <Grid container justifyContent="center" spacing={3}>
        <Grid item sx={{ my: 4 }}>
          <Typography variant="h2">
            {time.toLocaleTimeString([], { timeZone: "UTC" })}
          </Typography>
        </Grid>
        <Grid item display="flex" flexDirection="column" justifyContent="space-around">
          <Typography>Server Date: <b>{time.toDateString()}</b></Typography>
          <Typography>Time until reset: <b>{remainingResetString}</b></Typography>
          <Typography>Resin until reset: <b>{Math.floor(remaningTimeMs / (8 * MINUTE_MS))}</b></Typography>
        </Grid>
      </Grid>
    </CardContent>
  </CardDark>
}