import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import * as YAML from 'yaml'
import type { GenAssetsExecutorSchema } from './schema'

export const PROJROOT_PATH = `${process.env['NX_WORKSPACE_ROOT']}/libs/gi/silly-wisher-names`

const languages = [
  'en',
  'chs',
  'cht',
  'ja',
  'fr',
  'it',
  'de',
  'es',
  'ko',
  'th',
  'id',
  'pt',
  'ru',
  'vi',
  'pl',
  'tr',
] as const
type LangKey = (typeof languages)[number]
const data = Object.fromEntries(languages.map((l) => [l, {}])) as Record<
  LangKey,
  { [key: string]: string }
>

const swKeyMap = {
  aether: 'TravelerM',
  albedo: 'Albedo',
  alhaitham: 'Alhaitham',
  aloy: 'Aloy',
  amber: 'Amber',
  itto: 'AratakiItto',
  arlecchino: 'Arlecchino',
  baizhu: 'Baizhu',
  barbara: 'Barbara',
  beidou: 'Beidou',
  bennett: 'Bennett',
  candace: 'Candace',
  charlotte: 'Charlotte',
  chevreuse: 'Chevreuse',
  chiori: 'Chiori',
  chongyun: 'Chongyun',
  collei: 'Collei',
  cyno: 'Cyno',
  dehya: 'Dehya',
  diluc: 'Diluc',
  diona: 'Diona',
  dori: 'Dori',
  eula: 'Eula',
  faruzan: 'Faruzan',
  fischl: 'Fischl',
  freminet: 'Freminet',
  furina: 'Furina',
  gaming: 'Gaming',
  ganyu: 'Ganyu',
  gorou: 'Gorou',
  hutao: 'HuTao',
  jean: 'Jean',
  kazuha: 'KaedeharaKazuha',
  kaeya: 'Kaeya',
  kaveh: 'Kaveh',
  ayaka: 'KamisatoAyaka',
  ayato: 'KamisatoAyato',
  keqing: 'Keqing',
  kirara: 'Kirara',
  klee: 'Klee',
  sara: 'KujouSara',
  kuki: 'KukiShinobu',
  layla: 'Layla',
  lisa: 'Lisa',
  lynette: 'Lynette',
  lyney: 'Lyney',
  lumine: 'TravelerF',
  mika: 'Mika',
  mona: 'Mona',
  nahida: 'Nahida',
  navia: 'Navia',
  neuvillette: 'Neuvillette',
  nilou: 'Nilou',
  ningguang: 'Ningguang',
  noelle: 'Noelle',
  qiqi: 'Qiqi',
  raiden: 'RaidenShogun',
  razor: 'Razor',
  rosaria: 'Rosaria',
  kokomi: 'SangonomiyaKokomi',
  sayu: 'Sayu',
  shenhe: 'Shenhe',
  heizou: 'ShikanoinHeizou',
  sucrose: 'Sucrose',
  tartaglia: 'Tartaglia',
  thoma: 'Thoma',
  tighnari: 'Tighnari',
  venti: 'Venti',
  wanderer: 'Wanderer',
  wriothesley: 'Wriothesley',
  xiangling: 'Xiangling',
  xianyun: 'Xianyun',
  xiao: 'Xiao',
  xingqiu: 'Xingqiu',
  xinyan: 'Xinyan',
  yae: 'YaeMiko',
  yanfei: 'Yanfei',
  yaoyao: 'Yaoyao',
  yelan: 'Yelan',
  yoimiya: 'Yoimiya',
  yunjin: 'YunJin',
  zhongli: 'Zhongli',
} as const

interface AssetSource {
  mTerms: CharacterTerm[]
}

interface CharacterTerm {
  Term: string
  TermType: number
  Description: string
  Languages: string[]
}

export default async function runExecutor(_options: GenAssetsExecutorSchema) {
  // Load translation files from Silly Wisher APK into the assets folder.
  const namesFilePath = `${PROJROOT_PATH}/Translated/I2Languages.asset`
  const localeDir = `${PROJROOT_PATH}/assets/locales/`

  const raw = YAML.parse(readFileSync(namesFilePath).toString())
  const source = raw.MonoBehaviour.mSource as AssetSource

  const characterNames = Object.fromEntries(
    source.mTerms
      .filter((term) => term.Term.startsWith('CharMemNames'))
      .map((term) => [term.Term.split('/').at(1), term.Languages] as const)
      .filter(([shortName, _]) => shortName && shortName in swKeyMap)
      .map(
        ([shortName, languages]) =>
          [swKeyMap[shortName as keyof typeof swKeyMap], languages] as const
      )
  )

  languages.forEach((lang, idx) => {
    for (const name in characterNames) {
      data[lang][name] = characterNames[name][idx]
    }
  })

  Object.entries(data).map(([langkey, d]) => {
    const content = JSON.stringify(d, null, 2)
    const fileDir = `${localeDir}${langkey}`
    if (!existsSync(fileDir)) mkdirSync(fileDir, { recursive: true })
    const fileName = `${fileDir}/sillyWisher_charNames.json`
    writeFileSync(fileName, content + '\n')
    console.log('Generated JSON at', fileName)
  })
  return {
    success: true,
  }
}
