import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { Alert, Badge, Button, ButtonGroup, Card, Col, Dropdown, DropdownButton, FormControl, InputGroup, OverlayTrigger, Popover, Row } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import CustomFormControl from '../Components/CustomFormControl';
import { Stars } from '../Components/StarDisplay';
import { database } from '../Database/Database';
import { validateFlexArtifact } from '../Database/validation';
import Stat from '../Stat';
import { allSubstats, IArtifact, Substat } from '../Types/artifact';
import { Rarity, SlotKey } from '../Types/consts';
import { randomizeArtifact } from '../Util/ArtifactUtil';
import { usePromise } from '../Util/ReactUtil';
import { valueString } from '../Util/UIUtil';
import { clamp, deepClone } from '../Util/Util';
import Artifact from './Artifact';
import ArtifactCard from './ArtifactCard';
import { ArtifactSheet } from './ArtifactSheet';
import ArtifactSetDropDownMenuFragment from './Component/ArtifactSetDropDownMenuFragment';
import SlotNameWithIcon from './Component/SlotNameWIthIcon';
import PercentBadge from './PercentBadge';
import UploadDisplay from './UploadDisplay';

type ArtifactEditorArgument = { artifactIdToEdit: string, cancelEdit: () => void }
const allSubstatFilter = new Set(allSubstats)

let uploadDisplayReset: (() => void) | undefined
export default function ArtifactEditor({ artifactIdToEdit, cancelEdit }: ArtifactEditorArgument) {
  const { t } = useTranslation("artifact")
  const [artifact, artifactDispatch] = useReducer(artifactReducer, undefined)
  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])

  const artifactInEditor = artifact !== undefined
  const sheet = artifact ? artifactSheets?.[artifact.setKey] : undefined

  useEffect(() => {
    if (artifactIdToEdit && artifactIdToEdit !== artifact?.id) {
      const databaseArtifact = database._getArt(artifactIdToEdit)
      if (databaseArtifact)
        artifactDispatch({ type: "overwrite", artifact: deepClone(databaseArtifact) })
    }
  }, [artifactIdToEdit, artifact?.id])

  const getUpdloadDisplayReset = (reset: () => void) => uploadDisplayReset = reset

  const reset = useCallback(() => {
    cancelEdit?.();
    uploadDisplayReset?.()
    artifactDispatch({ type: "reset" })
  }, [cancelEdit, artifactDispatch])
  const update = useCallback((newValue: Partial<IArtifact>) => {
    const newSheet = newValue.setKey ? artifactSheets![newValue.setKey] : sheet!

    function pick<T>(value: T | undefined, available: readonly T[], prefer?: T): T {
      return (value && available.includes(value)) ? value : (prefer ?? available[0])
    }

    if (newValue.setKey) {
      newValue.numStars = pick(artifact?.numStars, newSheet.rarity, Math.max(...newSheet.rarity) as Rarity)
      newValue.slotKey = pick(artifact?.slotKey, newSheet.slots)
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
  }, [artifact, artifactSheets, sheet, artifactDispatch])
  const setSubstat = useCallback((index: number, substat: Substat) => {
    artifactDispatch({ type: "substat", index, substat })
  }, [artifactDispatch])
  const isValid = artifact ? !validateFlexArtifact(artifact).errors.length : false
  const canClearArtifact = (): boolean => window.confirm(t`editor.clearPrompt` as string)
  const { dupId, isDup } = useMemo(() => checkDuplicate(artifact), [artifact])
  const { numStars = 5, level = 0, slotKey = "flower" } = artifact ?? {}
  const errMsgs = artifact ? Artifact.substatsValidation(artifact) : []
  const { currentEfficiency = 0, maxEfficiency = 0 } = artifact ? Artifact.getArtifactEfficiency(artifact, allSubstatFilter) : {}
  return <Card bg="darkcontent" text={"lightfont" as any}>
    <Card.Header><Trans t={t} i18nKey="editor.title" >Artifact Editor</Trans></Card.Header>
    <Card.Body>
      <Row>
        {/* Left column */}
        <Col xs={12} lg={6}>
          {/* set & rarity */}
          <InputGroup className="w-100 d-flex mb-2">
            {/* Artifact Set */}
            <Dropdown as={InputGroup.Prepend} className="flex-grow-1">
              <Dropdown.Toggle className="w-100" variant={artifact ? "success" : "primary"}>
                {sheet?.name ?? t`editor.set.artifactSet`}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <ArtifactSetDropDownMenuFragment sheets={artifactSheets} click={(setKey => update({ setKey }))} />
              </Dropdown.Menu>
            </Dropdown>
            {/* rarity dropdown */}
            <DropdownButton as={InputGroup.Append} title={artifact ? <Stars stars={numStars} /> : t`editor.rarity`} disabled={!sheet} variant={artifact ? "success" : "primary"}>
              {([5, 4, 3] as Rarity[]).map((numStars, index) => <Dropdown.Item key={index} disabled={!sheet?.rarity.includes(numStars)} onClick={() => update({ numStars })}>
                {<Stars stars={numStars} />}
              </Dropdown.Item>)}
            </DropdownButton>
          </InputGroup>

          {/* level */}
          <InputGroup className="mb-2">
            <InputGroup.Prepend>
              <InputGroup.Text>{t`editor.level`}</InputGroup.Text>
            </InputGroup.Prepend>
            <CustomFormControl value={level} disabled={!sheet} placeholder={`0~${numStars * 4}`} onChange={l => update({ level: l })} />
            <InputGroup.Append>
              <Button onClick={() => update({ level: level - 1 })} disabled={!sheet || level === 0}>-</Button>
              {numStars ? [...Array(numStars + 1).keys()].map(i => 4 * i).map(i => <Button key={i} onClick={() => update({ level: i })} disabled={!sheet || level === i}>{i}</Button>) : null}
              <Button onClick={() => update({ level: level + 1 })} disabled={!sheet || level === (numStars * 4)}>+</Button>
            </InputGroup.Append>
          </InputGroup>

          {/* slot */}
          <InputGroup className="mb-2 w-100 d-flex flex-row">
            <DropdownButton
              title={<SlotNameWithIcon slotKey={slotKey} />}
              disabled={!sheet}
              variant={artifact ? "success" : "primary"}
              as={InputGroup.Prepend}
            >
              {sheet?.slots?.map((sKey: SlotKey) =>
                <Dropdown.Item key={sKey as any} onClick={() => update({ slotKey: sKey })} ><SlotNameWithIcon slotKey={sKey} /></Dropdown.Item>)}
            </DropdownButton>
            <InputGroup.Text as={InputGroup.Append} className="flex-grow-1">{sheet?.getSlotName(artifact!.slotKey) ?? t`editor.unknownPieceName` as any}</InputGroup.Text>
          </InputGroup>

          {/* main stat */}
          <InputGroup className="mb-2">
            <DropdownButton
              title={<b>{artifact ? Stat.getStatNameWithPercent(artifact.mainStatKey) : t`mainStat`}</b>}
              disabled={!sheet}
              variant={artifact ? "success" : "primary"}
              as={InputGroup.Prepend}
            >
              <Dropdown.ItemText>{t`editor.mainSelect`}</Dropdown.ItemText>
              {Artifact.slotMainStats(slotKey).map(mainStatK =>
                <Dropdown.Item key={mainStatK} onClick={() => update({ mainStatKey: mainStatK })} >
                  {Stat.getStatNameWithPercent(mainStatK)}
                </Dropdown.Item>)}
            </DropdownButton>
            <FormControl
              value={artifact ? `${valueString(Artifact.mainStatValue(artifact.mainStatKey, numStars, level), Stat.getStatUnit(artifact.mainStatKey))}` : t`mainStat` as any}
              disabled
              readOnly
            />
          </InputGroup>

          {/* Current Substat Efficiency */}
          <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
            <Card.Body className="py-1 px-2">
              <Row>
                <Col className="text-center">{t`editor.curSubEff`}</Col>
                <Col xs="auto">
                  <PercentBadge valid={!errMsgs.length} value={errMsgs.length ? "ERR" : currentEfficiency} />
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Popover id="current-efficiency">
                      <Popover.Title as="h5">{t`editor.curSubEff`}</Popover.Title>
                      <Popover.Content><Trans t={t} i18nKey="editor.curSubEffDesc" /></Popover.Content>
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
                <Col className="text-center">{t`editor.maxSubEff`}</Col>
                <Col xs="auto">
                  <PercentBadge valid={!errMsgs.length} value={errMsgs.length ? "ERR" : maxEfficiency} />
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Popover id="max-efficiency">
                      <Popover.Title as="h5">{t`editor.maxSubEff`}</Popover.Title>
                      <Popover.Content><Trans t={t} i18nKey="editor.maxSubEffDesc" /></Popover.Content>
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
          {[0, 1, 2, 3].map((index) => <SubstatInput key={index} className="mb-2" {...{ index, artifact, setSubstat }} />)}
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
              <h6 className="text-center">{t`editor.preview`}</h6>
              <div><ArtifactCard artifactObj={artifact} /></div>
            </Col>
            <Col lg={4} md={6} className="mb-2">
              <h6 className="text-center">{dupId ? (isDup ? t`editor.dupArt` : t`editor.upArt`) : t`editor.beforeEdit`}</h6>
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
      <Button className="mr-2" onClick={() => { saveArtifact(artifact!, artifact!.id); reset() }} disabled={!isValid} variant={dupId ? "warning" : "primary"}>
        {artifact?.id ? t`editor.btnSave` : t`editor.btnAdd`}
      </Button>
      <Button className="mr-2" disabled={!artifactInEditor} onClick={() => { canClearArtifact() && reset() }} variant="success">{t`editor.btnClear`}</Button>
      {process.env.NODE_ENV === "development" && <Button variant="info" onClick={async () => artifactDispatch({ type: "overwrite", artifact: await randomizeArtifact() })}>{t`editor.btnRandom`}</Button>}
      {Boolean(dupId) && <Button className="float-right" onClick={() => { saveArtifact(artifact!, dupId); reset() }} disabled={!isValid} variant="success">{t`editor.btnUpdate`}</Button>}
    </Card.Footer>
  </Card >
}

function SubstatInput({ index, artifact, setSubstat, className }: { index: number, artifact: IArtifact | undefined, setSubstat: (index: number, substat: Substat) => void, className: string }) {
  const { t } = useTranslation("artifact")
  const { mainStatKey = "", substats = [] } = artifact ?? {}
  const { key = "", value = 0, rolls = [], efficiency = 0 } = artifact?.substats[index] ?? {}

  const accurateValue = rolls.reduce((a, b) => a + b, 0)
  const unit = Stat.getStatUnit(key), rollNum = rolls.length

  let error: string = "", rollData: readonly number[] = [], allowedRolls = 0, rollLabel: Displayable | null = null

  if (artifact) {
    //account for the rolls it will to fill all 4 substates, +1 for its base roll
    const numStars = artifact.numStars
    const { numUpgrades, high } = Artifact.rollInfo(numStars)
    const maxRollNum = numUpgrades + high - 3;
    allowedRolls = maxRollNum - rollNum
    rollData = key ? Artifact.getSubstatRollData(key, numStars) : []
  }
  const rollOffset = 7 - rollData.length

  if (!rollNum && key && value) error = error || t`editor.substat.error.noCalc`
  if (allowedRolls < 0) error = error || t("editor.substat.error.noOverRoll", { value: allowedRolls + rollNum })

  if (!error) {
    const rollBadge = <Badge variant={rollNum === 0 ? "secondary" : `${rollNum}roll`} className="text-darkcontent">
      {rollNum ? t("editor.substat.RollCount", { count: rollNum }) : t`editor.substat.noRoll`}
    </Badge>
    const rollArr = rolls.map((val, i) =>
      <span key={i} className={`mr-2 text-${rollOffset + rollData.indexOf(val)}roll`}>{valueString(val, unit)}</span>)

    rollLabel = <Row>
      <Col>{rollBadge} {rollArr}</Col>
      <Col xs="auto"><Trans t={t} i18nKey="editor.substat.eff">Efficiency: <PercentBadge valid={true} value={efficiency ? efficiency : t`editor.substat.noStat` as string} /></Trans></Col>
    </Row>
  }

  return <Card bg="lightcontent" text={"lightfont" as any} className={className}>
    <InputGroup>
      <DropdownButton
        title={key ? Stat.getStatNameWithPercent(key) : t('editor.substat.substatFormat', { value: index + 1 })}
        disabled={!artifact}
        variant={key ? "success" : "primary"}
        as={InputGroup.Prepend}
      >
        {Boolean(key) && <Dropdown.Item key={key} onClick={() => setSubstat(index, { key: "", value: 0 })}>{t`editor.substat.noSubstat`}</Dropdown.Item>}
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
        placeholder={t`editor.substat.selectSub`}
        value={key ? value : undefined}
        onChange={value => setSubstat(index, { key, value: value ?? 0 })}
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
    <div className="p-1">{error && <Badge variant="danger">{t`ui:error`}</Badge>} {error || rollLabel}</div>
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

  const candidates = database._getArts().filter(candidate =>
    setKey === candidate.setKey &&
    numStars === candidate.numStars &&
    slotKey === candidate.slotKey &&
    mainStatKey === candidate.mainStatKey &&
    level >= candidate.level &&
    substats.every((substat, i) =>
      !candidate.substats[i].key || // Candidate doesn't have anything on this slot
      (substat.key === candidate.substats[i].key && // Or editor simply has better substat
        substat.value >= candidate.substats[i].value)
    )
  )

  // Strictly upgraded artifact
  const upgraded = candidates.filter(candidate =>
    level > candidate.level &&
    (Math.floor(level / 4) === Math.floor(candidate.level / 4) ? // Check for extra rolls
      substats.every((substat, i) => // Has no extra roll
        substat.key === candidate.substats[i].key && substat.value === candidate.substats[i].value) :
      substats.some((substat, i) => // Has extra rolls
        candidate.substats[i].key ?
          substat.value > candidate.substats[i].value : // Extra roll to existing substat
          substat.key // Extra roll to new substat
      )
    )
  )
  // Strictly duplicated artifact
  const duplicated = candidates.filter(candidate =>
    level === candidate.level &&
    substats.every(substat =>
      !substat.key ||  // Empty slot
      candidate.substats.some(candidateSubstat =>
        substat.key === candidateSubstat.key && // Or same slot
        substat.value === candidateSubstat.value
      )))

  if (!duplicated.length && !upgraded.length)
    return { isDup: false }

  const dupId = duplicated[0]?.id! ?? upgraded[0].id!
  return { dupId, isDup: duplicated.length > 0 }
}

const saveArtifact = (artifact: IArtifact, id: string | undefined) => {
  artifact.id = id ?? ""
  database.updateArt(artifact)
}
