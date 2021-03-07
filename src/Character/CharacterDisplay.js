import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { lazy } from 'react';
import { Button, Card, Col, Container, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import ReactGA from 'react-ga';
import { DatabaseInitAndVerify } from '../DatabaseUtil';
import Character from './Character';
import CharacterCard from './CharacterCard';
import CharacterDatabase from './CharacterDatabase';

//lazy load the character display
const CharacterDisplayCardPromise = import('../Character/CharacterDisplayCard');
const CharacterDisplayCard = lazy(() => CharacterDisplayCardPromise)
const toggle = {
  level: "Level",
  rarity: "Rarity",
  name: "Name"
}
const sortingFunc = {
  level: (ck) => Character.getLevel(CharacterDatabase.get(ck).levelKey),
  rarity: (ck) => Character.getStar(ck)
}
export default class CharacterDisplay extends React.Component {
  constructor(props) {
    super(props)
    DatabaseInitAndVerify();
    this.state = {
      charIdToEdit: "",
      showEditor: false,
      sortBy: Object.keys(toggle)[0]
    }
    ReactGA.pageview('/character')
  }

  deleteCharacter = (id) => {
    Character.remove(id)
    this.forceUpdate()
  }

  editCharacter = (id) =>
    this.setState({ charIdToEdit: id, showEditor: true },
      () => this.scrollRef.current.scrollIntoView({ behavior: "smooth" }))

  cancelEditCharacter = () =>
    this.setState({ charIdToEdit: null, showEditor: false })

  componentDidMount() {
    this.scrollRef = React.createRef()
  }
  render() {
    const charKeyList = CharacterDatabase.getCharacterKeyList().sort((a, b) => {
      if (this.state.sortBy === "name") {
        if (a < b) return -1;
        if (a > b) return 1;
        // names must be equal
        return 0;
      }
      if (this.state.sortBy === "level") {
        const diff = sortingFunc["level"](b) - sortingFunc["level"](a)
        if (diff) return diff
        return sortingFunc["rarity"](b) - sortingFunc["rarity"](a)
      } else {
        const diff = sortingFunc["rarity"](b) - sortingFunc["rarity"](a)
        if (diff) return diff
        return sortingFunc["level"](b) - sortingFunc["level"](a)
      }
    })
    return (<Container ref={this.scrollRef}>
      {/* editor/character detail display */}
      {this.state.showEditor ? <Row className="mt-2"><Col>
        <React.Suspense fallback={<span>Loading...</span>}>
          <CharacterDisplayCard editable
            characterKey={this.state.charIdToEdit}
            onClose={this.cancelEditCharacter}
            footer={<Button variant="danger" onClick={this.cancelEditCharacter}>Close</Button>}
          />
        </React.Suspense>
      </Col></Row> : null}
      <Card bg="darkcontent" text="lightfont" className="mt-2">
        <Card.Body className="p-2 text-right">
          <span>Sort by: </span>
          <ToggleButtonGroup type="radio" name="level" defaultValue={this.state.sortBy} size="sm" onChange={v => this.setState({ sortBy: v })}>
            {Object.entries(toggle).map(([key, text]) =>
              <ToggleButton key={key} value={key} variant={this.state.sortBy === key ? "success" : "primary"}>{text}</ToggleButton>)}
          </ToggleButtonGroup>
        </Card.Body>
      </Card>
      <Row className="mt-2">
        {this.state.showEditor ? null : <Col lg={4} md={6} className="mb-2">
          <Card className="h-100" bg="darkcontent" text="lightfont">
            <Card.Header className="pr-2">
              <span>Add New Character</span>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-center">
              <Row className="d-flex flex-row justify-content-center">
                <Col xs="auto">
                  <Button onClick={() => this.editCharacter("")}>
                    <h1><FontAwesomeIcon icon={faPlus} className="fa-fw" /></h1>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>}
        {charKeyList.map(charKey =>
          <Col key={charKey} lg={4} md={6} className="mb-2">
            <CharacterCard
              cardClassName="h-100"
              characterKey={charKey}
              onDelete={() => this.deleteCharacter(charKey)}
              onEdit={() => this.editCharacter(charKey)}
            />
          </Col>
        )}
      </Row>
    </Container>)
  }
}