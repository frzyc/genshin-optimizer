import { Box, CardActionArea, CardContent, Divider, Grid, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import Assets from "../../Assets/Assets"
import usePromise from "../../ReactHooks/usePromise"
import { allWeaponKeys, WeaponKey, WeaponTypeKey } from "../../Types/consts"
import WeaponSheet from "../../Weapon/WeaponSheet"
import CardDark from "../Card/CardDark"
import CardLight from "../Card/CardLight"
import CloseButton from "../CloseButton"
import ImgIcon from "../Image/ImgIcon"
import ModalWrapper from "../ModalWrapper"
import { Stars } from "../StarDisplay"
import WeaponToggle from "../ToggleButton/WeaponToggle"

type WeaponSelectionModalProps = {
  show: boolean,
  onHide: () => void,
  onSelect: (wKey: WeaponKey) => void,
  filter?: (sheet: WeaponSheet) => boolean,
  weaponFilter?: WeaponTypeKey,
}

export default function WeaponSelectionModal({ show, onHide, onSelect, filter = () => true, weaponFilter: propWeaponFilter }: WeaponSelectionModalProps) {
  const weaponSheets = usePromise(WeaponSheet.getAll(), [])
  const [weaponFilter, setWeaponfilter] = useState<WeaponTypeKey | "">(propWeaponFilter ?? "")

  useEffect(() => propWeaponFilter && setWeaponfilter(propWeaponFilter), [propWeaponFilter])

  const weaponIdList = !weaponSheets ? [] : [...new Set(allWeaponKeys)].filter(wKey => filter(weaponSheets[wKey]))
    .filter(wKey => {
      if (weaponFilter && weaponFilter !== weaponSheets?.[wKey]?.weaponType) return false
      return true
    })
    .sort((a, b) => (weaponSheets?.[b]?.rarity ?? 0) - (weaponSheets?.[a]?.rarity ?? 0))

  if (!weaponSheets) return null

  return <ModalWrapper open={show} onClose={onHide}>
    <CardDark>
      <CardContent sx={{ py: 1 }}>
        <Grid container>
          <Grid item flexGrow={1}>
            <WeaponToggle value={weaponFilter} onChange={setWeaponfilter} disabled={!!propWeaponFilter} size="small" />
          </Grid >
          <Grid item>
            <CloseButton onClick={onHide} />
          </Grid >
        </Grid>
      </CardContent>
      <Divider />
      <CardContent><Grid container spacing={1}>
        {weaponIdList.map(weaponKey => {
          const weaponSheet = weaponSheets[weaponKey]
          return <Grid item key={weaponKey} lg={3} md={4}>
            <CardLight sx={{ height: "100%" }} >
              <CardActionArea onClick={() => { onHide(); onSelect(weaponKey) }} sx={{ display: "flex" }}>
                <Box component="img" src={weaponSheet.img} sx={{ width: 100, height: "auto" }} className={` grad-${weaponSheet.rarity}star`} />
                <Box sx={{ flexGrow: 1, px: 1 }}>
                  <Typography variant="subtitle1">{weaponSheet.name}</Typography>
                  <Typography><ImgIcon src={Assets.weaponTypes?.[weaponSheet.weaponType]} /> <Stars stars={weaponSheet.rarity} colored /></Typography>
                </Box>
              </CardActionArea>
            </CardLight>
          </Grid>
        })}
      </Grid></CardContent>
      <Divider />
      <CardContent sx={{ py: 1 }}>
        <CloseButton large onClick={onHide} />
      </CardContent>
    </CardDark>
  </ModalWrapper>
}