/**
 * [AI-Support] Temporary perf harness for the character page filters. Delete with the [AI-Support] commit.
 *
 * Renders <PageCharacter /> in jsdom with a real GOOD database, clicks the filter toggles
 * and reports, per action: React commits, React render time (Profiler), how many
 * CharacterCard renders happened and how many cards end up mounted.
 *
 * Run:
 *   node_modules/.bin/vitest run --config libs/gi/page-characters/vitest.config.mts
 * Optional env:
 *   GO_PERF_DB=<path to a GOOD export>   (default: the dev DB used by gi-db tests)
 *   GO_PERF_MODES=strict,prod            (strict = <StrictMode> like the dev server)
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allCharacterRarityKeys,
  allElementKeys,
  allWeaponTypeKeys,
} from '@genshin-optimizer/gi/consts'
import { ArtCharDatabase } from '@genshin-optimizer/gi/db'
import { DatabaseContext } from '@genshin-optimizer/gi/db-ui'
import { theme } from '@genshin-optimizer/gi/theme'
import { ThemeProvider } from '@mui/material'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Profiler, StrictMode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import PageCharacter from '../index'

const perf = vi.hoisted(() => ({
  commits: 0,
  reactMs: 0,
  cardRenders: 0,
  mountedCards: 0,
  ioVisible: false,
}))

// Count every CharacterCard render/mount without touching the real component.
vi.mock('@genshin-optimizer/gi/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@genshin-optimizer/gi/ui')>()
  const { createElement, useEffect } = await import('react')
  function CountedCharacterCard(
    props: Parameters<typeof actual.CharacterCard>[0]
  ) {
    perf.cardRenders++
    useEffect(() => {
      perf.mountedCards++
      return () => {
        perf.mountedCards--
      }
    }, [])
    return createElement(actual.CharacterCard, props)
  }
  return { ...actual, CharacterCard: CountedCharacterCard }
})

// The real i18n uses an HTTP backend; use an in-memory instance (keys are returned as-is).
vi.mock('../../../i18n/src/i18n', async () => {
  const i18next = (await import('i18next')).default
  const { initReactI18next } = await import('react-i18next')
  const i18n = i18next.createInstance()
  await i18n.use(initReactI18next).init({
    lng: 'en',
    resources: { en: {} },
    returnNull: false,
    react: { useSuspense: false },
  })
  return { i18n, languageCodeList: ['en'] }
})

vi.mock('react-ga4', () => ({
  default: { send: () => {}, initialize: () => {}, event: () => {} },
}))

// Emulate a 1920px wide screen for MUI breakpoints (lg/xl => 12 cards per infinite-scroll step).
const SCREEN_WIDTH = 1920
window.matchMedia = ((query: string) => {
  const min = /min-width:\s*([\d.]+)px/.exec(query)
  const max = /max-width:\s*([\d.]+)px/.exec(query)
  const matches =
    (!min || SCREEN_WIDTH >= Number(min[1])) &&
    (!max || SCREEN_WIDTH <= Number(max[1]))
  return {
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }
}) as typeof window.matchMedia

// jsdom has no IntersectionObserver. `perf.ioVisible` decides whether the infinite-scroll trigger is "on screen".
class MockIntersectionObserver {
  constructor(private cb: IntersectionObserverCallback) {}
  observe(target: Element) {
    setTimeout(() =>
      this.cb(
        [{ isIntersecting: perf.ioVisible, target } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver
      )
    )
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver

const DB_PATH =
  process.env['GO_PERF_DB'] ??
  path.resolve(
    __dirname,
    '../../../db/src/Database/Van_2025-07-16_19-59-13.json'
  )
const MODES = (process.env['GO_PERF_MODES'] ?? 'strict,prod').split(',')

function makeDatabase() {
  const database = new ArtCharDatabase(1, createTestDBStorage('go'))
  const good = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
  database.importGOOD(good, false, false, false)
  database.displayCharacter.set({
    element: [...allElementKeys],
    weaponType: [...allWeaponTypeKeys],
    rarity: [...allCharacterRarityKeys],
    sortType: 'level',
    ascending: false,
  })
  return database
}

async function settle(rounds = 8) {
  for (let i = 0; i < rounds; i++)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 15))
    })
}

type Row = {
  scenario: string
  action: string
  commits: number
  reactMs: number
  cardRenders: number
  mountedCards: number
  wallMs: number
}

async function measure(
  rows: Row[],
  scenario: string,
  action: string,
  fn: () => void | Promise<void>
) {
  perf.commits = 0
  perf.reactMs = 0
  perf.cardRenders = 0
  const t0 = performance.now()
  await act(async () => {
    await fn()
  })
  // keep settling while the infinite scroll keeps adding cards
  let prev = -1
  while (prev !== perf.mountedCards + perf.commits) {
    prev = perf.mountedCards + perf.commits
    await settle()
  }
  rows.push({
    scenario,
    action,
    commits: perf.commits,
    reactMs: Math.round(perf.reactMs),
    cardRenders: perf.cardRenders,
    mountedCards: perf.mountedCards,
    wallMs: Math.round(performance.now() - t0),
  })
}

function clickToggle(container: HTMLElement, value: string) {
  const btn = container.querySelector(`button[value="${value}"]`)
  if (!btn) throw new Error(`toggle ${value} not found`)
  fireEvent.click(btn)
}

function Harness({
  database,
  strict,
  children,
}: {
  database: ArtCharDatabase
  strict: boolean
  children: ReactNode
}) {
  const tree = (
    <Profiler
      id="page"
      onRender={(_id, _phase, actualDuration) => {
        perf.commits++
        perf.reactMs += actualDuration
      }}
    >
      <ThemeProvider theme={theme}>
        <DatabaseContext.Provider
          value={{
            databases: [database],
            setDatabases: () => {},
            database,
            setDatabase: () => {},
          }}
        >
          <MemoryRouter initialEntries={['/characters']}>
            {children}
          </MemoryRouter>
        </DatabaseContext.Provider>
      </ThemeProvider>
    </Profiler>
  )
  return strict ? <StrictMode>{tree}</StrictMode> : tree
}

const clicks: Array<[string, string]> = [
  ['pyro', 'only pyro'],
  ['pyro', 'back to all'],
  ['4', 'only 4-star'],
  ['4', 'back to all'],
]

describe('[AI-Support] character page filter perf', () => {
  afterEach(() => cleanup())

  it.each(MODES)('mode: %s', async (mode) => {
    const strict = mode === 'strict'
    const rows: Row[] = []
    for (const scrolled of [false, true]) {
      const scenario = `${mode}/${scrolled ? 'scrolled' : 'top'}`
      const database = makeDatabase()
      perf.mountedCards = 0
      perf.ioVisible = scrolled
      let container!: HTMLElement
      await measure(rows, scenario, 'initial render', () => {
        container = render(
          <Harness database={database} strict={strict}>
            <PageCharacter />
          </Harness>
        ).container
      })
      // from now on the trigger is off screen: only the filter itself should cost anything
      perf.ioVisible = false
      for (const [value, label] of clicks)
        await measure(rows, scenario, `click ${value} (${label})`, () =>
          clickToggle(container, value)
        )
      cleanup()
    }
    console.log(`\nDB: ${DB_PATH}`)
    console.table(rows)
    expect(rows.length).toBeGreaterThan(0)
  })
})
