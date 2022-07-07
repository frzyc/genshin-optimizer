import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ModeEdit, Replay } from "@mui/icons-material";
import { Box, Button, CardContent, Divider, Grid, Typography } from "@mui/material";
import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { CharacterContext } from "../../../../Context/CharacterContext";
import BootstrapTooltip from "../../../../Components/BootstrapTooltip";
import CardLight from "../../../../Components/Card/CardLight";
import ColorText from "../../../../Components/ColoredText";
import { NodeFieldDisplay } from "../../../../Components/FieldDisplay";
import StatIcon from "../../../../Components/StatIcon";
import StatInput from "../../../../Components/StatInput";
import { DataContext } from "../../../../Context/DataContext";
import { uiInput as input } from "../../../../Formula";
import { ReadNode } from "../../../../Formula/type";
import KeyMap, { valueString } from "../../../../KeyMap";
import { amplifyingReactions, transformativeReactions } from "../../../../KeyMap/StatConstants";
import { allElementsWithPhy } from "../../../../Types/consts";

const baseEditKeys = ["hp_", "hp", "atk_", "atk", "def_", "def", "eleMas", "stamina"]
const baseReadNodes = ["hp", "atk", "def", "eleMas", "stamina"].map(k => input.total[k])

const advancedEditKeys = ["critRate_", "critDMG_", "heal_", "incHeal_", "enerRech_", "cdRed_", "shield_"]
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
  "all_dmgInc",
  ...["normal", "charged", "plunging", "skill", "burst"].flatMap(m => [`${m}_dmg_`, `${m}_critRate_`, `${m}_dmgInc`]),
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
  const { character: { bonusStats } } = useContext(CharacterContext)
  return <Grid container columnSpacing={{ xs: 2, lg: 3 }} rowSpacing={1}>
    {nodes.map(rn => {
      const key = rn.info?.key
      const modified = key && (bonusStats[key] || bonusStats[key + "_"])
      return <Grid item key={key} xs={12} sx={{ fontStyle: modified ? "bold" : undefined }} >
        {<NodeFieldDisplay
          node={data.get(rn)}
          oldValue={oldData?.get(rn)?.value}
          suffix={modified ? <ModeEdit color="warning" fontSize="inherit" sx={{ mt: "3px", mb: "-3px" }} /> : undefined}
        />}
      </Grid>
    })
    }
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
    <Grid item xs={12} md={12} lg={4}>
      <Grid container spacing={1}>
        <Grid item xs={12} md={6} lg={12}>
          <StatDisplayCard
            title="Base Stats"
            content={<StatDisplayContent nodes={baseReadNodes}
              extra={specialNode && <Grid item xs={12} display="flex" flexDirection="row" justifyContent="space-between">
                <span><b>Special:</b> <ColorText color={specialNode.info.variant}>{specialNode.info.key && StatIcon[specialNode.info.key]} {specialNode.info.key && KeyMap.get(specialNode.info.key)}</ColorText></span>
                <span >{valueString(specialNode.value, specialNode.unit)}</span>
              </Grid>}
            />}
            editKeys={baseEditKeys}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={12}>
          <StatDisplayCard
            title="Advanced Stats"
            content={<StatDisplayContent nodes={advancedReadNodes} />}
            editKeys={advancedEditKeys}
          />
        </Grid >
      </Grid >
    </Grid >
    <Grid item xs={12} md={6} lg={4}>
      <StatDisplayCard
        title="Elemental Type"
        content={<StatDisplayContent nodes={elementalTypeReadNodes} />}
        editKeys={elementalTypeEditKeys}
      />
    </Grid>
    <Grid item xs={12} md={6} lg={4}>
      <StatDisplayCard
        title="Misc Stats"
        content={<StatDisplayContent nodes={miscStatReadNodes} />}
        editKeys={miscStatEditKeys}
      />
    </Grid>
  </Grid >
}
function StatDisplayCard({ title, content, editKeys }: { title: Displayable, content: Displayable, editKeys: string[] }) {
  const { t } = useTranslation("ui")
  const [edit, setedit] = useState(false)
  const { character: { bonusStats }, characterDispatch } = useContext(CharacterContext)
  const resetStats = useCallback(() => {
    editKeys.forEach(key => bonusStats[key] && characterDispatch({ type: "editStats", statKey: key, value: 0 }))
  }, [editKeys, bonusStats, characterDispatch])

  return <CardLight>
    <CardContent sx={{ py: 1 }}>
      <Box display="flex" gap={1}>
        <Typography variant="subtitle1" flexGrow={1}>{title}</Typography>
        <Button
          size="small"
          color={edit ? "error" : "info"}
          onClick={() => setedit(!edit)}
          startIcon={<FontAwesomeIcon icon={edit ? faSave : faEdit} />}
        >
          {edit ? t("ui:exit") : t("ui:edit")}
        </Button>
        <BootstrapTooltip title={t("ui:reset")} placement="top">
          <Button
            size="small"
            color="error"
            onClick={() => resetStats()}
            sx={{ px: 1, minWidth: 0 }}
          >
            <Replay />
          </Button>
        </BootstrapTooltip>
      </Box>
    </CardContent>
    <Divider />
    <CardContent>
      {edit ? <StatEditContent keys={editKeys} /> : content}
    </CardContent>
  </CardLight>
}
