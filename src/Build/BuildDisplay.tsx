import { faCalculator, faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Close } from '@mui/icons-material';
import { Alert, Box, Button, ButtonGroup, CardContent, Divider, Grid, Link, MenuItem, Skeleton, Typography } from '@mui/material';
import React, { lazy, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactGA from 'react-ga';
import { Link as RouterLink } from 'react-router-dom';
// eslint-disable-next-line
import Worker from "worker-loader!./BuildWorker";
import Artifact from '../Artifact/Artifact';
import { ArtifactSheet } from '../Artifact/ArtifactSheet';
import Character from '../Character/Character';
import CharacterSheet from '../Character/CharacterSheet';
import CardDark from '../Components/Card/CardDark';
import CardLight from '../Components/Card/CardLight';
import CharacterDropdownButton from '../Components/Character/CharacterDropdownButton';
import CloseButton from '../Components/CloseButton';
import DropdownButton from '../Components/DropdownMenu/DropdownButton';
import InfoComponent from '../Components/InfoComponent';
import ModalWrapper from '../Components/ModalWrapper';
import { DatabaseContext } from '../Database/Database';
import { dbStorage } from '../Database/DBStorage';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import usePromise from '../ReactHooks/usePromise';
import { ArtifactsBySlot, Build, BuildSetting } from '../Types/Build';
import { ICachedCharacter } from '../Types/character';
import { allSlotKeys, CharacterKey } from '../Types/consts';
import { ICalculatedStats } from '../Types/stats';
import { deepClone, objectFromKeyMap } from '../Util/Util';
import WeaponSheet from '../Weapon/WeaponSheet';
import { buildContext, calculateTotalBuildNumber, maxBuildsToShowList } from './Build';
import { initialBuildSettings } from './BuildSetting';
import ArtifactBuildDisplayItem from './Components/ArtifactBuildDisplayItem';
import ArtifactConditionalCard from './Components/ArtifactConditionalCard';
import ArtifactSetPicker from './Components/ArtifactSetPicker';
import BonusStatsCard from './Components/BonusStatsCard';
import BuildAlert, { warningBuildNumber } from './Components/BuildAlert';
import CharacterSelectionCard from './Components/CharacterSelectionCard';
import EnemyEditorCard from './Components/EnemyEditorCard';
import HitModeCard from './Components/HitModeCard';
import MainStatSelectionCard, { artifactsSlotsToSelectMainStats } from './Components/MainStatSelectionCard';
import OptimizationTargetSelector from './Components/OptimizationTargetSelector';
import StatFilterCard from './Components/StatFilterCard';
const InfoDisplay = React.lazy(() => import('./InfoDisplay'));

//lazy load the character display
const CharacterDisplayCard = lazy(() => import('../Character/CharacterDisplayCard'))

function buildSettingsReducer(state: BuildSetting, action): BuildSetting {
  switch (action.type) {
    case 'mainStatKey': {
      const { slotKey, mainStatKey } = action
      const mainStatKeys = { ...state.mainStatKeys }//create a new object to update react dependencies

      if (state.mainStatKeys[slotKey].includes(mainStatKey))
        mainStatKeys[slotKey] = mainStatKeys[slotKey].filter(k => k !== mainStatKey)
      else
        mainStatKeys[slotKey].push(mainStatKey)
      return { ...state, mainStatKeys }
    }
    case 'mainStatKeyReset': {
      const { slotKey } = action
      const mainStatKeys = { ...state.mainStatKeys }//create a new object to update react dependencies
      mainStatKeys[slotKey] = []
      return { ...state, mainStatKeys }
    }
    case `setFilter`: {
      const { index, key, num = 0 } = action
      state.setFilters[index] = { key, num }
      return { ...state, setFilters: [...state.setFilters] }//do this because this is a dependency, so needs to be a "new" array
    }
    default:
      break;
  }
  return { ...state, ...action }
}

export default function BuildDisplay({ location: { characterKey: propCharacterKey } }) {
  const database = useContext(DatabaseContext)
  const [characterKey, setcharacterKey] = useState(() => {
    const { characterKey = "" } = dbStorage.get("BuildsDisplay.state") ?? {}
    //NOTE that propCharacterKey can override the selected character.
    return (propCharacterKey ?? characterKey) as CharacterKey | ""
  })

  const [modalBuild, setmodalBuild] = useState(-1) // the index of the newBuild that is being displayed in the character modal,

  const [showCharacterModal, setshowCharacterModal] = useState(false)

  const [generatingBuilds, setgeneratingBuilds] = useState(false)
  const [generationProgress, setgenerationProgress] = useState(0)
  const [generationDuration, setgenerationDuration] = useState(0)//in ms
  const [generationSkipped, setgenerationSkipped] = useState(0)

  const [charDirty, setCharDirty] = useForceUpdate()
  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])

  const [artsDirty, setArtsDirty] = useForceUpdate()

  const isMounted = useRef(false)

  const worker = useRef(null as Worker | null)

  type characterDataType = { character?: ICachedCharacter, characterSheet?: CharacterSheet, weaponSheet?: WeaponSheet, initialStats?: ICalculatedStats, statsDisplayKeys?: { basicKeys: any, [key: string]: any } }
  const [{ character, characterSheet, weaponSheet, initialStats, statsDisplayKeys }, setCharacterData] = useState({} as characterDataType)
  const buildSettings = useMemo(() => character?.buildSettings ?? initialBuildSettings(), [character])
  const { setFilters, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, useExcludedArts, useEquippedArts, builds, buildDate, maxBuildsToShow } = buildSettings

  if (initialStats)
    initialStats.mainStatAssumptionLevel = mainStatAssumptionLevel

  const buildStats = useMemo(() => {
    if (!initialStats || !artifactSheets) return []
    return builds.map(build => {
      const arts = Object.fromEntries(build.map(id => database._getArt(id)).map(art => [art?.slotKey, art]))
      return Character.calculateBuildwithArtifact(initialStats, arts, artifactSheets)
    }).filter(build => build)
  }, [builds, database, initialStats, artifactSheets])

  const noCharacter = useMemo(() => !database._getCharKeys().length, [database])
  const noArtifact = useMemo(() => !database._getArts().length, [database])

  const buildSettingsDispatch = useCallback((action) => {
    if (!character) return
    character.buildSettings = buildSettingsReducer(buildSettings, action)
    database.updateChar(character)
  }, [character, buildSettings, database])

  useEffect(() => ReactGA.pageview('/build'), [])

  //select a new character Key
  const selectCharacter = useCallback((cKey = "") => {
    if (characterKey === cKey) return
    setcharacterKey(cKey)
    setCharDirty()
    setCharacterData({})
  }, [setCharDirty, setcharacterKey, characterKey])

  //load the character data as a whole
  useEffect(() => {
    (async () => {
      if (!characterKey || !artifactSheets) return
      const character = database._getChar(characterKey)
      if (!character) return selectCharacter("")// character is prob deleted.
      const characterSheet = await CharacterSheet.get(characterKey)
      const weapon = database._getWeapon(character.equippedWeapon)
      if (!weapon) return
      const weaponSheet = await WeaponSheet.get(weapon.key)
      if (!characterSheet || !weaponSheet) return
      const initialStats = Character.createInitialStats(character, database, characterSheet, weaponSheet)
      //NOTE: since initialStats are used, there are no inclusion of artifact formulas here.
      const statsDisplayKeys = Character.getDisplayStatKeys(initialStats, { characterSheet, weaponSheet, artifactSheets })
      setCharacterData({ character, characterSheet, weaponSheet, initialStats, statsDisplayKeys })
    })()
  }, [charDirty, characterKey, artifactSheets, database, selectCharacter])

  //register changes in artifact database
  useEffect(() =>
    database.followAnyArt(setArtsDirty),
    [setArtsDirty, database])

  //register changes in character in db
  useEffect(() =>
    characterKey ? database.followChar(characterKey, setCharDirty) : undefined,
    [characterKey, setCharDirty, database])

  //terminate worker when component unmounts
  useEffect(() => () => worker.current?.terminate(), [])

  //save to BuildsDisplay.state on change
  useEffect(() => {
    if (isMounted.current) dbStorage.set("BuildsDisplay.state", { characterKey })
    else isMounted.current = true
  }, [characterKey])

  //validate optimizationTarget 
  useEffect(() => {
    if (!statsDisplayKeys) return
    if (!Array.isArray(optimizationTarget)) return
    for (const sectionKey in statsDisplayKeys) {
      const section = statsDisplayKeys[sectionKey]
      for (const keys of section)
        if (JSON.stringify(keys) === JSON.stringify(optimizationTarget)) return
    }
    buildSettingsDispatch({ optimizationTarget: initialBuildSettings().optimizationTarget })
  }, [optimizationTarget, statsDisplayKeys, buildSettingsDispatch])

  const { split, totBuildNumber } = useMemo(() => {
    if (!characterKey) // Make sure we have all slotKeys
      return { split: objectFromKeyMap(allSlotKeys, () => []) as ArtifactsBySlot, totBuildNumber: 0 }
    const artifactDatabase = database._getArts().filter(art => {
      //if its equipped on the selected character, bypass the check
      if (art.location === characterKey) return true

      if (art.exclude && !useExcludedArts) return false
      if (art.location && !useEquippedArts) return false
      return true
    })
    const split = Artifact.splitArtifactsBySlot(artifactDatabase);
    //filter the split slots on the mainstats selected.
    artifactsSlotsToSelectMainStats.forEach(slotKey =>
      mainStatKeys[slotKey].length && (split[slotKey] = split[slotKey]?.filter((art) => mainStatKeys[slotKey].includes(art.mainStatKey))))
    const totBuildNumber = calculateTotalBuildNumber(split, setFilters)
    return artsDirty && { split, totBuildNumber }
  }, [characterKey, useExcludedArts, useEquippedArts, mainStatKeys, setFilters, artsDirty, database])

  //reset the Alert by setting progress to zero.
  useEffect(() => {
    setgenerationProgress(0)
  }, [totBuildNumber])

  const generateBuilds = useCallback(() => {
    if (!initialStats || !artifactSheets) return
    setgeneratingBuilds(true)
    setgenerationDuration(0)
    setgenerationProgress(0)
    setgenerationSkipped(0)
    //get the formula for this target

    const artifactSetEffects = Artifact.setEffectsObjs(artifactSheets, initialStats)
    const splitArtifacts = deepClone(split) as ArtifactsBySlot
    //add mainStatVal to each artifact
    Object.values(splitArtifacts).forEach(artArr => {
      artArr!.forEach(art => {
        art.mainStatVal = Artifact.mainStatValue(art.mainStatKey, art.rarity, Math.max(Math.min(mainStatAssumptionLevel, art.rarity * 4), art.level)) ?? 0;
      })
    })
    //create an obj with app the artifact set effects to pass to buildworker.
    const data = {
      splitArtifacts, initialStats, artifactSetEffects,
      setFilters, minFilters: statFilters, maxBuildsToShow, optimizationTarget
    };
    worker.current?.terminate()
    worker.current = new Worker()
    worker.current.onmessage = (e) => {
      if (typeof e.data.progress === "number") {
        const { progress, timing = 0, skipped = 0 } = e.data
        setgenerationProgress(progress)
        setgenerationDuration(timing)
        setgenerationSkipped(skipped)
        return
      }
      ReactGA.timing({
        category: "Build Generation",
        variable: "timing",
        value: e.data.timing,
        label: totBuildNumber.toString()
      })
      const builds = (e.data.builds as Build[]).map(b => Object.values(b.artifacts).map(a => a.id))
      buildSettingsDispatch({ builds, buildDate: Date.now() })

      setgeneratingBuilds(false)
      worker.current?.terminate()
      worker.current = null
    };
    worker.current.postMessage(data)
  }, [artifactSheets, split, totBuildNumber, mainStatAssumptionLevel, initialStats, maxBuildsToShow, optimizationTarget, setFilters, statFilters, buildSettingsDispatch])

  const characterName = characterSheet?.name ?? "Character Name"

  const closeBuildModal = useCallback(
    () => {
      setmodalBuild(-1)
      setshowCharacterModal(false)
    },
    [setmodalBuild, setshowCharacterModal],
  )

  return <buildContext.Provider value={{ equippedBuild: initialStats }}>
    <Box display="flex" flexDirection="column" gap={1} sx={{ my: 1 }}>
      <InfoComponent
        pageKey="buildPage"
        modalTitle="Character Management Page Guide"
        text={["For self-infused attacks, like Noelle's Sweeping Time, enable the skill in the character talent page.",
          "You can compare the difference between equipped artifacts and generated builds.",
          "The more complex the formula, the longer the generation time.",]}
      ><InfoDisplay /></InfoComponent>
      <BuildModal {...{ build: buildStats[modalBuild], showCharacterModal, characterKey, selectCharacter, onClose: closeBuildModal }} />
      {noCharacter && <Alert severity="error" variant="filled"> Opps! It looks like you haven't added a character to GO yet! You should go to the <Link component={RouterLink} to="/character">Characters</Link> page and add some!</Alert>}
      {noArtifact && <Alert severity="warning" variant="filled"> Opps! It looks like you haven't added any artifacts to GO yet! You should go to the <Link component={RouterLink} to="/artifact">Artifacts</Link> page and add some!</Alert>}
      {/* Build Generator Editor */}
      <CardDark>
        <CardContent sx={{ py: 1 }}>
          <Typography variant="h6">Build Generator</Typography>
        </CardContent>
        <Divider />
        <CardContent>
          <Grid container spacing={1} >
            {/* Left half */}
            <Grid item xs={12} md={6} lg={5} sx={{
              // select all excluding last
              "> div:nth-last-of-type(n+2)": { mb: 1 }
            }}>
              <CardLight>
                <CardContent>
                  <CharacterDropdownButton fullWidth value={characterKey} onChange={selectCharacter} disabled={generatingBuilds} />
                </CardContent>
              </CardLight>
              {/* character selection */}
              <CharacterSelectionCard characterKey={characterKey} disabled={generatingBuilds} selectCharacter={selectCharacter} />
              {!!character && <BonusStatsCard character={character} />}
              {/* Enemy Editor */}
              {!!character && <EnemyEditorCard character={character} />}
              {/*Minimum Final Stat Filter */}
              {!!statsDisplayKeys && <StatFilterCard statFilters={statFilters} statKeys={statsDisplayKeys?.basicKeys as any}
                setStatFilters={sFs => buildSettingsDispatch({ statFilters: sFs })} disabled={generatingBuilds} />}
              {/* Hit mode options */}
              {characterSheet && character && initialStats && <HitModeCard build={initialStats} character={character} disabled={generatingBuilds} />}
            </Grid>

            {/* Right half */}
            <Grid item xs={12} md={6} lg={7} sx={{
              // select all excluding last
              "> div:nth-last-of-type(n+2)": { mb: 1 }
            }}>
              {!!initialStats && <ArtifactConditionalCard disabled={generatingBuilds} initialStats={initialStats} />}

              {/* Artifact set pickers */}
              {!!initialStats && setFilters.map((setFilter, index) => (index <= setFilters.filter(s => s.key).length) && <ArtifactSetPicker key={index} index={index} setFilters={setFilters}
                disabled={generatingBuilds} initialStats={initialStats} onChange={(index, key, num) => buildSettingsDispatch({ type: 'setFilter', index, key, num })} />)}

              {/* use equipped/excluded */}
              {characterKey && <CardLight><CardContent>
                <Grid container spacing={1}>
                  <Grid item flexGrow={1}>
                    <Button fullWidth onClick={() => buildSettingsDispatch({ useEquippedArts: !useEquippedArts })} disabled={generatingBuilds}>
                      <span><FontAwesomeIcon icon={useEquippedArts ? faCheckSquare : faSquare} /> Use Equipped Artifacts</span>
                    </Button>
                  </Grid>
                  <Grid item flexGrow={1}>
                    <Button fullWidth onClick={() => buildSettingsDispatch({ useExcludedArts: !useExcludedArts })} disabled={generatingBuilds}>
                      <span><FontAwesomeIcon icon={useExcludedArts ? faCheckSquare : faSquare} /> Use Excluded Artifacts</span>
                    </Button>
                  </Grid>
                </Grid>
              </CardContent></CardLight>}

              {/* main stat selector */}
              {characterKey && <MainStatSelectionCard
                mainStatAssumptionLevel={mainStatAssumptionLevel}
                mainStatKeys={mainStatKeys}
                onChangeMainStatKey={(slotKey, mainStatKey = undefined) => {
                  if (mainStatKey === undefined)
                    buildSettingsDispatch({ type: "mainStatKeyReset", slotKey })
                  else
                    buildSettingsDispatch({ type: "mainStatKey", slotKey, mainStatKey })
                }}
                onChangeAssLevel={mainStatAssumptionLevel => buildSettingsDispatch({ mainStatAssumptionLevel })}
                disabled={generatingBuilds}
              />}
            </Grid>
          </Grid>
          {/* Footer */}
          <Grid container spacing={1} sx={{ mt: 1 }}>
            <Grid item flexGrow={1} >
              <ButtonGroup>
                <Button
                  disabled={!characterKey || generatingBuilds}
                  color={(characterKey && totBuildNumber <= warningBuildNumber) ? "success" : "warning"}
                  onClick={generateBuilds}
                  startIcon={<FontAwesomeIcon icon={faCalculator} />}
                >Generate</Button>
                {/* <Tooltip title={<Typography></Typography>} placement="top" arrow> */}
                <DropdownButton disabled={generatingBuilds || !characterKey} title={<span><b>{maxBuildsToShow}</b> {maxBuildsToShow === 1 ? "Build" : "Builds"}</span>}>
                  <MenuItem>
                    <Typography variant="caption" color="info.main">
                      Decreasing the number of generated build will decrease build calculation time for large number of builds.
                    </Typography>
                  </MenuItem>
                  <Divider />
                  {maxBuildsToShowList.map(v => <MenuItem key={v} onClick={() => buildSettingsDispatch({ maxBuildsToShow: v })}>{v} {v === 1 ? "Build" : "Builds"}</MenuItem>)}
                </DropdownButton>
                {/* </Tooltip> */}
                <Button
                  disabled={!generatingBuilds}
                  color="error"
                  onClick={() => {
                    if (!worker.current) return;
                    worker.current.terminate();
                    worker.current = null
                    setgeneratingBuilds(false)
                    setgenerationDuration(0)
                    setgenerationProgress(0)
                    setgenerationSkipped(0)
                  }}
                  startIcon={<Close />}
                >Cancel</Button>
              </ButtonGroup>
            </Grid>
            <Grid item>
              {statsDisplayKeys && characterSheet && weaponSheet && initialStats && <OptimizationTargetSelector {...{ optimizationTarget, setTarget: target => buildSettingsDispatch({ optimizationTarget: target }), initialStats, characterSheet, weaponSheet, artifactSheets, statsDisplayKeys, disabled: !!generatingBuilds }} />}
            </Grid>
          </Grid>

          {!!characterKey && <Box sx={{ mt: 1 }} >
            <BuildAlert {...{ totBuildNumber, generatingBuilds, generationSkipped, generationProgress, generationDuration, characterName, maxBuildsToShow }} />
          </Box>}

        </CardContent>
      </CardDark>
      <CardDark>
        <CardContent>
          <Typography>
            {buildStats ? <span>Showing <strong>{buildStats.length}</strong> Builds generated for {characterName}. {!!buildDate && <span>Build generated on: <strong>{(new Date(buildDate)).toLocaleString()}</strong></span>}</span>
              : <span>Select a character to generate builds.</span>}
          </Typography>
        </CardContent>
      </CardDark>
      <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={600} />}>
        {/* Build List */}
        {buildStats?.map((build, index) =>
          characterSheet && weaponSheet && artifactSheets && <ArtifactBuildDisplayItem sheets={{ characterSheet, weaponSheet, artifactSheets }} build={build} characterKey={characterKey as CharacterKey} index={index} key={Object.values(build.equippedArtifacts ?? {}).join()} statsDisplayKeys={statsDisplayKeys} onClick={() => setmodalBuild(index)} />
        )}
      </Suspense>
    </Box>
  </buildContext.Provider>
}

function BuildModal({ build, showCharacterModal, characterKey, selectCharacter, onClose }) {
  return <ModalWrapper open={!!(showCharacterModal || build)} onClose={onClose} containerProps={{ maxWidth: "xl" }}>
    <CharacterDisplayCard
      characterKey={characterKey}
      setCharacterKey={selectCharacter}
      newBuild={build}
      onClose={onClose}
      footer={<CloseButton large onClick={onClose} />} />
  </ModalWrapper>
}
