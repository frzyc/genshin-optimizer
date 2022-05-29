import { BusinessCenter, Lock, LockOpen } from "@mui/icons-material"
import { Box, Button, ButtonGroup, CardContent, CardHeader, Divider, Grid, ListItem, MenuItem, Typography } from "@mui/material"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import CardDark from "../Components/Card/CardDark"
import CardLight from "../Components/Card/CardLight"
import CharacterAutocomplete from "../Components/Character/CharacterAutocomplete"
import CloseButton from "../Components/CloseButton"
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from "../Components/CustomNumberInput"
import DocumentDisplay from "../Components/DocumentDisplay"
import DropdownButton from "../Components/DropdownMenu/DropdownButton"
import { FieldDisplayList, NodeFieldDisplay } from "../Components/FieldDisplay"
import ModalWrapper from "../Components/ModalWrapper"
import { Stars } from "../Components/StarDisplay"
import WeaponSelectionModal from "../Components/Weapon/WeaponSelectionModal"
import CharacterSheet from "../Data/Characters/CharacterSheet"
import { ascensionMaxLevel, lowRarityMilestoneLevels } from "../Data/LevelData"
import WeaponSheet from "../Data/Weapons/WeaponSheet"
import { DatabaseContext } from "../Database/Database"
import { DataContext } from "../DataContext"
import { uiInput as input } from "../Formula"
import { computeUIData, dataObjForWeapon } from "../Formula/api"
import usePromise from "../ReactHooks/usePromise"
import useWeapon from "../ReactHooks/useWeapon"
import { CharacterKey } from "../Types/consts"
import { ICachedWeapon } from "../Types/weapon"
import { clamp } from "../Util/Util"

type WeaponStatsEditorCardProps = {
  weaponId: string
  footer?: boolean
  onClose?: () => void
  extraButtons?: JSX.Element
}
export default function WeaponEditor({
  weaponId: propWeaponId,
  footer = false,
  onClose,
  extraButtons
}: WeaponStatsEditorCardProps) {
  const { t } = useTranslation("ui")
  const { data } = useContext(DataContext)

  const { database } = useContext(DatabaseContext)
  const weapon = useWeapon(propWeaponId)
  const { key = "", level = 0, refinement = 0, ascension = 0, lock, location = "", id } = weapon ?? {}
  const weaponSheet = usePromise(WeaponSheet.get(key), [key])

  const weaponDispatch = useCallback((newWeapon: Partial<ICachedWeapon>) => {
    database.updateWeapon(newWeapon, propWeaponId)
  }, [propWeaponId, database])

  const setLevel = useCallback(level => {
    level = clamp(level, 1, 90)
    const ascension = ascensionMaxLevel.findIndex(ascenML => level <= ascenML)
    weaponDispatch({ level, ascension })
  }, [weaponDispatch])

  const setAscension = useCallback(() => {
    const lowerAscension = ascensionMaxLevel.findIndex(ascenML => level !== 90 && level === ascenML)
    if (ascension === lowerAscension) weaponDispatch({ ascension: ascension + 1 })
    else weaponDispatch({ ascension: lowerAscension })
  }, [weaponDispatch, ascension, level])

  const characterSheet = usePromise(location ? CharacterSheet.get(location) : undefined, [location])
  const weaponFilter = characterSheet ? (ws) => ws.weaponType === characterSheet.weaponTypeKey : undefined
  const initialWeaponFilter = characterSheet && characterSheet.weaponTypeKey

  const equipOnChar = useCallback((charKey: CharacterKey | "") => id && database.setWeaponLocation(id, charKey), [database, id])
  const filter = useCallback(
    (cs: CharacterSheet) => cs.weaponTypeKey === weaponSheet?.weaponType,
    [weaponSheet],
  )

  const [showModal, setshowModal] = useState(false)
  const img = ascension < 2 ? weaponSheet?.img : weaponSheet?.imgAwaken

  //check the levels when switching from a 5* to a 1*, for example.
  useEffect(() => {
    if (!weaponSheet || !weaponDispatch || weaponSheet.key !== weapon?.key) return
    if (weaponSheet.rarity <= 2 && (level > 70 || ascension > 4)) {
      const [level, ascension] = lowRarityMilestoneLevels[0]
      weaponDispatch({ level, ascension })
    }
  }, [weaponSheet, weapon, weaponDispatch, level, ascension])


  const weaponUIData = useMemo(() => weaponSheet && weapon && computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]), [weaponSheet, weapon])
  return <ModalWrapper open={!!propWeaponId} onClose={onClose} containerProps={{ maxWidth: "md" }}><CardLight>
    <WeaponSelectionModal show={showModal} onHide={() => setshowModal(false)} onSelect={k => weaponDispatch({ key: k })} filter={weaponFilter} weaponFilter={initialWeaponFilter} />
    <CardContent >
      {weaponSheet && weaponUIData && <Grid container spacing={1.5}>
        <Grid item xs={12} sm={3}>
          <Grid container spacing={1.5}>
            <Grid item xs={6} sm={12}>
              <Box component="img" src={img} className={`grad-${weaponSheet.rarity}star`} sx={{ maxWidth: 256, width: "100%", height: "auto", borderRadius: 1 }} />
            </Grid>
            <Grid item xs={6} sm={12}>
              <Typography><small>{weaponSheet.description}</small></Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={9} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box display="flex" gap={1} flexWrap="wrap" justifyContent="space-between">
            <ButtonGroup>
              <Button onClick={() => setshowModal(true)} >{weaponSheet?.name ?? "Select a Weapon"}</Button>
              {weaponSheet?.hasRefinement && <DropdownButton title={`Refinement ${refinement}`}>
                <MenuItem>Select Weapon Refinement</MenuItem>
                <Divider />
                {[...Array(5).keys()].map(key =>
                  <MenuItem key={key} onClick={() => weaponDispatch({ refinement: key + 1 })} selected={refinement === (key + 1)} disabled={refinement === (key + 1)}>
                    {`Refinement ${key + 1}`}
                  </MenuItem>)}
              </DropdownButton>}
              {extraButtons}
            </ButtonGroup>
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap" justifyContent="space-between">
            <ButtonGroup sx={{ bgcolor: t => t.palette.contentLight.main }} >
              <CustomNumberInputButtonGroupWrapper >
                <CustomNumberInput onChange={setLevel} value={level}
                  startAdornment="Lv. "
                  inputProps={{ min: 1, max: 90, sx: { textAlign: "center" } }}
                  sx={{ width: "100%", height: "100%", pl: 2 }}
                />
              </CustomNumberInputButtonGroupWrapper>
              {weaponSheet && <Button sx={{ pl: 1 }} disabled={!weaponSheet.ambiguousLevel(level)} onClick={setAscension}><strong>/ {ascensionMaxLevel[ascension]}</strong></Button>}
              {weaponSheet && <DropdownButton title={"Select Level"} >
                {weaponSheet.milestoneLevels.map(([lv, as]) => {
                  const sameLevel = lv === ascensionMaxLevel[as]
                  const lvlstr = sameLevel ? `Lv. ${lv}` : `Lv. ${lv}/${ascensionMaxLevel[as]}`
                  const selected = lv === level && as === ascension
                  return <MenuItem key={`${lv}/${as}`} selected={selected} disabled={selected} onClick={() => weaponDispatch({ level: lv, ascension: as })}>{lvlstr}</MenuItem>
                })}
              </DropdownButton>}
            </ButtonGroup>

            <Button color="error" onClick={() => id && database.updateWeapon({ lock: !lock }, id)} startIcon={lock ? <Lock /> : <LockOpen />}>
              {lock ? "Locked" : "Unlocked"}
            </Button>
          </Box>
          <Typography><Stars stars={weaponSheet.rarity} /></Typography>
          <Typography variant="subtitle1"><strong>{weaponSheet.passiveName}</strong></Typography>
          <Typography gutterBottom>{weaponSheet.passiveName && weaponSheet.passiveDescription(weaponUIData.get(input.weapon.refineIndex).value)}</Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            <CardDark >
              <CardHeader title={"Main Stats"} titleTypographyProps={{ variant: "subtitle2" }} />
              <Divider />
              <FieldDisplayList>
                {[input.weapon.main, input.weapon.sub, input.weapon.sub2].map((node, i) => {
                  const n = weaponUIData.get(node)
                  if (n.isEmpty || !n.value) return null
                  return <NodeFieldDisplay key={n.info.key} node={n} component={ListItem} />
                })}
              </FieldDisplayList>
            </CardDark>
            {data && weaponSheet.document && <DocumentDisplay sections={weaponSheet.document} />}
          </Box>
        </Grid>
      </Grid>}
    </CardContent>
    {footer && id && <CardContent sx={{ py: 1 }}>
      <Grid container spacing={1}>
        <Grid item flexGrow={1}>
          <CharacterAutocomplete showDefault defaultIcon={<BusinessCenter />} defaultText={t("inventory")} value={location} onChange={equipOnChar} filter={filter} />
        </Grid>
        {!!onClose && <Grid item><CloseButton sx={{ height: "100%" }} large onClick={onClose} /></Grid>}
      </Grid>
    </CardContent>}
  </CardLight ></ModalWrapper>
}
