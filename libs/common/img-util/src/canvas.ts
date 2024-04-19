import type { Color } from './color'

export function drawline(
  canvas: HTMLCanvasElement,
  a: number,
  color: Color,
  xaxis = true
) {
  const width = canvas.width
  const height = canvas.height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${
    color.a ? color.a / 255 : 1
  })`
  xaxis ? ctx.fillRect(a, 0, 1, height) : ctx.fillRect(0, a, width, 1)

  return canvas
}

export function drawHistogram(
  canvas: HTMLCanvasElement,
  histogram: number[],
  color: Color,
  xaxis = true
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${
    color.a ? color.a / 255 : 1
  })`
  histogram.forEach((val, i) =>
    xaxis ? ctx.fillRect(i, 0, 1, val) : ctx.fillRect(0, i, val, 1)
  )
  return canvas
}
