import { imageDataToCanvas } from '@genshin-optimizer/common/img-util'
import { BorrowManager } from '@genshin-optimizer/common/util'
import type { OcrTextLine } from '@genshin-optimizer/zzz/disc-scanner'
import type { Line, RecognizeResult, Scheduler, Word } from 'tesseract.js'
import { createScheduler, createWorker } from 'tesseract.js'

function contentWordsForLine(line: Line) {
  return line.words?.filter((w) => w.text.trim()) ?? []
}

function wordToBox(word: Word) {
  return {
    text: word.text.trim(),
    x: word.bbox.x0,
    y: word.bbox.y0,
    width: word.bbox.x1 - word.bbox.x0,
    height: word.bbox.y1 - word.bbox.y0,
  }
}

function unionWordBox(words: Word[]) {
  const x0 = Math.min(...words.map((w) => w.bbox.x0))
  const y0 = Math.min(...words.map((w) => w.bbox.y0))
  const x1 = Math.max(...words.map((w) => w.bbox.x1))
  const y1 = Math.max(...words.map((w) => w.bbox.y1))
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }
}

function tesseractLineBox(line: Line) {
  return {
    x: line.bbox.x0,
    y: line.bbox.y0,
    width: line.bbox.x1 - line.bbox.x0,
    height: line.bbox.y1 - line.bbox.y0,
  }
}

function unionBoxes(
  ...boxes: { x: number; y: number; width: number; height: number }[]
) {
  const x0 = Math.min(...boxes.map((b) => b.x))
  const y0 = Math.min(...boxes.map((b) => b.y))
  const x1 = Math.max(...boxes.map((b) => b.x + b.width))
  const y1 = Math.max(...boxes.map((b) => b.y + b.height))
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }
}

/** Dashed line box: full Tesseract line extent, including words it missed (e.g. short labels). */
function lineBoxFromWords(line: Line) {
  const tessBox = tesseractLineBox(line)
  const words = contentWordsForLine(line)
  if (!words.length) return tessBox
  return unionBoxes(tessBox, unionWordBox(words))
}

const workerCount = 2

const schedulers = new BorrowManager(
  async (language): Promise<Scheduler> => {
    const scheduler = createScheduler()
    const promises = Array(workerCount)
      .fill(0)
      .map(async (_) => {
        const worker = await createWorker(language)
        scheduler.addWorker(worker)
      })

    await Promise.any(promises)
    return scheduler
  },
  (_language, value) => {
    value.then((value) => value.terminate())
  }
)

export async function linesFromImage(
  imageData: ImageData,
  options: object | undefined = undefined
): Promise<OcrTextLine[]> {
  const canvas = imageDataToCanvas(imageData)
  const rec = await schedulers.borrow(
    'eng',
    async (scheduler) =>
      (await (
        await scheduler
      ).addJob('recognize', canvas, options)) as RecognizeResult
  )
  return rec.data.lines
    .map((line) => {
      const contentWords = contentWordsForLine(line)
      const { x, y, width, height } = lineBoxFromWords(line)
      return {
        text: line.text.trim(),
        x,
        y,
        width,
        height,
        words: contentWords.map(wordToBox).filter((w) => w.text.length > 0),
      }
    })
    .filter((line) => line.text.length > 0)
}
