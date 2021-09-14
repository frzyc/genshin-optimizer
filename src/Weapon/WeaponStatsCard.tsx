import React from "react"
import { Card, ListGroup } from "react-bootstrap"
import FieldDisplay from "../Components/FieldDisplay"
import { ICalculatedStats } from "../Types/stats"
import statsToFields from "../Util/FieldUtil"
export default function WeaponStatsCard({ title, statsVals = {}, stats }: { title: Displayable, statsVals?: object, stats: ICalculatedStats }) {
  if ((Object.keys(statsVals ?? {}) as any).length === 0) return null
  const fields = statsToFields(statsVals, stats)
  return <Card bg="darkcontent" text={"lightfont" as any} className="mb-2">
    <Card.Header className="py-2 px-3">{title}</Card.Header>
    <ListGroup className="text-white" variant="flush">
      {fields.map((field, i) => <FieldDisplay key={i} index={i} field={field} className="px-3 py-2" />)}
    </ListGroup>
  </Card>
}