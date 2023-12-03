import { imageDataToCanvas } from '@genshin-optimizer/img-util'
import { BorrowManager } from '@genshin-optimizer/util'
import type { RecognizeResult, Scheduler } from 'tesseract.js'
import { createScheduler, createWorker } from 'tesseract.js'

const workerCount = 2

const schedulers = new BorrowManager(
  async (language): Promise<Scheduler> => {
    const scheduler = createScheduler()
    const promises = Array(workerCount)
      .fill(0)
      .map(async (_) => {
        const worker = await createWorker(language, undefined, {
          errorHandler: console.error,
          langPath: '../',
        })

        await worker.load()
        scheduler.addWorker(worker)
      })

    await Promise.any(promises)
    return scheduler
  },
  (_language, value) => {
    value.then((value) => value.terminate())
  }
)

export async function textsFromImage(
  imageData: ImageData,
  options: object | undefined = undefined
): Promise<string[]> {
  const canvas = imageDataToCanvas(imageData)
  const rec = await schedulers.borrow(
    'genshin_fast_09_04_21',
    async (scheduler) =>
      (await (
        await scheduler
      ).addJob('recognize', canvas, options)) as RecognizeResult
  )
  return rec.data.lines.map((line) => line.text)
}
