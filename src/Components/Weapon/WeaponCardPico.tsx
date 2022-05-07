import { Box, Typography } from '@mui/material';
import { useContext, useMemo } from 'react';
import WeaponSheet from '../../Data/Weapons/WeaponSheet';
import { DatabaseContext } from '../../Database/Database';
import { uiInput as input } from '../../Formula';
import { computeUIData, dataObjForWeapon } from '../../Formula/api';
import { NodeDisplay } from '../../Formula/uiData';
import { valueString } from '../../KeyMap';
import usePromise from '../../ReactHooks/usePromise';
import CardDark from '../Card/CardDark';
import SqBadge from '../SqBadge';
import StatIcon from '../StatIcon';
import WeaponNameTooltip from './WeaponNameTooltip';

export default function WeaponCardPico({ weaponId }: { weaponId: string }) {
  const { database } = useContext(DatabaseContext)
  const weapon = database._getWeapon(weaponId)
  const weaponSheet = usePromise(weapon?.key && WeaponSheet.get(weapon.key), [weapon?.key])
  const UIData = useMemo(() => weaponSheet && weapon && computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]), [weaponSheet, weapon])
  if (!weapon || !weaponSheet || !UIData) return null;

  const tooltipAddl = <Box>
    <WeaponStatPico node={UIData.get(input.weapon.main)} />
    <WeaponStatPico node={UIData.get(input.weapon.sub)} />
  </Box>

  return <CardDark sx={{ height: "100%", maxWidth: 128, position: "relative", display: "flex", flexDirection: "column", }}>
    <Box display="flex" flexDirection="column" alignContent="flex-end" className={`grad-${weaponSheet.rarity}star`}>
      <WeaponNameTooltip sheet={weaponSheet} addlText={tooltipAddl}>
        <Box
          component="img"
          src={weaponSheet.img}
          maxWidth="100%"
          maxHeight="100%"
          sx={{ mt: "auto" }}
        />
      </WeaponNameTooltip>
    </Box>
    <Typography variant='subtitle1' sx={{ position: "absolute", mt: -0.2, lineHeight: 1, pointerEvents: "none" }}>
      <SqBadge color="primary">{WeaponSheet.getLevelString(weapon)}</SqBadge>
    </Typography>
    {weaponSheet.hasRefinement && <Typography variant='subtitle1' sx={{ position: "absolute", bottom: 0, right: 0, lineHeight: 1, pointerEvents: "none" }}>
      <SqBadge color="secondary">R{weapon.refinement}</SqBadge>
    </Typography>}
  </CardDark>
}
function WeaponStatPico({ node }: { node: NodeDisplay }) {
  if (!node.info.key) return null
  const val = valueString(node.value, node.unit, !node.unit ? 0 : undefined)
  return <Typography>{StatIcon[node.info.key]} {val}</Typography>
}
