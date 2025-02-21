import type { Language } from '@genshin-optimizer/common/pipeline'
import type { ColorTag } from '@genshin-optimizer/gi/dm'
import { tagColor } from '@genshin-optimizer/gi/dm'

export function preprocess(string: string): string {
  {
    // color tags
    const stack: ColorTag[] = []
    if (!string) string = ''
    string = string.replace(
      /<(\/?)color(?:=#([0-9A-F]{8}))?>/g,
      (_match, isClosed, color) => {
        if (isClosed) return `</${stack.pop()}>`
        const tag = tagColor[color as keyof typeof tagColor]
        stack.push(tag)
        return `<${tag}>`
      }
    )
  }

  string = string
    .replaceAll(/\{SPACE\}/g, ' ')
    .replaceAll(/\{NON_BREAK_SPACE\}/g, '\u00A0')

  if (string.startsWith('#')) {
    // `{}` tags
    string = string
      .substring(1)
      .replace(/\{LAYOUT_(PC|PS|MOBILE)#(.*?)\}/g, (_match, layout, text) =>
        layout === 'PC' ? text : ''
      ) // Use PC layout
  }
  return string
}

export function parseBulletPoints(strings: string[]): string[] {
  strings.push('')
  const { strs } = strings.reduce(
    ({ strs, arr }, str) => {
      const isBullet = str.startsWith('·')
      if (isBullet) str = str.slice(1)
      if (arr) {
        if (isBullet) arr.push(str)
        else {
          strs.push(arr as any) // TODO
          arr = undefined
        }
      } else if (isBullet) {
        //start of new bullet point list
        arr = [str]
      }
      if (!isBullet) strs.push(str)
      return { strs, arr }
    },
    { strs: [] as string[], arr: undefined as string[] | undefined }
  )
  strs.pop()
  return strs
}

//for parsing plunging string
function plungeUtil(lang: Language, string: string, low: boolean) {
  const res = low ? '$2' : '$3'
  string = string.split('|')[0]
  switch (lang) {
    case 'chs':
    case 'cht':
    case 'ja':
      string = string.replace(/((\S{2})\/(\S{2}))/, res)
      break
    case 'th':
      string = string.replace(/((\S{3})\/(\S{3}))/, res)
      break
    default:
      string = string.replace(/((\S+)\/(\S+))/, res)
      break
  }
  return string
}
const paragraph = (string: string) => {
  const parsed = string.split('\\n').map((s) => s || '<br/>')
  while (parsed[parsed.length - 1] === '<br/>') parsed.pop()
  return { ...parseBulletPoints(parsed) }
}
const autoFields = (string: string, delimiter = '\\n\\n<strong>') => {
  const strings = string
    .split(delimiter)
    .filter((s) => s)
    .map((s, i) => (i ? '<strong>' : '') + s)
  return strings.map((s) => ({ ...paragraph(s) }))
}

export const parsingFunctions: {
  [key: string]: (lang: Language, string: string, keys: string[]) => any
} = {
  autoName: (lang, string) => {
    //starts with Normal Attack: ______ in english
    if (string.includes('·')) {
      const index = string.indexOf('·')
      string = string.slice(index + 1)
    } else if (string.includes(':')) {
      string = string.split(':')[1].trim()
    } else if (string.includes(' - ')) {
      const index = string.indexOf(' - ')
      string = string.slice(index + 3)
    }
    if (!string) throw `${lang} has invalid "name"`
    return string
  },
  autoFields: (lang, string, keys) => {
    const strings = autoFields(string)
    if (strings.length === 3) {
      const [normal, charged, plunging] = strings
      return { normal, charged, plunging } as any
    } else if (strings.length === 4) {
      //for childe or kazuha
      const [, charkey] = keys as any
      if (charkey === 'KaedeharaKazuha') {
        const [normal, charged, plunging, plunging_midare] = strings
        return { normal, charged, plunging, plunging_midare } as any
      }
      if (charkey === 'Tartaglia') {
        const [normal, charged, riptide, plunging] = strings
        return { normal, charged, riptide, plunging } as any
      }
      if (charkey === 'Yelan') {
        const [normal, charged, breakthrough, plunging] = strings
        return { normal, charged, breakthrough, plunging } as any
      }
      // Jank for certain languages. Surely they will fix this
      if (charkey === 'Neuvillette') {
        const [normal, chargedLegal, charged, plunging] = strings
        return {
          normal,
          chargedLegal,
          charged,
          chargedJudgment: {},
          plunging,
        } as any
      }
      if (charkey === 'Furina') {
        const [normal, charged, arkhe, plunging] = strings
        return { normal, charged, arkhe, plunging } as any
      }
      if (charkey === 'Charlotte') {
        const [normal, charged, plunging, arkhe] = strings
        return { normal, charged, plunging, arkhe } as any
      }
      if (charkey === 'Arlecchino') {
        const [normal, charged, plunging, infusion] = strings
        return { normal, charged, plunging, infusion } as any
      }
      if (charkey === 'Xilonen') {
        const [normal, charged, plunging, nightsoul] = strings
        return { normal, charged, plunging, nightsoul } as any
      }
    } else if (strings.length === 5) {
      const [, charkey] = keys as any
      if (charkey === 'Neuvillette') {
        const [normal, chargedLegal, charged, chargedJudgment, plunging] =
          strings
        return {
          normal,
          chargedLegal,
          charged,
          chargedJudgment,
          plunging,
        } as any
      }
      if (charkey === 'Lyney') {
        const [normal, plunging, charged, grinMalkin, arkhe] = strings
        return { normal, charged, plunging, grinMalkin, arkhe } as any
      }
    }
    throw `parsing fields error[${keys}](${lang}): ${string}`
  },
  paragraph: (lang, string) => paragraph(string),
  skillParam: (lang, string) => {
    if (!string) string = ''
    string = string.split('|')[0]
    return string
  },
  skillParamEncoding: (lang, string) => {
    if (!string) return ''
    string = string.split('|')[1]
    // Convert to i18n'able format
    // Add double braces
    string = string.replace(/[{}]/g, (match) => match + match)
    // Convert param1 to 0
    string = string.replace(
      /param(\d*)/g,
      (_match, capture) => `${+capture - 1}`
    )
    // Handle formatting ':F1}}', ':F1P}}', ':I}}', ':P}}'
    string = string.replace(
      /:(F\d|I)?(P)?}}/g,
      (_match, floatOrInt, percent) => {
        // 'F1' or 'F1P'
        if (floatOrInt?.[0] === 'F') {
          if (percent === 'P') {
            return `, percent(fixed: ${floatOrInt[1]})}}%`
          } else {
            return `, fixed(fixed: ${floatOrInt[1]})}}`
          }
        }
        // 'P'
        else if (percent === 'P') {
          return `, percent}}%`
        }
        // 'I' has no formatting
        return '}}'
      }
    )
    return string
  },
  plungeLow: (lang, string) => plungeUtil(lang, string, true),
  plungeHigh: (lang, string) => plungeUtil(lang, string, false),
  string: (lang, string) => string,
  constellation: (lang, string) => constellation(string),
  talent: (lang, string) => talent(string),
  altSprint: (lang, string) => altSprint(string),
  passive1: (lang, string) => passive1(string),
  passive4: (lang, string) => passive4(string),
}

export function constellation(string: string) {
  return string.replace('<strong>{0}</strong>', '{{level}}')
}

export function talent(string: string) {
  return string.replace('+{0}', '{{level}}')
}

export function altSprint(string: string) {
  const re = new RegExp(/<strong>(.+)<\/strong>/)
  const match = re.exec(string)
  return match?.[1] ?? ''
}

export function passive1(string: string) {
  return string.replace('{0}', '1')
}
export function passive4(string: string) {
  return string.replace('{0}', '4')
}
