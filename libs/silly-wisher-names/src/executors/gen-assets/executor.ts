import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import type { GenAssetsExecutorSchema } from './schema'

export const PROJROOT_PATH = `${process.env['NX_WORKSPACE_ROOT']}/libs/silly-wisher-names`

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
  baizhu: 'Baizhu',
  barbara: 'Barbara',
  beidou: 'Beidou',
  bennett: 'Bennett',
  candace: 'Candace',
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
  ganyu: 'Ganyu',
  gorou: 'Gorou',
  hutao: 'HuTao',
  jean: 'Jean',
  kazuha: 'KaedeharaKazuha',
  kaeya: 'Kaeya',
  ayaka: 'KamisatoAyaka',
  ayato: 'KamisatoAyato',
  keqing: 'Keqing',
  klee: 'Klee',
  sara: 'KujouSara',
  kuki: 'KukiShinobu',
  layla: 'Layla',
  lisa: 'Lisa',
  lumine: 'TravelerF',
  mika: 'Mika',
  mona: 'Mona',
  nahida: 'Nahida',
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
  xiangling: 'Xiangling',
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

export default async function runExecutor(_options: GenAssetsExecutorSchema) {
  // Load translation files from POEditor into the assets folder.
  const namesFilePath = `${PROJROOT_PATH}/Translated/CharMemNames.csv`
  const localeDir = `${PROJROOT_PATH}/assets/locales/`

  const raw = readFileSync(namesFilePath).toString()

  const lines = raw.split('\r\n')

  lines.shift() // First line is langauge heading
  lines.pop() // Empty last line
  lines.forEach((line) => {
    const [
      skey,
      en, // English (United States)
      cht, // Chinese (Traditional)
      chs, // Chinese(Simplified)
      ja, // Japanese
      fr, // French
      it, // Italian
      de, // German
      es, // Spanish
      ko, // Korean
      th, // Thai
      id, // indonesian
      pt, // Portuguese(Brazil)
      ru, // Russian
      _po, // Polish
      vi, // Vietnamese
      tr, // Turkish
      _ar, // Arabic,
      _fi, // Filipino / Tagalog
    ] = line.split(',')
    const characterKey = swKeyMap[skey as keyof typeof swKeyMap]
    if (!characterKey) return

    const langStrings = [
      en,
      chs,
      cht,
      ja,
      fr,
      it,
      de,
      es,
      ko,
      th,
      id,
      pt,
      ru,
      vi,
      tr,
    ]
    langStrings.forEach((str, i) => (data[languages[i]][characterKey] = str))
  })

  Object.entries(data).map(([langkey, d]) => {
    const content = JSON.stringify(d, null, 2)
    const fileDir = `${localeDir}${langkey}`
    if (!existsSync(fileDir)) mkdirSync(fileDir, { recursive: true })
    const fileName = `${fileDir}/sillyWisher_charNames.json`
    writeFileSync(fileName, content)
    console.log('Generated JSON at', fileName)
  })
  return {
    success: true,
  }
}
