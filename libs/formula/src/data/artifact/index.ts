import { artifacts, Data, reader } from '../util'
import NoblesseOblige from './NoblesseOblige'

const data: Data = [
  ...NoblesseOblige,

  // Put them here since this can't be behind `register`
  ...artifacts.map(art =>
    reader.with('src', 'art').reread(reader.with('src', art))),
]
export default data
