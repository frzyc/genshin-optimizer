import ArtifactDatabase from "./ArtifactDatabase"

describe('Test ArtifactDatabase', () => {
  const common = {
    level: 10,
    location: "char_test",
    numStars: 5,
    setKey: "set",
    slotKey: "slot",
    mainStatKey: "stat",
  }
  const artifact_1 = {
    id: "artifact_1",
    ...common
  }
  const artifact_2 = {
    id: "artifact_2",
    ...common,
    location: ""
  }
  const artifact_3 = {
    id: "artifact_3",
    ...common,
    location: "char_test2"
  }
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem("artifact_1", JSON.stringify(artifact_1))
    localStorage.setItem("artifact_2", JSON.stringify(artifact_2))
    localStorage.setItem("artifact_3", JSON.stringify(artifact_3))
    ArtifactDatabase.clearDatabase()
    ArtifactDatabase.populateDatebaseFromLocalStorage()
  })
  afterEach(() => localStorage.clear())

  describe('unequipAllArtifacts()', () => {
    test('should empty location', () => {
      ArtifactDatabase.unequipAllArtifacts()
      expect(ArtifactDatabase.get("artifact_1").location).toEqual("")
      expect(ArtifactDatabase.get("artifact_2").location).toEqual("")
      expect(ArtifactDatabase.get("artifact_3").location).toEqual("")
    })
  })

})