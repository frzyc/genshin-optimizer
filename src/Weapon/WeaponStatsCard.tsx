import { CardContent, Typography } from "@mui/material"
import React from "react"
import CardDark from "../Components/Card/CardDark"
import FieldDisplay, { FieldDisplayList } from "../Components/FieldDisplay"
import { ICalculatedStats } from "../Types/stats"
import statsToFields from "../Util/FieldUtil"
export default function WeaponStatsCard({ title, statsVals = {}, stats }: { title: Displayable, statsVals?: object, stats: ICalculatedStats }) {
  if ((Object.keys(statsVals) as string[]).filter(s => s !== "modifiers").length === 0) return null
  const fields = statsToFields(statsVals, stats)
  return <CardDark sx={{ mb: 1 }}>
    <CardContent>
      <Typography>{title}</Typography>
    </CardContent>
    <FieldDisplayList>
      {fields.map((field, i) => <FieldDisplay key={i} field={field} />)}
    </FieldDisplayList>
  </CardDark>
}