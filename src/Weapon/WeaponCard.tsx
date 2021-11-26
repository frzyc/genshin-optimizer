import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Lock, LockOpen } from "@mui/icons-material"
import { Box, Button, ButtonGroup, CardActionArea, CardContent, CardHeader, Grid, IconButton, Skeleton, Typography } from "@mui/material"
import { Suspense, useCallback, useContext } from "react"
import Assets from "../Assets/Assets"
import CharacterSheet from "../Character/CharacterSheet"
import CardLight from "../Components/Card/CardLight"
import CharacterDropdownButton from '../Components/Character/CharacterDropdownButton'
import LocationName from "../Components/Character/LocationName"
import ConditionalWrapper from "../Components/ConditionalWrapper"
import ImgIcon from "../Components/Image/ImgIcon"
import { Stars } from "../Components/StarDisplay"
import StatIcon from "../Components/StatIcon"
import { ascensionMaxLevel } from "../Data/LevelData"
import { DatabaseContext } from "../Database/Database"
import usePromise from "../ReactHooks/usePromise"
import useWeapon from "../ReactHooks/useWeapon"
import Stat from "../Stat"
import { CharacterKey } from "../Types/consts"
import WeaponSheet from "./WeaponSheet"

type WeaponCardProps = { weaponId: string, onClick?: (weaponId: string) => void, onEdit?: (weaponId: string) => void, onDelete?: (weaponId: string) => void, canEquip?: boolean }
export default function WeaponCard({ weaponId, onClick, onEdit, onDelete, canEquip = false }: WeaponCardProps) {
  const database = useContext(DatabaseContext)
  const databaseWeapon = useWeapon(weaponId)
  const weapon = databaseWeapon
  const weaponSheet = usePromise(weapon?.key && WeaponSheet.get(weapon.key), [weapon?.key])

  const filter = useCallback(
    (cs: CharacterSheet) => cs.weaponTypeKey === weaponSheet?.weaponType,
    [weaponSheet],
  )

  const actionWrapperFunc = useCallback(
    children => <CardActionArea onClick={() => onClick?.(weaponId)} sx={{ height: "100%" }}>{children}</CardActionArea>,
    [onClick, weaponId],
  )

  const equipOnChar = useCallback((charKey: CharacterKey | "") => database.setWeaponLocation(weaponId, charKey), [database, weaponId],)
  if (!weapon || !weaponSheet) return null;
  const { level, ascension, refinement, id, location = "", lock } = weapon


  const weaponTypeKey = weaponSheet.weaponType
  const weaponMainVal = weaponSheet.getMainStatValue(level, ascension).toFixed(Stat.fixedUnit("atk"))
  const weaponSubKey = weaponSheet.getSubStatKey()
  const weaponSubVal = weaponSheet.getSubStatValue(level, ascension).toFixed(Stat.fixedUnit(weaponSubKey))
  const weaponPassiveName = weaponSheet?.passiveName
  const statMap = [["weaponATK", weaponMainVal]]
  weaponPassiveName && statMap.push([weaponSubKey, weaponSubVal])
  const img = ascension < 2 ? weaponSheet?.img : weaponSheet?.imgAwaken

  return <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 300 }} />}>
    <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
      <CardLight sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div className={`grad-${weaponSheet.rarity}star`} >
          <CardHeader title={weaponSheet.name} avatar={<ImgIcon sx={{ fontSize: "2em" }} src={Assets.weaponTypes?.[weaponTypeKey]} />} titleTypographyProps={{ variant: "h6" }}
            action={!onClick && <IconButton color="primary" onClick={() => database.updateWeapon({ lock: !lock }, id)}>
              {lock ? <Lock /> : <LockOpen />}
            </IconButton>} />
          <Grid container sx={{ flexWrap: "nowrap", pl: 2 }}>
            <Grid item flexGrow={1}>
              <Typography component="span" variant="h4">Lv. {level}</Typography>
              <Typography component="span" variant="h4" color="text.secondary">/{ascensionMaxLevel[ascension]}</Typography>
              <Typography variant="h6">Refinement <strong>{refinement}</strong></Typography>
              <Typography><Stars stars={weaponSheet.rarity} colored /></Typography>
            </Grid>
            {/* use flex-end here to align the image to the bottom. */}
            <Grid item container maxWidth="40%" alignContent="flex-end" sx={{ mt: -3 }}>
              <Box component="img" src={img} width="100%" height="auto" />
            </Grid>
          </Grid>
        </div>
        <CardContent>
          {statMap.map(([statKey, statVal]) => {
            let unit = Stat.getStatUnit(statKey)
            return <Box key={statKey} sx={{ display: "flex" }}>
              <Typography flexGrow={1}>{StatIcon[statKey]} {Stat.getStatName(statKey)}</Typography>
              <Typography>{statVal + unit}</Typography>
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