import { CardContent, CardHeader, Grid, ListItem, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import CardDark from "../../Components/Card/CardDark";
import CardLight from "../../Components/Card/CardLight";
import CloseButton from "../../Components/CloseButton";
import ColorText from "../../Components/ColoredText";
import { EnemyExpandCard } from "../../Components/EnemyEditor";
import { FieldDisplayList, NodeFieldDisplay } from "../../Components/FieldDisplay";
import ModalWrapper from "../../Components/ModalWrapper";
import StatEditorList from "../../Components/StatEditorList";
import StatIcon from "../../Components/StatIcon";
import { CharacterContext } from "../../Context/CharacterContext";
import { DataContext } from "../../Context/DataContext";
import { allInputPremodKeys, uiInput as input } from "../../Formula";
import { ReadNode } from "../../Formula/type";
import KeyMap, { allEleDmgKeys, allEleResKeys, valueString } from "../../KeyMap";
import { allElements, ElementKeyWithPhy } from "../../Types/consts";

const cols = {
  xs: 1, md: 2, lg: 3
}

export default function StatModal({ open, onClose }) {
  const { t } = useTranslation("page_character")
  return <ModalWrapper open={open} onClose={onClose}>
    <CardDark>
      <CardHeader title={t`addStats.title`} action={<CloseButton onClick={onClose} />} />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={1}>
          <BonusStatsEditor />
          <EnemyExpandCard />
          <MainStatsCards />
        </Stack>
      </CardContent></CardDark>
  </ModalWrapper>
}
const keys = [...allInputPremodKeys]
const wrapperFunc = (e: JSX.Element) => <Grid item xs={1}>{e}</Grid>
function BonusStatsEditor() {
  const { character: { bonusStats }, characterDispatch } = useContext(CharacterContext)
  const setFilter = useCallback((bonusStats) => characterDispatch({ bonusStats }), [characterDispatch],)
  return <CardLight>
    <CardContent sx={{ display: "flex" }}>
      <Grid container columns={cols} sx={{ pt: 1 }} spacing={1}>
        <StatEditorList statKeys={keys} statFilters={bonusStats} setStatFilters={setFilter} wrapperFunc={wrapperFunc} />
      </Grid>
    </CardContent>
  </CardLight>
}

const mainBaseKeys = ["hp", "atk", "def"] as const
const mainSubKeys = ["eleMas", "critRate_", "critDMG_", "enerRech_", "heal_"] as const
const mainReadNodes = [...mainBaseKeys, ...mainSubKeys].map(k => input.total[k])
const mainEditKeys = ["atk_", "atk", "hp_", "hp", "def_", "def", ...mainSubKeys] as const

const otherStatKeys = [
  ...allEleDmgKeys,
  ...allEleResKeys,
  "stamina", "incHeal_", "shield_", "cdRed_"
] as const

const miscStatkeys = allInputPremodKeys.filter(k => !mainEditKeys.includes(k as any) && !otherStatKeys.includes(k as any))


function StatDisplayContent({ nodes, extra }: { nodes: ReadNode<number>[], extra?: Displayable }) {
  const { data, oldData } = useContext(DataContext)
  return <FieldDisplayList >
    {nodes.map(rn => <NodeFieldDisplay component={ListItem} key={rn.info?.key} node={data.get(rn)} oldValue={oldData?.get(rn)?.value} />)}
    {extra}
  </FieldDisplayList>
}

function MainStatsCards() {
  const { characterSheet } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const specialNode = data.get(input.special)
  const charEle = characterSheet.elementKey
  const isMelee = characterSheet.isMelee()

  const otherStatReadNodes = useMemo(() => {
    const nodes = otherStatKeys.map(k => input.total[k])
    const eles: ElementKeyWithPhy[] = [...allElements].filter(k => k !== charEle)
    if (isMelee) eles.concat(["physical"])

    return nodes.filter(n => !(!data.get(n).value && eles.some(e => n.info?.key?.includes?.(e))))
  }, [data, charEle, isMelee])


  const miscStatReadNodes = useMemo(() => miscStatkeys.map(k => input.total[k]).filter(n => data.get(n).value), [data])

  return <CardLight><CardContent>
    <Grid container columns={cols} spacing={1}>
      <Grid item xs={1}>
        <StatDisplayCard title="Main Stats">
          <StatDisplayContent nodes={mainReadNodes}
            extra={specialNode && <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
              <span><b>Special:</b> <ColorText color={specialNode.info.variant}>{specialNode.info.key && StatIcon[specialNode.info.key]} {specialNode.info.key && KeyMap.get(specialNode.info.key)}</ColorText></span>
              <span >{valueString(specialNode.value, specialNode.unit)}</span>
            </ListItem>}
          />
        </StatDisplayCard>
      </Grid>
      <Grid item xs={1}>
        <StatDisplayCard title="Other Stats">
          <StatDisplayContent nodes={otherStatReadNodes} />
        </StatDisplayCard>
      </Grid>
      {!!miscStatReadNodes.length && <Grid item xs={1}>
        <StatDisplayCard title="Misc Stats">
          <StatDisplayContent nodes={miscStatReadNodes} />
        </StatDisplayCard>
      </Grid>}
    </Grid>
  </CardContent></CardLight>
}
function StatDisplayCard({ title, children }) {
  return <CardDark>
    <CardContent sx={{ py: 1 }}>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="subtitle1">{title}</Typography>
      </Box>
    </CardContent>
    {children}
  </CardDark>
}
