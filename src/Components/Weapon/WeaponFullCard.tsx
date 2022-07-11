import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import WeaponSheet from '../../Data/Weapons/WeaponSheet';
import { uiInput as input } from '../../Formula';
import { computeUIData, dataObjForWeapon } from '../../Formula/api';
import { NodeDisplay } from '../../Formula/uiData';
import { valueString } from '../../KeyMap';
import usePromise from '../../ReactHooks/usePromise';
import useWeapon from '../../ReactHooks/useWeapon';
import { ICachedWeapon } from '../../Types/weapon';
import CardDark from '../Card/CardDark';
import SqBadge from '../SqBadge';
import StatIcon from '../StatIcon';

export default function WeaponFullCard({ weaponId }: { weaponId: string }) {
  const weapon = useWeapon(weaponId)
  const weaponSheet = usePromise(() => weapon?.key && WeaponSheet.get(weapon.key), [weapon?.key])
  const UIData = useMemo(() => weaponSheet && weapon && computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]), [weaponSheet, weapon])
  if (!weapon || !weaponSheet || !UIData) return null;
  return <CardDark>
    <Box display="flex" >
      <Box flexShrink={1} maxWidth="35%" display="flex" flexDirection="column" alignContent="flex-end" className={`grad-${weaponSheet.rarity}star`} >
        <Box
          component="img"
          src={weaponSheet.getImg(weapon.ascension)}
          width="100%"
          height="auto"
          sx={{ mt: "auto" }}
        />
      </Box>
      <Box flexGrow={1} sx={{ p: 1 }}>
        <Typography variant="body2" gutterBottom><strong>{weaponSheet?.name}</strong></Typography>
        <Typography variant='subtitle1' sx={{ display: "flex", gap: 1 }} gutterBottom>
          <SqBadge color="primary">Lv. {WeaponSheet.getLevelString(weapon as ICachedWeapon)}</SqBadge>
          {weaponSheet.hasRefinement && <SqBadge color="info">R{weapon.refinement}</SqBadge>}
        </Typography>
        <Typography variant='subtitle1' sx={{ display: "flex", gap: 1 }} >
          <WeaponStat node={UIData.get(input.weapon.main)} />
          <WeaponStat node={UIData.get(input.weapon.sub)} />
        </Typography>

      </Box>
    </Box>
  </CardDark>
}
function WeaponStat({ node }: { node: NodeDisplay }) {
  if (!node.info.key) return null
  const val = valueString(node.value, node.unit, !node.unit ? 0 : undefined)
  return <SqBadge color="secondary">{StatIcon[node.info.key]} {val}</SqBadge>
}
