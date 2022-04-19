import { Box, CardActionArea, Chip, Grid, Skeleton, Typography } from "@mui/material";
import { Suspense, useCallback, useMemo } from "react";
import Assets from "../../Assets/Assets";
import WeaponSheet from "../../Data/Weapons/WeaponSheet";
import { input } from "../../Formula";
import { computeUIData, dataObjForWeapon } from "../../Formula/api";
import { NodeDisplay } from '../../Formula/uiData';
import KeyMap, { valueString } from "../../KeyMap";
import usePromise from "../../ReactHooks/usePromise";
import useWeapon from "../../ReactHooks/useWeapon";
import { MainStatKey, SubstatKey } from "../../Types/artifact";
import BootstrapTooltip from "../BootstrapTooltip";
import CardDark from "../Card/CardDark";
import ConditionalWrapper from "../ConditionalWrapper";
import ImgIcon from "../Image/ImgIcon";
import StatIcon from "../StatIcon";

type Data = {
  weaponId?: string,
  onClick?: () => void,
  BGComponent?: React.ElementType,
}

export default function WeaponCardNano({ weaponId, onClick, BGComponent = CardDark, }: Data) {
  const weapon = useWeapon(weaponId)
  const weaponSheet = usePromise(weapon?.key && WeaponSheet.get(weapon.key), [weapon?.key])
  const actionWrapperFunc = useCallback(
    children => <CardActionArea onClick={onClick}>{children}</CardActionArea>,
    [onClick],
  )
  const UIData = useMemo(() => weaponSheet && weapon && computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]), [weaponSheet, weapon])
  if (!weapon || !weaponSheet || !UIData) return null;
  return <BGComponent sx={{ height: "100%" }}><ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}><Box height="100%">
    <Grid container sx={{ flexWrap: "nowrap" }} className={`grad-${weaponSheet.rarity}star`} >
      <Grid item maxWidth="40%" sx={{ mr: -1 }} >
        <BootstrapTooltip placement="top" title={<Box>
          <Suspense fallback={<Skeleton width={150} />} ><Typography><ImgIcon src={Assets.weaponTypes?.[weaponSheet.weaponType]} /> {weaponSheet.name}</Typography></Suspense>
        </Box>}>
          <Box
            component="img"
            src={weaponSheet.img}
            width="100%"
            height="auto"
          />
        </BootstrapTooltip>
      </Grid>
      <Grid item sx={{ textAlign: "right", flexGrow: 1, pr: 1, pt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <Chip size="small" label={<strong>Lv. {WeaponSheet.getLevelString(weapon)}</strong>} color="primary" sx={ onClick && { cursor: "pointer" }} />
        {weaponSheet.hasRefinement && <Chip size="small" color="info" label={<strong>R{weapon.refinement}</strong>} sx={ onClick && { cursor: "pointer" }} />}
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
  </Box></ConditionalWrapper></BGComponent >
}
function WeaponStat({ node }: { node: NodeDisplay }) {
  if (!node.info.key) return null
  const val = valueString(node.value, node.unit, !node.unit ? 0 : undefined)
  return (<Box display="flex" gap={1} alignContent="center">
    <Typography sx={{ flexGrow: 1, display: "flex", gap: 1 }} component="span">
      <BootstrapTooltip placement="top" title={<Typography>{node.info.key && KeyMap.getArtStr(node.info.key as MainStatKey | SubstatKey)}</Typography>} disableInteractive>
        <span>{StatIcon[node.info.key]}</span>
      </BootstrapTooltip>
      <span>{val}</span>
    </Typography>
  </Box>)
}
