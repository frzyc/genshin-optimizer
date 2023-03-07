import { allRarityKeys, RarityKey, WeaponKey, WeaponTypeKey } from "@genshin-optimizer/consts"
import { Add } from "@mui/icons-material"
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { Box, Button, CardContent, Divider, Grid, TextField, ToggleButton, Typography } from "@mui/material"
import { ChangeEvent, Suspense, useCallback, useContext, useDeferredValue, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import Assets from "../../../../Assets/Assets"
import CardDark from "../../../../Components/Card/CardDark"
import CloseButton from "../../../../Components/CloseButton"
import ImgIcon from "../../../../Components/Image/ImgIcon"
import ModalWrapper from "../../../../Components/ModalWrapper"
import SolidToggleButtonGroup from "../../../../Components/SolidToggleButtonGroup"
import WeaponSelectionModal from "../../../../Components/Weapon/WeaponSelectionModal"
import { DatabaseContext } from "../../../../Database/Database"
import WeaponCard from "../../../../PageWeapon/WeaponCard"
import WeaponEditor from "../../../../PageWeapon/WeaponEditor"
import useForceUpdate from '../../../../ReactHooks/useForceUpdate'
import { handleMultiSelect } from "../../../../Util/MultiSelect"
import { filterFunction, sortFunction } from '../../../../Util/SortByFilters'
import { weaponFilterConfigs, weaponSortConfigs, weaponSortMap } from '../../../../Util/WeaponSort'
import { initialWeapon } from "../../../../Util/WeaponUtil"
import CompareBuildButton from "./CompareBuildButton"

const rarityHandler = handleMultiSelect([...allRarityKeys])

export default function WeaponSwapModal({ onChangeId, weaponTypeKey, show, onClose }: { onChangeId: (id: string) => void, weaponTypeKey: WeaponTypeKey, show: boolean, onClose: () => void }) {
  const { t } = useTranslation(["page_character", "page_weapon", "weaponNames_gen"])
  const { database } = useContext(DatabaseContext)
  const [newWeaponModalShow, setnewWeaponModalShow] = useState(false)
  const clickHandler = useCallback((id: string) => {
    onChangeId(id)
    onClose()
  }, [onChangeId, onClose])

  const [editWeaponId, setEditWeaponId] = useState("")
  const newWeapon = useCallback((weaponKey: WeaponKey) => {
    setEditWeaponId(database.weapons.new(initialWeapon(weaponKey)))
  }, [database, setEditWeaponId])
  const resetEditWeapon = useCallback(() => setEditWeaponId(""), [])

  const [dbDirty, forceUpdate] = useForceUpdate()
  useEffect(() => database.weapons.followAny(forceUpdate), [forceUpdate, database])

  const [rarity, setRarity] = useState<RarityKey[]>([5, 4, 3])
  const [searchTerm, setSearchTerm] = useState("")
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const weaponIdList = useMemo(() => (dbDirty && database.weapons.values
    .filter(filterFunction({ weaponType: weaponTypeKey, rarity, name: deferredSearchTerm }, weaponFilterConfigs()))
    .sort(sortFunction(weaponSortMap["level"] ?? [], false, weaponSortConfigs()))
    .map(weapon => weapon.id)) ?? []
    , [dbDirty, database, rarity, weaponTypeKey, deferredSearchTerm])

  return <ModalWrapper open={show} onClose={onClose} >
    <CardDark>
      <Suspense fallback={false}>
        <WeaponSelectionModal show={newWeaponModalShow} onHide={() => setnewWeaponModalShow(false)} onSelect={newWeapon} weaponTypeFilter={weaponTypeKey} />
      </Suspense>
      {/* Editor/character detail display */}
      <Suspense fallback={false}>
        <WeaponEditor
          weaponId={editWeaponId}
          footer
          onClose={resetEditWeapon}
        />
      </Suspense>
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
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Grid container spacing={1} >
          <Grid item>
            <SolidToggleButtonGroup sx={{ height: "100%" }} value={rarity} size="small">
              {allRarityKeys.map(star => <ToggleButton key={star} value={star} onClick={() => setRarity(rarityHandler(rarity, star))}>
                <Box display="flex"><strong>{star}</strong><StarRoundedIcon /></Box>
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
        <Button fullWidth onClick={() => setnewWeaponModalShow(true)} color="info" startIcon={<Add />} >{t("page_weapon:addWeapon")}</Button>
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
