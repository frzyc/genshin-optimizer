import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Lock, LockOpen } from "@mui/icons-material"
import { Box, Button, ButtonGroup, CardActionArea, CardContent, CardHeader, CardMedia, Grid, IconButton, Skeleton, Typography } from "@mui/material"
import { Suspense, useCallback, useContext, useMemo } from "react"
import Assets from "../Assets/Assets"
import CharacterSheet from "../Data/Characters/CharacterSheet"
import CardLight from "../Components/Card/CardLight"
import CharacterDropdownButton from '../Components/Character/CharacterDropdownButton'
import LocationName from "../Components/Character/LocationName"
import ConditionalWrapper from "../Components/ConditionalWrapper"
import ImgIcon from "../Components/Image/ImgIcon"
import { Stars } from "../Components/StarDisplay"
import StatIcon from "../Components/StatIcon"
import { ascensionMaxLevel } from "../Data/LevelData"
import { DatabaseContext } from "../Database/Database"
import { uiInput as input } from "../Formula"
import { computeUIData, dataObjForWeapon } from "../Formula/api"
import usePromise from "../ReactHooks/usePromise"
import useWeapon from "../ReactHooks/useWeapon"
import KeyMap, { valueString } from "../KeyMap"
import { CharacterKey } from "../Types/consts"
import WeaponSheet from "../Data/Weapons/WeaponSheet"

type WeaponCardProps = { weaponId: string, onClick?: (weaponId: string) => void, onEdit?: (weaponId: string) => void, onDelete?: (weaponId: string) => void, canEquip?: boolean }
export default function WeaponCard({ weaponId, onClick, onEdit, onDelete, canEquip = false }: WeaponCardProps) {
  const { database } = useContext(DatabaseContext)
  const databaseWeapon = useWeapon(weaponId)
  const weapon = databaseWeapon
  const weaponSheet = usePromise(weapon?.key ? WeaponSheet.get(weapon.key) : undefined, [weapon?.key])

  const filter = useCallback(
    (cs: CharacterSheet) => cs.weaponTypeKey === weaponSheet?.weaponType,
    [weaponSheet],
  )

  const actionWrapperFunc = useCallback(
    children => <CardActionArea onClick={() => onClick?.(weaponId)} sx={{ height: "100%" }}>{children}</CardActionArea>,
    [onClick, weaponId],
  )

  const equipOnChar = useCallback((charKey: CharacterKey | "") => database.setWeaponLocation(weaponId, charKey), [database, weaponId],)

  const UIData = useMemo(() => weaponSheet && weapon && computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]), [weaponSheet, weapon])

  if (!weapon || !weaponSheet || !UIData) return null;
  const { level, ascension, refinement, id, location = "", lock } = weapon
  const weaponTypeKey = UIData.get(input.weapon.type).value!
  const stats = [input.weapon.main, input.weapon.sub, input.weapon.sub2].map(x => UIData.get(x))
  const img = ascension < 2 ? weaponSheet?.img : weaponSheet?.imgAwaken

  return <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 300 }} />}>
    <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
      <CardLight sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box className={`grad-${weaponSheet.rarity}star`} sx={{ position: "relative" }}>
          {!onClick && <IconButton color="primary" onClick={() => database.updateWeapon({ lock: !lock }, id)} sx={{ position: "absolute", right: 0, bottom: 0, }}>
            {lock ? <Lock /> : <LockOpen />}
          </IconButton>}
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <CardHeader sx={{ pb: 1 }} title={weaponSheet.name} avatar={<ImgIcon sx={{ fontSize: "1.5em" }} src={Assets.weaponTypes?.[weaponTypeKey]} />} titleTypographyProps={{ variant: "subtitle1" }} />
            <Box sx={{ px: 2, }}>
              <Typography component="span" variant="h5">Lv. {level}</Typography>
              <Typography component="span" variant="h5" color="text.secondary">/{ascensionMaxLevel[ascension]}</Typography>
              <Typography variant="h6">Refinement <strong>{refinement}</strong></Typography>
              <Typography><Stars stars={weaponSheet.rarity} colored /></Typography>
            </Box>
          </Box>
          <Box sx={{ height: "100%", position: "absolute", right: 0, top: 0 }}>
            <CardMedia
              component="img"
              image={img ?? ""}
              width="auto"
              height="100%"
              sx={{ float: "right" }}
            />
          </Box>
        </Box>
        <CardContent>
          {stats.map(node => {
            if (!node.info.key) return null
            const displayVal = valueString(node.value, node.unit, !node.unit ? 0 : undefined)
            return <Box key={node.info.key} sx={{ display: "flex" }}>
              <Typography flexGrow={1}>{StatIcon[node.info.key!]} {KeyMap.get(node.info.key)}</Typography>
              <Typography>{displayVal}</Typography>
            </Box>
          })}
        </CardContent>
        {/* grow to fill the 100% heigh */}
        <Box flexGrow={1} />
        <CardContent sx={{ py: 1 }}>
          <Grid container sx={{ flexWrap: "nowrap" }} >
            <Grid item xs="auto" flexShrink={1}>
              {canEquip ? <CharacterDropdownButton size="small" noUnselect inventory value={location} onChange={equipOnChar} filter={filter} /> : <LocationName location={location} />}
            </Grid>
            <Grid item flexGrow={1} sx={{ mr: 1 }} />
            <Grid item xs="auto">
              <ButtonGroup sx={{ height: "100%" }}>
                {!!onEdit && <Button color="info" size="small" onClick={() => onEdit(id)} >
                  <FontAwesomeIcon icon={faEdit} className="fa-fw" />
                </Button>}
                {!!onDelete && <Button color="error" size="small" onClick={() => onDelete(id)} disabled={!!location || lock} >
                  <FontAwesomeIcon icon={faTrashAlt} className="fa-fw" />
                </Button>}
              </ButtonGroup>
            </Grid>
          </Grid>
        </CardContent>

      </CardLight>
    </ConditionalWrapper>
  </Suspense>
}
