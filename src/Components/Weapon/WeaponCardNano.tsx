import { Box, CardActionArea, Chip, Skeleton, Typography } from "@mui/material";
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
  const actionWrapperFunc = useCallback(children => <CardActionArea sx={{ height: "100%" }} onClick={onClick}>{children}</CardActionArea>, [onClick],)
  const UIData = useMemo(() => weaponSheet && weapon && computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]), [weaponSheet, weapon])
  if (!weapon || !weaponSheet || !UIData) return null;
  return <BGComponent sx={{ height: "100%" }}><ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}  >
    <Box display="flex" height="100%">
      <BootstrapTooltip placement="top" title={<Suspense fallback={<Skeleton variant="text" width={100} />}>
        <Typography><ImgIcon src={Assets.weaponTypes?.[weaponSheet.weaponType]} /> {weaponSheet?.name}</Typography>
      </Suspense>} disableInteractive>
        <Box className={`grad-${weaponSheet.rarity}star`} sx={{ position: "relative", flexGrow: 1, display: "flex", flexDirection: "column" }} >
          <Box sx={{ position: "absolute", width: "100%", height: "100%", textAlign: "center" }} >
            <Box
              component="img"
              src={weaponSheet.img}
              sx={{ m: -1, display: "inline", maxHeight: "110%", maxWidth: "110%" }}
            />
          </Box>
          <Box sx={{ position: "absolute", width: "100%", height: "100%", p: 0.5, opacity: 0.85, }} >
            <Chip size="small" label={<strong>{WeaponSheet.getLevelString(weapon)}</strong>} color="primary" />
          </Box>
          <Box sx={{ position: "absolute", width: "100%", height: "100%", p: 0.5, opacity: 0.85, display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }} >
            {weaponSheet.hasRefinement && <Chip size="small" color="info" label={<strong>R{weapon.refinement}</strong>} />}
          </Box>
        </Box></BootstrapTooltip>
      <Box display="flex" flexDirection="column" sx={{ p: 1, }}>
        <WeaponStat node={UIData.get(input.weapon.main)} />
        <WeaponStat node={UIData.get(input.weapon.sub)} />
      </Box>
    </Box>
  </ConditionalWrapper></BGComponent >
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
