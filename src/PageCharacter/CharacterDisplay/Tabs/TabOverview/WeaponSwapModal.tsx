import { Box, CardContent, Divider, Grid, TextField, ToggleButton, Typography } from "@mui/material"
import { ChangeEvent, useCallback, useContext, useDeferredValue, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import Assets from "../../../../Assets/Assets"
import CardDark from "../../../../Components/Card/CardDark"
import CloseButton from "../../../../Components/CloseButton"
import ImgIcon from "../../../../Components/Image/ImgIcon"
import ModalWrapper from "../../../../Components/ModalWrapper"
import SolidToggleButtonGroup from "../../../../Components/SolidToggleButtonGroup"
import { StarsDisplay } from "../../../../Components/StarDisplay"
import WeaponSheet from "../../../../Data/Weapons/WeaponSheet"
import { DatabaseContext } from "../../../../Database/Database"
import WeaponCard from "../../../../PageWeapon/WeaponCard"
import useForceUpdate from '../../../../ReactHooks/useForceUpdate'
import usePromise from "../../../../ReactHooks/usePromise"
import { allRarities, Rarity, WeaponTypeKey } from "../../../../Types/consts"
import { handleMultiSelect } from "../../../../Util/MultiSelect"
import { filterFunction, sortFunction } from '../../../../Util/SortByFilters'
import { weaponFilterConfigs, weaponSortConfigs, weaponSortMap } from '../../../../Util/WeaponSort'
import CompareBuildButton from "./CompareBuildButton"

const rarityHandler = handleMultiSelect([...allRarities])

export default function WeaponSwapModal({ onChangeId, weaponTypeKey, show, onClose }: { onChangeId: (id: string) => void, weaponTypeKey: WeaponTypeKey, show: boolean, onClose: () => void }) {
  const { t } = useTranslation(["page_character", "page_weapon", "weaponNames_gen"])
  const { database } = useContext(DatabaseContext)
  const clickHandler = useCallback((id: string) => {
    onChangeId(id)
    onClose()
  }, [onChangeId, onClose])

  const [dbDirty, forceUpdate] = useForceUpdate()
  useEffect(() => database.weapons.followAny(forceUpdate), [forceUpdate, database])

  const weaponSheets = usePromise(() => WeaponSheet.getAll, [])

  const [rarity, setRarity] = useState<Rarity[]>([5, 4, 3])
  const [searchTerm, setSearchTerm] = useState("")
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const weaponIdList = useMemo(() => (weaponSheets && dbDirty && database.weapons.values
    .filter(filterFunction({ weaponType: weaponTypeKey, rarity, name: deferredSearchTerm }, weaponFilterConfigs(weaponSheets)))
    .sort(sortFunction(weaponSortMap["level"] ?? [], false, weaponSortConfigs(weaponSheets)))
    .map(weapon => weapon.id)) ?? []
    , [dbDirty, database, weaponSheets, rarity, weaponTypeKey, deferredSearchTerm])

  return <ModalWrapper open={show} onClose={onClose} >
    <CardDark>
      <CardContent sx={{ py: 1 }}>
        <Grid container>
          <Grid item flexGrow={1}>
            <Typography variant="h6">{weaponTypeKey ? <ImgIcon src={Assets.weaponTypes[weaponTypeKey]} /> : null} {t`page_character:tabEquip.swapWeapon`}</Typography>
          </Grid>
          <Grid item>
            <CloseButton onClick={onClose} />
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardContent>
        <Grid container spacing={1} mb={1}>
          <Grid item>
            <SolidToggleButtonGroup sx={{ height: "100%" }} value={rarity} size="small">
              {allRarities.map(star => <ToggleButton key={star} value={star} onClick={() => setRarity(rarityHandler(rarity, star))}>
                <Box display="flex" gap={1}><strong>{star}</strong><StarsDisplay stars={1} /></Box>
              </ToggleButton>)}
            </SolidToggleButtonGroup>
          </Grid>
          <Grid item flexGrow={1}>
            <TextField
              autoFocus
              size="small"
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSearchTerm(e.target.value)}
              label={t("page_weapon:weaponName")}
              sx={{ height: "100%" }}
              InputProps={{
                sx: { height: "100%" }
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1}>
          {weaponIdList.map(weaponId =>
            <Grid item key={weaponId} xs={6} sm={6} md={4} lg={3} >
              <WeaponCard
                weaponId={weaponId}
                onClick={clickHandler}
                extraButtons={<CompareBuildButton weaponId={weaponId} />}
              />
            </Grid>)}
        </Grid>
      </CardContent>
    </CardDark>
  </ModalWrapper>
}
