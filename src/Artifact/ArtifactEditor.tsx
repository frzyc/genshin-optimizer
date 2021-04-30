import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useMemo, useReducer } from 'react';
import { Alert, Badge, Button, ButtonGroup, Card, Col, Dropdown, DropdownButton, FormControl, InputGroup, OverlayTrigger, Popover, Row } from 'react-bootstrap';
import CustomFormControl from '../Components/CustomFormControl';
import { Stars } from '../Components/StarDisplay';
import { allSubstats, IArtifact, Substat, SubstatKey } from '../Types/artifact';
import ArtifactDatabase from '../Database/ArtifactDatabase';
import Stat from '../Stat';
import { valueString } from '../Util/UIUtil';
import { clamp, deepClone, getRandomElementFromArray, getRandomIntInclusive } from '../Util/Util';
import Artifact from './Artifact';
import ArtifactCard from './ArtifactCard';
import PercentBadge from './PercentBadge';
import UploadDisplay from './UploadDisplay';
import { allArtifactSets, Rarity, SlotKey } from '../Types/consts';
import { ArtifactSheet } from './ArtifactSheet';
import { usePromise } from '../Util/ReactUtil';

let uploadDisplayReset
export default function ArtifactEditor({ artifactIdToEdit, cancelEdit }) {
  const [artifact, artifactDispatch] = useReducer(artifactReducer, undefined)
  const artifactInEditor = useMemo(() => !ArtifactDatabase.isInvalid(artifact), [artifact])
  const artifactSheets = usePromise(ArtifactSheet.getAll())
  const sheet = artifact ? artifactSheets?.[artifact.setKey] : undefined

  useEffect(() => {
    if (artifactIdToEdit && artifactIdToEdit !== artifact?.id)
      artifactDispatch({ type: "overwrite", artifact: deepClone(ArtifactDatabase.get(artifactIdToEdit)) })
  }, [artifactIdToEdit, artifact?.id])

  const getUpdloadDisplayReset = reset => uploadDisplayReset = reset

  const reset = () => {
    cancelEdit?.();
    uploadDisplayReset?.()
    artifactDispatch({ type: "reset" })
  }
  const update = (newValue: Partial<IArtifact>) => {
    const newSheet = newValue.setKey ? artifactSheets![newValue.setKey] : sheet!

    function pick<T>(value: T | undefined, available: readonly T[], prefer?: T): T {
      return (value && available.includes(value)) ? value : (prefer ?? available[0])
    }

    if (newValue.setKey) {
      newValue.numStars = pick(artifact?.numStars, newSheet.rarity, Math.max(...newSheet.rarity) as Rarity)
      newValue.slotKey = pick(artifact?.slotKey, Object.keys(newSheet.slotNames))
    }
    if (newValue.numStars)
      newValue.level = artifact?.level ?? 0
    if (newValue.level)
      newValue.level = clamp(newValue.level, 0, 4 * (newValue.numStars ?? artifact!.numStars))
    if (newValue.slotKey)
      newValue.mainStatKey = pick(artifact?.mainStatKey, Artifact.slotMainStats(newValue.slotKey))

    if (newValue.mainStatKey) {
      newValue.substats = [0, 1, 2, 3].map(i =>
        (artifact && artifact.substats[i].key !== newValue.mainStatKey) ? artifact!.substats[i] : { key: "", value: 0 })
    }
    artifactDispatch({ type: "update", artifact: newValue })
  }
  const setSubstat = (index: number, substat: Substat) => {
    artifactDispatch({ type: "substat", index, substat })
  }

  const { dupId, isDup } = useMemo(() => checkDuplicate(artifact), [artifact])
  const { numStars = 5, level = 0, slotKey = "flower" } = artifact ?? {}
  const errMsgs = artifact ? Artifact.substatsValidation(artifact) : []
  return <Card bg="darkcontent" text={"lightfont" as any}>
    <Card.Header>Artifact Editor</Card.Header>
    <Card.Body>
      <Row>
        {/* Left column */}
        <Col xs={12} lg={6}>
          {/* set & rarity */}
          <InputGroup className="w-100 d-flex mb-2">
            {/* Artifact Set */}
            <Dropdown as={InputGroup.Prepend} className="flex-grow-1">
              <Dropdown.Toggle className="w-100" variant={artifact ? "success" : "primary"}>
                {sheet?.name ?? "Artifact Set"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {artifactSheets && ArtifactSheet.namesByMaxRarities(artifactSheets).map(([rarity, sets], i) =>
                  <React.Fragment key={rarity}>
                    {i > 0 && <Dropdown.Divider />}
                    <Dropdown.ItemText>Max Rarity <Stars stars={rarity} /></Dropdown.ItemText>
                    {sets.map(([setKey, name]) =>
                      <Dropdown.Item key={setKey} onClick={() => update({ setKey })}>
                        {name}
                      </Dropdown.Item >)}
                  </React.Fragment>)}
              </Dropdown.Menu>
            </Dropdown>
            {/* rarity dropdown */}
            <DropdownButton as={InputGroup.Append} title={artifact ? <Stars stars={numStars} /> : "Rarity"} disabled={!sheet} variant={artifact ? "success" : "primary"}>
              {([5, 4, 3] as Rarity[]).map((numStars, index) => <Dropdown.Item key={index} disabled={!sheet?.rarity.includes(numStars)} onClick={() => update({ numStars })}>
                {<Stars stars={numStars} />}
              </Dropdown.Item>)}
            </DropdownButton>
          </InputGroup>

          {/* level */}
          <InputGroup className="mb-2">
            <InputGroup.Prepend>
              <InputGroup.Text>Level</InputGroup.Text>
            </InputGroup.Prepend>
            <CustomFormControl value={level} disabled={!sheet} placeholder={`0~${numStars * 4}`} onChange={l => update({ level: l })} />
            <InputGroup.Append>
              <Button onClick={() => update({ level: 0 })} disabled={!sheet || level === 0}>0</Button>
              <Button onClick={() => update({ level: level - 1 })} disabled={!sheet || level === 0}>-</Button>
              <Button onClick={() => update({ level: level + 1 })} disabled={!sheet || level === (numStars * 4)}>+</Button>
              <Button onClick={() => update({ level: numStars * 4 })} disabled={!sheet || level === (numStars * 4)}>{numStars * 4}</Button>
            </InputGroup.Append>
          </InputGroup>

          {/* slot */}
          <InputGroup className="mb-2">
            <DropdownButton
              title={Artifact.slotNameWithIcon(slotKey)}
              disabled={!sheet}
              variant={artifact ? "success" : "primary"}
              as={InputGroup.Prepend}
            >
              {Object.keys(sheet?.slotNames ?? {}).map((sKey: SlotKey) =>
                <Dropdown.Item key={sKey as any} onClick={() => update({ slotKey: sKey })} >
                  {Artifact.slotNameWithIcon(sKey)}
                </Dropdown.Item>)}
            </DropdownButton>
            <FormControl
              value={sheet?.slotNames[artifact!.slotKey] ?? "Unknown Piece Name"}
              disabled
              readOnly
            />
          </InputGroup>

          {/* main stat */}
          <InputGroup className="mb-2">
            <DropdownButton
              title={<b>{artifact ? Stat.getStatNameWithPercent(artifact.mainStatKey) : "Main Stat"}</b>}
              disabled={!sheet}
              variant={artifact ? "success" : "primary"}
              as={InputGroup.Prepend}
            >
              <Dropdown.ItemText>Select a Main Artifact Stat </Dropdown.ItemText>
              {Artifact.slotMainStats(slotKey).map(mainStatK =>
                <Dropdown.Item key={mainStatK} onClick={() => update({ mainStatKey: mainStatK })} >
                  {Stat.getStatNameWithPercent(mainStatK)}
                </Dropdown.Item>)}
            </DropdownButton>
            <FormControl
              value={artifact ? `${Artifact.mainStatValue(artifact.mainStatKey, numStars, level)}${Stat.getStatUnit(artifact.mainStatKey)}` : "Main Stat"}
              disabled
              readOnly
            />
          </InputGroup>

          {/* Current Substat Efficiency */}
          <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
            <Card.Body className="py-1 px-2">
              <Row>
                <Col className="text-center"><span >Current Substat Efficiency </span></Col>
                <Col xs="auto">
                  <PercentBadge valid={!errMsgs.length} value={errMsgs.length ? "ERR" : (artifact?.currentEfficiency ?? 0)} />
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Popover id="current-efficiency">
                      <Popover.Title as="h5">Current Substat Efficiency</Popover.Title>
                      <Popover.Content>
                        <span>Every 4 artifact upgrades, you get a substat roll. <strong>Substat Efficiency</strong> calculates how high the substat rolled as a percentage.</span>
                      </Popover.Content>
                    </Popover>}
                  >
                    <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
                  </OverlayTrigger>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Maximum Substat Efficiency */}
          <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
            <Card.Body className="py-1 px-2">
              <Row>
                <Col className="text-center"><span>Maximum Substat Efficiency </span></Col>
                <Col xs="auto">
                  <PercentBadge valid={!errMsgs.length} value={errMsgs.length ? "ERR" : (artifact?.maximumEfficiency ?? 0)} />
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Popover id="max-efficiency">
                      <Popover.Title as="h5">Maximum Substat Efficiency</Popover.Title>
                      <Popover.Content>
                        <span>The <strong>Maximum Substat Efficiency</strong> of an artifact calculates the efficiency if the remaining upgrades rolled their maximum values.</span>
                      </Popover.Content>
                    </Popover>}
                  >
                    <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
                  </OverlayTrigger>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Right column */}
        <Col xs={12} lg={6}>
          {/* substat selections */}
          {[0, 1, 2, 3].map((index) =>
            <SubstatInput key={"substat" + index} className="mb-2" {...{ index, artifact, setSubstat }} />
          )}
        </Col>
      </Row>
      <Row className="mb-n2">
        {/* Image OCR */}
        <Col xs={12} className="mb-2">
          {/* TODO: artifactDispatch not overwrite */}
          <UploadDisplay setState={state => artifactDispatch({ type: "overwrite", artifact: state })} setReset={getUpdloadDisplayReset} artifactInEditor={artifactInEditor} />
        </Col>
        {/* Duplicate/Updated/Edit UI */}
        {(dupId || artifact?.id) && <Col xs={12} className="mb-2">
          <Row className="d-flex justify-content-around mb-n2">
            <Col lg={4} md={6} className="mb-2">
              <h6 className="text-center">Artifact Editor Preview</h6>
              <div><ArtifactCard artifactObj={artifact} /></div>
            </Col>
            <Col lg={4} md={6} className="mb-2">
              <h6 className="text-center">{dupId ? `Detected ${isDup ? "Duplicate" : "Upgraded"} Artifact` : `Before Edit`}</h6>
              <div><ArtifactCard artifactId={dupId || artifact?.id} /></div>
            </Col>
          </Row>
        </Col>}
        {/* Error alert */}
        {Boolean(errMsgs.length) && <Col xs={12} className="mb-2">
          <Alert variant="danger" className="py-2 px-3 mb-0 ">{errMsgs.map((e, i) => <div key={i}>{e}</div>)}</Alert>
        </Col>}
      </Row></Card.Body>
    <Card.Footer>
      <Button className="mr-2" onClick={() => { saveArtifact(artifact!, artifact!.id); reset() }} disabled={ArtifactDatabase.isInvalid(artifact) || errMsgs.length} variant={dupId ? "warning" : "primary"}>
        {artifact?.id ? "Save Artifact" : "Add Artifact"}
      </Button>
      <Button className="mr-2" disabled={!artifactInEditor} onClick={() => { canClearArtifact() && reset() }} variant="success">Clear</Button>
      {process.env.NODE_ENV === "development" && <Button variant="info" onClick={async () => artifactDispatch({ type: "overwrite", artifact: await randomizeArtifact() })}>Randomize</Button>}
      {Boolean(dupId) && <Button className="float-right" onClick={() => { saveArtifact(artifact!, dupId); reset() }} disabled={ArtifactDatabase.isInvalid(artifact) || errMsgs.length} variant="success">Update Artifact</Button>}
    </Card.Footer>
  </Card >
}

function SubstatInput({ index, artifact, setSubstat, className }: { index: number, artifact: IArtifact | undefined, setSubstat: (index: number, substat: Substat) => void, className }) {
  const { mainStatKey = "", substats = [] } = artifact ?? {}
  const { key = "", value = 0, rolls = [], efficiency = 0 } = artifact?.substats[index] ?? {}

  const accurateValue = rolls.reduce((a, b) => a + b, 0)
  const unit = Stat.getStatUnit(key), rollNum = rolls.length

  let error: string = "", rollData: number[] = [], allowedRolls = 0, rollLabel: Displayable | null = null

  if (artifact) {
    //account for the rolls it will to fill all 4 substates, +1 for its base roll
    const numStars = artifact.numStars
    const { numUpgrades, high } = Artifact.rollInfo(numStars)
    const maxRollNum = numUpgrades + high - 3;
    allowedRolls = maxRollNum - rollNum
    rollData = Artifact.getSubstatRollData(key, numStars)
  }
  const rollOffset = 7 - rollData.length

  if (!rollNum && key && value) error = error || `Cannot calculate stat rolls.`
  if (allowedRolls < 0) error = error || `Substat cannot be rolled more than ${allowedRolls + rollNum} times.`

  if (!error) {
    const rollBadge = <Badge variant={rollNum === 0 ? "secondary" : `${rollNum}roll`} className="text-darkcontent">
      {rollNum ? rollNum : "No"} Roll{(rollNum > 1 || rollNum === 0) && "s"}
    </Badge>
    const rollArr = rolls.map((val, i) =>
      <span key={i} className={`mr-2 text-${rollOffset + rollData.indexOf(val)}roll`}>{valueString(val, unit)}</span>)

    rollLabel = <Row>
      <Col>{rollBadge} {rollArr}</Col>
      <Col xs="auto">Efficiency: <PercentBadge valid={true} value={efficiency ? efficiency : "No Stat"} /></Col>
    </Row>
  }

  return <Card bg="lightcontent" text={"lightfont" as any} className={className}>
    <InputGroup>
      <DropdownButton
        title={Stat.getStatNameWithPercent(key, `Substat ${index + 1}`)}
        disabled={!artifact}
        variant={key ? "success" : "primary"}
        as={InputGroup.Prepend}
      >
        {Boolean(key) && <Dropdown.Item key={key} onClick={() => setSubstat(index, { key: "", value: 0 })}>No Substat</Dropdown.Item>}
        {allSubstats
          .filter(key => mainStatKey !== key && substats.every(other => other.key !== key))
          .map(key =>
            <Dropdown.Item key={key} onClick={() => setSubstat(index, { key, value: 0 })} >
              {Stat.getStatNameWithPercent(key)}
            </Dropdown.Item>
          )}
      </DropdownButton>
      <CustomFormControl
        float={unit === "%"}
        placeholder="Select a Substat."
        value={key ? value : ""}
        onChange={(value) => setSubstat(index, { key, value })}
        disabled={!key}
        allowEmpty
      />
      {<ButtonGroup size="sm" as={InputGroup.Append}>
        {rollData.map((v, i) => {
          const newValue = valueString(accurateValue + v, unit)
          return <Button key={i} variant={`${rollOffset + i}roll`} className="py-0 text-darkcontent" disabled={(value && !rollNum) || allowedRolls <= 0} onClick={() => setSubstat(index, { key, value: parseFloat(newValue) })}>{newValue}</Button>
        })}
      </ButtonGroup>}
    </InputGroup>
    <div className="p-1">{error && <Badge variant="danger">ERR</Badge>}{error || rollLabel}</div>
  </Card >
}

type ResetMessage = { type: "reset" }
type SubstatMessage = { type: "substat", index: number, substat: Substat }
type OverwriteMessage = { type: "overwrite", artifact: IArtifact }
type UpdateMessage = { type: "update", artifact: Partial<IArtifact> }
type Message = ResetMessage | SubstatMessage | OverwriteMessage | UpdateMessage
export function artifactReducer(state: IArtifact | undefined, action: Message): IArtifact | undefined {
  switch (action.type) {
    case "reset": return
    case "substat": {
      const { index, substat } = action
      state!.substats[index] = substat
      return { ...state! }
    }
    case "overwrite": return action.artifact
    case "update": return { ...state!, ...action.artifact }
  }
}

function checkDuplicate(editorArt: IArtifact | undefined): { dupId?: string, isDup: boolean } {
  if (!editorArt) return { isDup: false }
  const { id, setKey, numStars, level, slotKey, mainStatKey, substats } = editorArt
  if (id) return { isDup: false }

  //check for a "upgrade" or duplicate
  const artifacts = Object.values(ArtifactDatabase.getArtifactDatabase()).filter(candidate =>
    setKey === candidate.setKey &&
    numStars === candidate.numStars &&
    slotKey === candidate.slotKey &&
    mainStatKey === candidate.mainStatKey &&
    level >= candidate.level &&
    candidate.substats.every(candidateSubstat =>
      !candidateSubstat.key || substats.some(substat =>
        substat.key === candidateSubstat.key &&
        substat.value >= candidateSubstat.value
      )))
  if (!artifacts.length) return { isDup: false }

  const dupArtifacts = artifacts.filter(candidate =>
    level === candidate.level &&
    substats.every(substat =>
      !substat.key || candidate.substats.some(candidateSubstat =>
        substat.key === candidateSubstat.key &&
        substat.value === candidateSubstat.value
      )))

  const dupId = dupArtifacts[0]?.id! ?? artifacts[0].id!
  return { dupId, isDup: dupArtifacts.length > 0 }
}

async function randomizeArtifact(): Promise<IArtifact> {
  const set = getRandomElementFromArray(allArtifactSets)
  const sheet = await ArtifactSheet.get(set)!
  const rarity = getRandomElementFromArray(sheet.rarity)
  const slot = getRandomElementFromArray(Object.keys(sheet.slotNames))
  const mainStatKey = getRandomElementFromArray(Artifact.slotMainStats(slot))
  const level = getRandomIntInclusive(0, rarity * 4)
  const substats: Substat[] = [0, 1, 2, 3].map(i => ({ key: "", value: 0 }))

  const { low, high } = Artifact.rollInfo(rarity)
  const totRolls = Math.floor(level / 4) + getRandomIntInclusive(low, high)
  const numOfInitialSubstats = Math.min(totRolls, 4)
  const numUpgradesOrUnlocks = totRolls - numOfInitialSubstats

  const RollStat = (substat: SubstatKey): number =>
    getRandomElementFromArray(Artifact.getSubstatRollData(substat, rarity))

  let remainingSubstats = allSubstats.filter(key => mainStatKey !== key)
  for (const substat of substats.slice(0, numOfInitialSubstats)) {
    substat.key = getRandomElementFromArray(remainingSubstats)
    substat.value = RollStat(substat.key)
    remainingSubstats = remainingSubstats.filter(key => key !== substat.key)
  }
  for (let i = 0; i < numUpgradesOrUnlocks; i++) {
    let substat = getRandomElementFromArray(substats)
    substat.value += RollStat(substat.key as any)
  }
  for (const substat of substats)
    if (substat.key)
      substat.value = parseFloat(valueString(substat.value, Stat.getStatUnit(substat.key)))

  return {
    setKey: set, numStars: rarity, slotKey: slot, mainStatKey, level, substats, mainStatVal: Artifact.mainStatValue(mainStatKey, rarity, level)!, location: "", lock: false
  }
}

const saveArtifact = (artifact: IArtifact, id: string | undefined) => {
  const artToSave = deepClone(artifact)
  if (id) {
    const art = ArtifactDatabase.get(id)
    if (art) {
      artToSave.id = art.id
      artToSave.location = art.location
    }
  }
  ArtifactDatabase.update(artToSave)
}
const canClearArtifact = (): boolean => window.confirm("There is an artifact in editor. Are you sure you want to clear the editor?")
