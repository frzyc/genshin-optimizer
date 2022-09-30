import { BusinessCenter } from "@mui/icons-material";
import { Box, CardActionArea, Chip, Skeleton, Typography } from "@mui/material";
import { useCallback, useContext, useMemo } from "react";
import CharacterSheet from "../../Data/Characters/CharacterSheet";
import WeaponSheet from "../../Data/Weapons/WeaponSheet";
import { DatabaseContext } from "../../Database/Database";
import { input } from "../../Formula";
import { computeUIData, dataObjForWeapon } from "../../Formula/api";
import { NodeDisplay } from '../../Formula/uiData';
import KeyMap, { valueString } from "../../KeyMap";
import useDBMeta from "../../ReactHooks/useDBMeta";
import usePromise from "../../ReactHooks/usePromise";
import useWeapon from "../../ReactHooks/useWeapon";
import { MainStatKey, SubstatKey } from "../../Types/artifact";
import { LocationKey } from "../../Types/consts";
import BootstrapTooltip from "../BootstrapTooltip";
import CardDark from "../Card/CardDark";
import ConditionalWrapper from "../ConditionalWrapper";
import ImgIcon from "../Image/ImgIcon";
import StatIcon from "../StatIcon";
import WeaponNameTooltip from "./WeaponNameTooltip";

type Data = {
  weaponId?: string,
  onClick?: () => void,
  showLocation?: boolean,
  BGComponent?: React.ElementType,
}

export default function WeaponCardNano({ weaponId, showLocation = false, onClick, BGComponent = CardDark, }: Data) {
  const weapon = useWeapon(weaponId)
  const weaponSheet = usePromise(() => weapon?.key && WeaponSheet.get(weapon.key), [weapon?.key])
  const actionWrapperFunc = useCallback(children => <CardActionArea sx={{ height: "100%" }} onClick={onClick}>{children}</CardActionArea>, [onClick],)
  const UIData = useMemo(() => weaponSheet && weapon && computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]), [weaponSheet, weapon])
  if (!weapon || !weaponSheet || !UIData) return <BGComponent sx={{ height: "100%" }}><Skeleton variant="rectangular" sx={{ width: "100%", height: "100%" }} /></BGComponent>;
  const { refinement, location } = weapon
  return <BGComponent sx={{ height: "100%" }}><ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}  >
    <Box display="flex" height="100%" alignItems="stretch" >
      <Box className={`grad-${weaponSheet.rarity}star`} sx={{ height: "100%", position: "relative", flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }} >
        <WeaponNameTooltip sheet={weaponSheet}>
          <Box
            component="img"
            src={weaponSheet.getImg(weapon.ascension)}
            sx={{ mx: -1, maxHeight: "100%", maxWidth: "100%" }}
          />
        </WeaponNameTooltip>
        <Box sx={{ position: "absolute", width: "100%", height: "100%", p: 0.5, opacity: 0.85, display: "flex", justifyContent: "space-between", pointerEvents: "none" }} >
          <Chip size="small" label={<strong>{WeaponSheet.getLevelString(weapon)}</strong>} color="primary" />
          {showLocation && <Chip size="small" label={<LocationIcon location={location} />} color={"secondary"} sx={{
            overflow: "visible", ".MuiChip-label": {
              overflow: "visible"
            }
          }} />}
        </Box>
        <Box sx={{ position: "absolute", width: "100%", height: "100%", p: 0.5, opacity: 0.85, display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }} >
          {weaponSheet.hasRefinement && <Chip size="small" color="info" label={<strong>R{refinement}</strong>} />}
        </Box>
      </Box>
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
function LocationIcon({ location }: { location: LocationKey }) {
  const { database } = useContext(DatabaseContext)
  const { gender } = useDBMeta()
  const characterSheet = usePromise(() => CharacterSheet.get(location ? database.chars.LocationToCharacterKey(location) : "", gender), [location, gender])
  return characterSheet ? <BootstrapTooltip placement="right-end" title={<Typography>{characterSheet.name}</Typography>}><ImgIcon src={characterSheet.thumbImgSide} sx={{ height: "3em", marginTop: "-1.5em", marginLeft: "-0.5em" }} /></BootstrapTooltip> : <BusinessCenter />
}
