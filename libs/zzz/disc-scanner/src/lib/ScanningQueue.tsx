import type { OcrTextLine, Outstanding, Processed } from './processImg'
import { processEntry } from './processImg'

export type { OcrBox, OcrTextLine, OcrWordBox, Processed } from './processImg'

export type ScanningData = {
  processedNum: number
  outstandingNum: number
  scanningNum: number
}
const maxProcessingCount = 3,
  maxProcessedCount = 16

type linesFromImageFunc = (
  imageData: ImageData,
  options?: object | undefined
) => Promise<OcrTextLine[]>

export class ScanningQueue {
  private debug: boolean
  private linesFromImage: linesFromImageFunc
  constructor(linesFromImage: linesFromImageFunc, debug = false) {
    this.linesFromImage = linesFromImage
    this.debug = debug
  }
  private processed = [] as Processed[]
  private outstanding = [] as Outstanding[]
  private scanning = [] as Promise<Processed>[]
  callback = (() => {}) as (data: ScanningData) => void

  addFiles(files: Outstanding[]) {
    this.outstanding.push(...files)
    this.processQueue()
  }
  processQueue() {
    const numProcessing = Math.min(
      maxProcessedCount - this.processed.length - this.scanning.length,
      maxProcessingCount - this.scanning.length,
      this.outstanding.length
    )
    numProcessing &&
      this.outstanding.splice(0, numProcessing).map((p) => {
        const prom = processEntry(p, this.linesFromImage, this.debug)
        this.scanning.push(prom)
        prom.then((procesResult) => {
          const index = this.scanning.indexOf(prom)
          if (index === -1) return // probably because the queue has been cleared.
          this.scanning.splice(index, 1)
          this.processed.push(procesResult)
          this.processQueue()
        })
      })
    this.callCB()
  }
  private callCB() {
    this.callback({
      processedNum: this.processed.length,
      outstandingNum: this.outstanding.length,
      scanningNum: this.scanning.length,
    })
  }
  shiftProcessed(): Processed | undefined {
    const procesesd = this.processed.shift()
    if (procesesd) this.processQueue()
    return procesesd
  }
  clearQueue() {
    this.processed = []
    this.outstanding = []
    this.scanning = []
    this.callCB()
  }
}
