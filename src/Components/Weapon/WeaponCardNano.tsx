import { Box, CardMedia, Chip, Grid, Typography } from "@mui/material";
import { useMemo } from "react";
import WeaponSheet from "../../Data/Weapons/WeaponSheet";
import { input } from "../../Formula";
import { computeUIData, dataObjForWeapon } from "../../Formula/api";
import { NodeDisplay } from '../../Formula/uiData';
import { valueString } from "../../KeyMap";
import usePromise from "../../ReactHooks/usePromise";
import useWeapon from "../../ReactHooks/useWeapon";
import CardDark from "../Card/CardDark";
import StatIcon from "../StatIcon";

type Data = {
  weaponId?: string,
}

export default function WeaponCardNano({ weaponId }: Data) {
  const weapon = useWeapon(weaponId)
  const weaponSheet = usePromise(weapon?.key && WeaponSheet.get(weapon.key), [weapon?.key])
  const UIData = useMemo(() => weaponSheet && weapon && computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]), [weaponSheet, weapon])
  if (!weapon || !weaponSheet || !UIData) return null;
  return <CardDark sx={{ height: "100%" }}>
    <Grid container sx={{ flexWrap: "nowrap" }} className={`grad-${weaponSheet.rarity}star`} >
      <Grid item maxWidth="40%" sx={{}} >
        <CardMedia
          component="img"
          image={weaponSheet.img}
          width="100%"
          height="auto"
        />
      </Grid>
      <Grid item sx={{ textAlign: "right", flexGrow: 1, pr: 1, pt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <Chip size="small" label={<strong>Lv. {WeaponSheet.getLevelString(weapon)}</strong>} color="primary" />
        {weaponSheet.hasRefinement && <Chip size="small" color="info" label={<strong>R{weapon.refinement}</strong>} />}
      </Grid>
    </Grid>
    <Grid container sx={{ p: 1, pl: 2 }}>
      <Grid item xs={6}>
        <WeaponStat node={UIData.get(input.weapon.main)} />
      </Grid>
      <Grid item xs={6}>
        <WeaponStat node={UIData.get(input.weapon.sub)} />
      </Grid>
    </Grid>
  </CardDark >
}
function WeaponStat({ node }: { node: NodeDisplay }) {
  if (!node.info.key) return null
  const val = valueString(node.value, node.unit, !node.unit ? 0 : undefined)
  return (<Box display="flex" gap={1} alignContent="center">
    <Typography sx={{ flexGrow: 1 }} component="span">{StatIcon[node.info.key]} {val}</Typography>
  </Box>)
}
