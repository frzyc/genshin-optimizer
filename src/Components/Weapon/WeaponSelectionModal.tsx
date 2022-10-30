import { Box, CardActionArea, CardContent, Divider, Grid, TextField, ToggleButton, Typography } from "@mui/material"
import { ChangeEvent, useContext, useDeferredValue, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Assets from "../../Assets/Assets"
import WeaponSheet from "../../Data/Weapons/WeaponSheet"
import { DatabaseContext } from "../../Database/Database"
import usePromise from "../../ReactHooks/usePromise"
import { allRarities, allWeaponKeys, allWeaponTypeKeys, WeaponKey, WeaponTypeKey } from "../../Types/consts"
import { handleMultiSelect } from "../../Util/MultiSelect"
import CardDark from "../Card/CardDark"
import CardLight from "../Card/CardLight"
import CloseButton from "../CloseButton"
import ImgIcon from "../Image/ImgIcon"
import ModalWrapper from "../ModalWrapper"
import SolidToggleButtonGroup from "../SolidToggleButtonGroup"
import { StarsDisplay } from "../StarDisplay"
import WeaponToggle from "../ToggleButton/WeaponToggle"

type WeaponSelectionModalProps = {
  show: boolean,
  ascension?: number,
  onHide: () => void,
  onSelect: (wKey: WeaponKey) => void,
  filter?: (sheet: WeaponSheet) => boolean,
  weaponTypeFilter?: WeaponTypeKey,
}

const rarityHandler = handleMultiSelect([...allRarities])
export default function WeaponSelectionModal({ show, ascension = 0, onHide, onSelect, filter = () => true, weaponTypeFilter }: WeaponSelectionModalProps) {
  const { t } = useTranslation(["page_weapon", "weaponNames_gen"])
  const weaponSheets = usePromise(() => WeaponSheet.getAll, [])
  const [weaponFilter, setWeaponfilter] = useState<WeaponTypeKey[]>(weaponTypeFilter ? [weaponTypeFilter] : [...allWeaponTypeKeys])

  const { database } = useContext(DatabaseContext)
  const [state, setState] = useState(database.displayWeapon.get())
  useEffect(() => database.displayWeapon.follow((r, dbMeta) => setState(dbMeta)), [database])

  useEffect(() => weaponTypeFilter && setWeaponfilter([weaponTypeFilter]), [weaponTypeFilter])

  const [searchTerm, setSearchTerm] = useState("")
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const { rarity } = state
  const weaponIdList = !weaponSheets ? [] : allWeaponKeys.filter(wKey => filter(weaponSheets(wKey)))
    .filter(wKey => weaponFilter.includes(weaponSheets(wKey).weaponType))
    .filter(wKey => !deferredSearchTerm || t(`weaponNames_gen:${wKey}`).toLowerCase().includes(deferredSearchTerm.toLowerCase()))
    .filter(wKey => rarity.includes(weaponSheets(wKey).rarity))
    .sort((a, b) => weaponSheets(b).rarity - weaponSheets(a).rarity)

  if (!weaponSheets) return null

  return <ModalWrapper open={show} onClose={onHide}>
    <CardDark>
      <CardContent sx={{ py: 1 }}>
        <Grid container spacing={1}>
          <Grid item>
            <WeaponToggle value={weaponFilter} onChange={setWeaponfilter} disabled={!!weaponTypeFilter} size="small" />
          </Grid >
          <Grid item>
            <SolidToggleButtonGroup sx={{ height: "100%" }} value={rarity} size="small">
              {allRarities.map(star => <ToggleButton key={star} value={star} onClick={() => database.displayWeapon.set({ rarity: rarityHandler(rarity, star) })}><Box display="flex" gap={1}><strong>{star}</strong><StarsDisplay stars={1} /></Box></ToggleButton>)}
            </SolidToggleButtonGroup>
          </Grid>
          <Grid item flexGrow={1}>
            <TextField
              autoFocus
              size="small"
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSearchTerm(e.target.value)}
              label={t("weaponName")}
              sx={{ height: "100%" }}
              InputProps={{
                sx: { height: "100%" }
              }}
            />
          </Grid>
          <Grid item>
            <CloseButton onClick={onHide} />
          </Grid >
        </Grid>
      </CardContent>
      <Divider />
      <CardContent><Grid container spacing={1}>
        {weaponIdList.map(weaponKey => {
          const weaponSheet = weaponSheets(weaponKey)
          return <Grid item key={weaponKey} lg={3} md={4}>
            <CardLight sx={{ height: "100%" }} >
              <CardActionArea onClick={() => { onHide(); onSelect(weaponKey) }} sx={{ display: "flex" }}>
                <Box component="img" src={weaponSheet.getImg(ascension)} sx={{ width: 100, height: "auto" }} className={` grad-${weaponSheet.rarity}star`} />
                <Box sx={{ flexGrow: 1, px: 1 }}>
                  <Typography variant="subtitle1">{weaponSheet.name}</Typography>
                  <Typography><ImgIcon src={Assets.weaponTypes?.[weaponSheet.weaponType]} /> <StarsDisplay stars={weaponSheet.rarity} colored /></Typography>
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
