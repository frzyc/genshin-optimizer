import { allArtifactSetKeys } from '@genshin-optimizer/consts'
import { Data, reader } from '../util'
import NoblesseOblige from './NoblesseOblige'

const data: Data = [
  ...NoblesseOblige,

  // Put them here since this can't be behind `register`
  ...allArtifactSetKeys.map(art =>
    reader.with('src', 'art').reread(reader.with('src', art))),
]
export default data
