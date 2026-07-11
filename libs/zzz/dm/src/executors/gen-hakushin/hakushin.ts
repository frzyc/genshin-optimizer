import {
  dumpPrettyFile,
  fetchJsonFromUrl,
} from '@genshin-optimizer/common/pipeline'
import { objKeyValMap, objMap } from '@genshin-optimizer/common/util'
import { PROJROOT_PATH } from '../../consts'
import { DEBUG } from './debug'
const URL_BASE = 'https://static.nanoka.cc/zzz/'
const VERSION = '3.0'

async function dumpHakushinData(filename: string, obj: object) {
  obj = convertSnakeToPascal(obj) as object
  return await dumpPrettyFile(`${PROJROOT_PATH}/HakushinData/${filename}`, obj)
}
async function dumpHakushinIndex(filename: string, obj: object) {
  // Convert 2-layer nested objects, except language object for equipment
  obj = objMap(obj, (v) =>
    objMap(v as object, (v, k) =>
      ['en', 'ko', 'ja', 'zh'].includes(k) ? v : convertSnakeToPascal(v)
    )
  )
  // Convert language keys for 1-layer nested objects
  obj = objMap(obj, (nestedObj: object) =>
    objKeyValMap(Object.entries<string, unknown>(nestedObj), ([k, v]) => [
      snakeKeyToPascal(k, false),
      v,
    ])
  )
  // Index only requires nested objects and the language keys
  return await dumpPrettyFile(`${PROJROOT_PATH}/HakushinData/${filename}`, obj)
}
// Convert snake_case to PascalCase to avoid converting all the types
function convertSnakeToPascal(objOrVal: unknown): unknown {
  if (typeof objOrVal !== 'object' || objOrVal == null) return objOrVal
  if (Array.isArray(objOrVal)) {
    return objOrVal.map((v) => convertSnakeToPascal(v))
  }
  return objKeyValMap(
    Object.entries<string, unknown>(objOrVal),
    ([k, v]) =>
      [snakeKeyToPascal(k), convertSnakeToPascal(v)] as [string, unknown]
  )
}
function snakeKeyToPascal(key: string, convertEveryString = true) {
  switch (key) {
    case 'level_exp':
      return 'LevelEXP'
    case 'en':
    case 'ko':
    case 'ja':
      return key.toUpperCase()
    case 'zh':
      return 'CHS'
    default:
      if (convertEveryString) {
        return (
          key[0].toUpperCase() +
          key
            .slice(1)
            .replace(/_([a-z])/g, (_match: string, char: string) =>
              char.toUpperCase()
            )
        )
      } else return key
  }
}

const categories = [
  'character',
  'weapon',
  'bangboo',
  'equipment', // discs
  'monster', // enemies
] as const
type Category = (typeof categories)[number]
export async function getDataFromHakushin() {
  await Promise.all([
    ...categories.map((category) => getAndDumpCategoryData(category)),
    getAndDumpNounData(),
  ])
}
async function getAndDumpCategoryData(category: Category) {
  const indexData = (await fetchJsonFromUrl(
    URL_BASE + VERSION + `/${category}.json`,
    DEBUG
  )) as Record<string, unknown>
  await dumpHakushinIndex(`${category}.json`, indexData)
  await Promise.all(
    Object.keys(indexData).map(async (id) => {
      // NOTE: hakushin also has data in en, ko, chs, ja
      const itemData = (await fetchJsonFromUrl(
        URL_BASE + VERSION + `/en/${category}/${id}.json`
      )) as object
      await dumpHakushinData(`${category}/${id}.json`, itemData)
    })
  )
}
async function getAndDumpNounData() {
  const nounData = (await fetchJsonFromUrl(
    URL_BASE + VERSION + '/en/noun.json'
  )) as object
  await dumpHakushinData('noun.json', nounData)
}
