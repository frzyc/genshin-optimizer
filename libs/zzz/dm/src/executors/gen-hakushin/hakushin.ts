import {
  dumpPrettyFile,
  fetchJsonFromUrl,
} from '@genshin-optimizer/common/pipeline'
import { PROJROOT_PATH } from '../../consts'
import { DEBUG } from './debug'
const URL_BASE = 'https://api.hakush.in/zzz/'

async function dumpHakushinData(filename: string, obj: unknown) {
  return await dumpPrettyFile(`${PROJROOT_PATH}/HakushinData/${filename}`, obj)
}
// missing but provided by api: "item" for items, or "new" for newly added stuff
const categories = [
  'character',
  'weapon',
  'bangboo',
  'equipment', // discs
  'monster', // enemies
] as const
type Category = (typeof categories)[number]
export async function getDataFromHakushin() {
  await Promise.all(
    categories.map((category) => getAndDumpCategoryData(category))
  )
}
async function getAndDumpCategoryData(category: Category) {
  const indexData = (await fetchJsonFromUrl(
    URL_BASE + `data/${category}.json`,
    DEBUG
  )) as Record<string, unknown>
  await dumpHakushinData(`${category}.json`, indexData)
  await Promise.all(
    Object.keys(indexData).map(async (id) => {
      // NOTE: hakushin also has data in en, ko, chs, ja
      const itemData = await fetchJsonFromUrl(
        URL_BASE + `data/en/${category}/${id}.json`
      )
      await dumpHakushinData(`${category}/${id}.json`, itemData)
    })
  )
}
