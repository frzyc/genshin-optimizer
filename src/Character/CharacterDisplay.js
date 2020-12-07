import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import CharacterCard from './CharacterCard';
import CharacterDatabase from './CharacterDatabase';
import CharacterEditor from './CharacterEditor';
export default class CharacterDisplay extends React.Component {
  constructor(props) {
    super(props)
    CharacterDatabase.populateDatebaseFromLocalStorage();
    this.state = {
      charIdList: [...CharacterDatabase.getCharacterIdList()],
      charToEdit: null
    }
  }
  addCharacter = (art) => {
    if (this.state.charToEdit && this.state.charToEdit.id === art.id) {
      CharacterDatabase.updateCharacter(art);
      this.setState({ charToEdit: null }, this.forceUpdate)
    } else {
      let id = CharacterDatabase.addCharacter(art)
      //add the new Character at the beginning
      this.setState((state) => ({ charIdList: [...state.charIdList, id] }))
    }
  }

  deleteCharacter = (index) => {
    CharacterDatabase.removeCharacterById(this.state.charIdList[index])
    this.setState((state) => {
      let charIdList = [...state.charIdList]
      charIdList.splice(index, 1)
      return { charIdList }
    });
  }
  editCharacter = (index) =>
    this.setState({ charToEdit: CharacterDatabase.getCharacter(this.state.charIdList[index]) })

  cancelEditCharacter = () =>
    this.setState({ charToEdit: null })

  render() {
    return (<Container>
      <Row className="mb-2 no-gutters"><Col>
        <CharacterEditor
          characterToEdit={this.state.charToEdit}
          addCharacter={this.addCharacter}
          cancelEdit={this.cancelEditCharacter}
        />
      </Col></Row>

      <Row className="mb-2">
        {this.state.charIdList.map((id, index) =>
          <Col key={id} lg={4} md={6} className="mb-2">
            <CharacterCard
              characterData={CharacterDatabase.getCharacter(id)}
              onDelete={() => this.deleteCharacter(index)}
              onEdit={() => this.editCharacter(index)}
            />
          </Col>
        )}
      </Row>
    </Container>)

  }
}