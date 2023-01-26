import { writeFileSync } from 'fs'
import { resolve } from 'path'
import * as data from './data'

writeFileSync(resolve(__dirname, 'data.gen.json'), JSON.stringify(data))
