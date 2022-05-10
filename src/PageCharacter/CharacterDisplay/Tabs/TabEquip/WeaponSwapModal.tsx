import { CardContent, Divider, Grid, Typography, Box, ToggleButton } from "@mui/material"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
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
import useMediaQueryUp from "../../../../ReactHooks/useMediaQueryUp"
import usePromise from "../../../../ReactHooks/usePromise"
import { WeaponTypeKey, allRarities } from "../../../../Types/consts"
import { filterFunction } from '../../../../Util/SortByFilters'
import { weaponFilterConfigs } from '../../../../Util/WeaponSort'
import CompareBuildButton from "./CompareBuildButton"
const numToShowMap = { xs: 6, sm: 6, md: 9, lg: 12, xl: 12 }
export default function WeaponSwapModal({ onChangeId, weaponTypeKey, show, onClose }: { onChangeId: (id: string) => void, weaponTypeKey: WeaponTypeKey, show: boolean, onClose: () => void }) {
  const { database } = useContext(DatabaseContext)
  const clickHandler = useCallback((id) => {
    onChangeId(id)
    onClose()
  }, [onChangeId, onClose])

  const [dbDirty, forceUpdate] = useForceUpdate()
  useEffect(() => database.followAnyWeapon(forceUpdate), [forceUpdate, database])

  const weaponSheets = usePromise(WeaponSheet.getAll, [])

  const filterConfigs = useMemo(() => weaponSheets && weaponFilterConfigs(weaponSheets), [weaponSheets])

  const [rarity, setRarity] = useState([...allRarities])

  const brPt = useMediaQueryUp()

  const weaponIdList = useMemo(() => (filterConfigs && dbDirty && database._getWeapons().filter(filterFunction({ weaponType: weaponTypeKey, rarity }, filterConfigs)).map(weapon => weapon.id).slice(0, numToShowMap[brPt])) ?? []
    , [dbDirty, database, filterConfigs, rarity, weaponTypeKey, brPt])

  return <ModalWrapper open={show} onClose={onClose} >
    <CardDark>
      <CardContent sx={{ py: 1 }}>
        <Grid container>
          <Grid item flexGrow={1}>
            <Typography variant="h6">{weaponTypeKey ? <ImgIcon src={Assets.weaponTypes[weaponTypeKey]} /> : null} Swap Weapon</Typography>
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
