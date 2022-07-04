import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, CardContent, Divider, Grid, Typography } from "@mui/material";
import React, { useContext, useState } from "react";
import { CharacterContext } from "../../../../CharacterContext";
import CardLight from "../../../../Components/Card/CardLight";
import ColorText from "../../../../Components/ColoredText";
import { NodeFieldDisplay } from "../../../../Components/FieldDisplay";
import StatIcon from "../../../../Components/StatIcon";
import StatInput from "../../../../Components/StatInput";
import { DataContext } from "../../../../DataContext";
import { uiInput as input } from "../../../../Formula";
import { ReadNode } from "../../../../Formula/type";
import KeyMap, { valueString } from "../../../../KeyMap";
import { amplifyingReactions, transformativeReactions } from "../../../../KeyMap/StatConstants";
import { allElementsWithPhy } from "../../../../Types/consts";

const EDIT = "Edit Stats"
const EXIT = "EXIT"

const baseEditKeys = ["hp_", "hp", "atk_", "atk", "def_", "def", "eleMas", "stamina"] as const
const baseReadNodes = ["hp", "atk", "def", "eleMas", "stamina"].map(k => input.total[k])

const advancedEditKeys = ["critRate_", "critDMG_", "heal_", "incHeal_", "enerRech_", "cdRed_", "shield_"] as const
const advancedReadNodes = advancedEditKeys.map(k => input.total[k])

const elementalTypeEditKeys = allElementsWithPhy.flatMap(ele => [
  `${ele}_dmg_`,
  `${ele}_res_`,
  `${ele}_critDMG_`,
  `${ele}_dmgInc`,
  `${ele}_enemyRes_`
])
const elementalTypeReadNodes = elementalTypeEditKeys.map(k => input.total[k])

const miscStatEditKeys = [
  "all_dmg_",
  ...["normal", "charged", "plunging", "skill", "burst"].flatMap(m => [`${m}_dmg_`, `${m}_critRate_`]),
  ...Object.keys(transformativeReactions).map(x => `${x}_dmg_`),
  ...Object.keys(amplifyingReactions).map(x => `${x}_dmg_`),
  "burning_dmg_",
  "moveSPD_",
  "atkSPD_",
  "weakspotDMG_",
  "dmgRed_"
]
const miscStatReadNodes = miscStatEditKeys.map(k => input.total[k])

function StatDisplayContent({ nodes, extra }: { nodes: ReadNode<number>[], extra?: Displayable }) {
  const { data, oldData } = useContext(DataContext)
  return <Grid container columnSpacing={{ xs: 2, lg: 3 }} rowSpacing={1}>
    {nodes.map(rn => <Grid item key={rn.info?.key} xs={12} >
      {<NodeFieldDisplay node={data.get(rn)} oldValue={oldData?.get(rn)?.value} />}
    </Grid>)}
    {extra}
  </Grid>
}

function StatEditContent({ keys }: { keys: readonly string[] }) {
  const { character: { bonusStats }, characterDispatch } = useContext(CharacterContext)
  return <Grid container columnSpacing={2} rowSpacing={1}>
    {keys.map(statKey => {
      const statName = KeyMap.get(statKey)
      return <Grid item xs={12} key={statKey}>
        <StatInput
          name={<span>{StatIcon[statKey]} {statName}</span>}
          placeholder={KeyMap.getStr(statKey)}
          value={bonusStats[statKey] ?? 0}
          percent={KeyMap.unit(statKey) === "%"}
          onValueChange={value => characterDispatch({ type: "editStats", statKey, value })}
        />
      </Grid>
    })}
  </Grid>
}

export default function StatCards() {
  const { data } = useContext(DataContext)
  const specialNode = data.get(input.special)

  return <Grid container spacing={1}>
    <Grid item xs={12} md={6} lg={4}>
      <Grid container spacing={1}>
        <Grid item>
          <StatDisplayCard
            title="Base Stats"
            content={<StatDisplayContent nodes={baseReadNodes}
              extra={specialNode && <Grid item xs={12} display="flex" flexDirection="row" justifyContent="space-between">
                <span><b>Special:</b> <ColorText color={specialNode.info.variant}>{specialNode.info.key && StatIcon[specialNode.info.key]} {specialNode.info.key && KeyMap.get(specialNode.info.key)}</ColorText></span>
                <span >{valueString(specialNode.value, specialNode.unit)}</span>
              </Grid>}
            />}
            editContent={<StatEditContent keys={baseEditKeys} />}
          />
        </Grid>
        <Grid item>
          <StatDisplayCard
            title="Advanced Stats"
            content={<StatDisplayContent nodes={advancedReadNodes} />}
            editContent={<StatEditContent keys={advancedEditKeys} />}
          />
        </Grid >
      </Grid >
    </Grid >
    <Grid item xs={12} md={6} lg={4}>
      <StatDisplayCard
        title="Elemental Type"
        content={<StatDisplayContent nodes={elementalTypeReadNodes} />}
        editContent={<StatEditContent keys={elementalTypeEditKeys} />}
      />
    </Grid>
    <Grid item xs={12} md={6} lg={4}>
      <StatDisplayCard
        title="Misc Stats"
        content={<StatDisplayContent nodes={miscStatReadNodes} />}
        editContent={<StatEditContent keys={miscStatEditKeys} />}
      />
    </Grid>
  </Grid >
}
function StatDisplayCard({ title, content, editContent }) {
  const [edit, setedit] = useState(false)
  return <CardLight>
    <CardContent sx={{ py: 1 }}>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="subtitle1">{title}</Typography>
        <Button size="small" color={edit ? "error" : "info"} onClick={() => setedit(!edit)} >
          <span><FontAwesomeIcon icon={edit ? faSave : faEdit} /> {edit ? EXIT : EDIT}</span>
        </Button>
      </Box>
    </CardContent>
    <Divider />
    <CardContent>
      {edit ? editContent : content}
    </CardContent>
  </CardLight>
}
