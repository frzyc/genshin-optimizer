import type { CharacterKey } from "@genshin-optimizer/sr-consts";
import { allCharacterKeys } from "@genshin-optimizer/sr-consts";
import { srCalculatorWithEntries } from "@genshin-optimizer/sr-formula";
import { constant, read } from "@genshin-optimizer/waverider";
import { Box, Card, CardContent, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { Container } from "@mui/system";
import React, { useMemo, useState } from "react";

export default function Character() {
  const [charKey, setcharKey] = useState<CharacterKey>("March7th")
  const [level, setlevel] = useState(1)
  const [ascension, setAsc] = useState(0)
  // const

  const calc = useMemo(() =>
    srCalculatorWithEntries([
      { tag: { src: charKey, q: "lvl" }, value: constant(level) },
      { tag: { src: charKey, q: "ascension" }, value: constant(ascension) }
    ])
    , [charKey, level, ascension])

  return <Container>
    <Card sx={theme => ({ backgroundColor: theme.palette.contentDark.main })}>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            {charKey}
          </Box>
          <Select
            label="Character Key"
            value={charKey}
            onChange={e => setcharKey(e.target.value as CharacterKey)}
          >
            {allCharacterKeys.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
          <TextField type="number" label="Level" variant="outlined" inputProps={{ min: 1, max: 90 }} value={level} onChange={(e) => setlevel(parseInt(e.target.value))} />
          <TextField type="number" label="Ascension" variant="outlined" inputProps={{ min: 0, max: 6 }} value={ascension} onChange={(e) => setAsc(parseInt(e.target.value))} />
          {([["ATK", "atk"], ["DEF", "def"], ["HP", "hp"], ["SPD", "spd"]] as const).map(([txt, skey]) => <Typography>
            {txt}: {calc.compute(read({ src: charKey, qt: "base", q: skey }, undefined)).val}
          </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  </Container>
}
