import { Box, CardContent, Divider, Grid, ToggleButton, Typography } from "@mui/material"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import Assets from "../../../../Assets/Assets"
import CardDark from "../../../../Components/Card/CardDark"
import CloseButton from "../../../../Components/CloseButton"
import ImgIcon from "../../../../Components/Image/ImgIcon"
import ModalWrapper from "../../../../Components/ModalWrapper"
import SolidToggleButtonGroup from "../../../../Components/SolidToggleButtonGroup"
import { Stars } from "../../../../Components/StarDisplay"
import WeaponSheet from "../../../../Data/Weapons/WeaponSheet"
import { DatabaseContext } from "../../../../Database/Database"
import WeaponCard from "../../../../PageWeapon/WeaponCard"
import useForceUpdate from '../../../../ReactHooks/useForceUpdate'
import usePromise from "../../../../ReactHooks/usePromise"
import { allRarities, WeaponTypeKey } from "../../../../Types/consts"
import { filterFunction, sortFunction } from '../../../../Util/SortByFilters'
import { weaponFilterConfigs, weaponSortConfigs } from '../../../../Util/WeaponSort'
import CompareBuildButton from "./CompareBuildButton"
export default function WeaponSwapModal({ onChangeId, weaponTypeKey, show, onClose }: { onChangeId: (id: string) => void, weaponTypeKey: WeaponTypeKey, show: boolean, onClose: () => void }) {
  const { t } = useTranslation("page_character")
  const { database } = useContext(DatabaseContext)
  const clickHandler = useCallback((id) => {
    onChangeId(id)
    onClose()
  }, [onChangeId, onClose])

  const [dbDirty, forceUpdate] = useForceUpdate()
  useEffect(() => database.followAnyWeapon(forceUpdate), [forceUpdate, database])

  const weaponSheets = usePromise(WeaponSheet.getAll, [])

  const filterConfigs = useMemo(() => weaponSheets && weaponFilterConfigs(weaponSheets), [weaponSheets])
  const sortConfigs = useMemo(() => weaponSheets && weaponSortConfigs(weaponSheets), [weaponSheets])

  const [rarity, setRarity] = useState([5, 4, 3])

  const weaponIdList = useMemo(() => (filterConfigs && sortConfigs && dbDirty && database._getWeapons()
    .filter(filterFunction({ weaponType: weaponTypeKey, rarity }, filterConfigs))
    .sort(sortFunction("level", false, sortConfigs))
    .map(weapon => weapon.id)) ?? []
    , [dbDirty, database, filterConfigs, sortConfigs, rarity, weaponTypeKey])

  return <ModalWrapper open={show} onClose={onClose} >
    <CardDark>
      <CardContent sx={{ py: 1 }}>
        <Grid container>
          <Grid item flexGrow={1}>
            <Typography variant="h6">{weaponTypeKey ? <ImgIcon src={Assets.weaponTypes[weaponTypeKey]} /> : null} {t`tabEquip.swapWeapon`}</Typography>
          </Grid>
          <Grid item>
            <CloseButton onClick={onClose} />
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardContent>
        <Box mb={1}>
          <SolidToggleButtonGroup sx={{ height: "100%" }} onChange={(e, newVal) => setRarity(newVal)} value={rarity} size="small">
            {allRarities.map(star => <ToggleButton key={star} value={star}><Box display="flex" gap={1}><strong>{star}</strong><Stars stars={1} /></Box></ToggleButton>)}
          </SolidToggleButtonGroup>
        </Box>
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
