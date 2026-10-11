// [AI-Support] Headless browser probe for the local dev server. Delete with the [AI-Support] commit.
//
// Opens a page in a headless Chromium (Brave by default) with a throwaway profile, so it never
// touches the user's browser tabs or localStorage (the app kicks other tabs out on open).
// Waits for a selector, evaluates a JS expression and prints the result as JSON; can also
// save a screenshot.
//
// Usage:
//   node tools/ai-support/probe.mjs --url "http://localhost:4200/#/artifacts" \
//     [--wait-for ".MuiToggleButton-root"] [--before "<js run after load, e.g. close a modal>"] \
//     [--eval "<js expression>"] [--eval-file f.js] \
//     [--screenshot out.png] [--clip "x,y,w,h"] [--scale 2] [--width 1600] [--height 1000] \
//     [--timeout 60000]
// Env: PROBE_BROWSER=<path to chrome/edge executable>
import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .reduce((acc, a, i, all) => {
      if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1]])
      return acc
    }, [])
)
const url = args.url ?? 'http://localhost:4200/'
const width = Number(args.width ?? 1600)
const height = Number(args.height ?? 1000)
const timeout = Number(args.timeout ?? 60000)
const expression = args['eval-file']
  ? readFileSync(args['eval-file'], 'utf8')
  : args.eval
const browserPath =
  process.env.PROBE_BROWSER ??
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const port = 9300 + Math.floor(Math.random() * 600)
const profile = mkdtempSync(join(tmpdir(), 'go-probe-'))
const browser = spawn(
  browserPath,
  [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    'about:blank',
  ],
  { stdio: 'ignore' }
)

async function getPageWsUrl() {
  const deadline = Date.now() + 20000
  while (Date.now() < deadline) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
      const page = list.find((t) => t.type === 'page')
      if (page) return page.webSocketDebuggerUrl
    } catch {
      // browser still starting
    }
    await sleep(250)
  }
  throw new Error('browser did not expose a page target')
}

let nextId = 1
const pending = new Map()
function send(ws, method, params = {}) {
  const id = nextId++
  ws.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) =>
    pending.set(id, { resolve, reject, method })
  )
}

async function main() {
  const ws = new WebSocket(await getPageWsUrl())
  await new Promise((r) => ws.addEventListener('open', r, { once: true }))
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data)
    const p = msg.id && pending.get(msg.id)
    if (!p) return
    pending.delete(msg.id)
    if (msg.error) p.reject(new Error(`${p.method}: ${msg.error.message}`))
    else p.resolve(msg.result)
  })
  await send(ws, 'Page.enable')
  await send(ws, 'Runtime.enable')
  await send(ws, 'Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await send(ws, 'Page.navigate', { url })

  const evaluate = async (expr) => {
    const res = await send(ws, 'Runtime.evaluate', {
      expression: expr,
      awaitPromise: true,
      returnByValue: true,
    })
    if (res.exceptionDetails)
      throw new Error(
        res.exceptionDetails.exception?.description ?? res.exceptionDetails.text
      )
    return res.result.value
  }

  const waitFor = args['wait-for'] ?? 'header'
  const found = await evaluate(`new Promise((resolve) => {
    const start = Date.now()
    const tick = () => {
      if (document.querySelector(${JSON.stringify(waitFor)})) return resolve(true)
      if (Date.now() - start > ${timeout}) return resolve(false)
      setTimeout(tick, 250)
    }
    tick()
  })`)
  if (!found) throw new Error(`timed out waiting for ${waitFor}`)
  await sleep(Number(args.settle ?? 1500))
  if (args.before) {
    await evaluate(args.before)
    await sleep(Number(args.settle ?? 1500))
  }

  if (expression) {
    const value = await evaluate(expression)
    console.log(JSON.stringify(value, null, 2))
  }
  if (args.screenshot) {
    const [x, y, w, h] = (args.clip ?? '').split(',').map(Number)
    const clip = args.clip
      ? { x, y, width: w, height: h, scale: Number(args.scale ?? 2) }
      : undefined
    const { data } = await send(ws, 'Page.captureScreenshot', {
      format: 'png',
      ...(clip && { clip, captureBeyondViewport: true }),
    })
    writeFileSync(args.screenshot, Buffer.from(data, 'base64'))
    console.log(`screenshot: ${args.screenshot}`)
  }
  ws.close()
}

main()
  .catch((e) => {
    console.error(e.message)
    process.exitCode = 1
  })
  .finally(async () => {
    browser.kill()
    await sleep(500)
    try {
      rmSync(profile, { recursive: true, force: true })
    } catch {
      // profile files may still be locked for a moment on Windows
    }
  })
