import * as ort from 'onnxruntime-web'
import {
  bandPass,
  crop,
  darkerColor,
  drawHistogram,
  drawline,
  fileToURL,
  findHistogramRange,
  histogramAnalysis,
  histogramContAnalysis,
  imageDataToCanvas,
  lighterColor,
  urlToImageData,
  resize,
} from '@genshin-optimizer/img-util'

export async function computeCropBoxes(
  imageDataRaw: ImageData,
  debugImgs?: Record<string, string>
) {
  const imageData = resize(imageDataRaw, { width: 200, height: 200 })
  console.log(imageData)
  const { width, height } = imageData
  const channel = imageData.data.length / (width * height) // 4
  function pixVal(chi: number, hj: number, wk: number) {
    // torch order
    const _i = 1
    const _j = channel * width
    const _k = channel
    return imageData.data[_i * chi + _j * hj + _k * wk]
  }

  const imageBuffer = new Float32Array(200 * 200 * 3)
  imageBuffer.fill(0)
  const normalization = [
    { mu: 0.485, std: 0.229 },
    { mu: 0.456, std: 0.224 },
    { mu: 0.406, std: 0.225 },
  ]
  for (let i = 0; i < 3; i++) {
    const { mu, std } = normalization[i]
    for (let j = 0; j < 200; j++) {
      for (let k = 0; k < 200; k++) {
        // TODO: figure out bilinear interpolation
        const v = pixVal(i, j, k) / 255.0
        imageBuffer[i * 200 * 200 + j * 200 + k] = (v - mu) / std
      }
    }
  }

  console.log('000', pixVal(0, 0, 0))
  console.log('005', pixVal(0, 0, 5))
  console.log('050', pixVal(0, 5, 0))
  console.log('200', pixVal(2, 0, 0))

  // const model = await tf.loadLayersModel('https://raw.githubusercontent.com/tooflesswulf/genshin-scanner/main/tfjs/model.json');
  console.log('image loaded!', { height, width, channel })
  // console.log('predzeros', model.predict(tf.zeros([1, 200, 200, 3])))

  // const session = await ort.InferenceSession.create('https://github.com/tooflesswulf/genshin-scanner/raw/main/onnx/simplenet.onnx')
  const session = await ort.InferenceSession.create('./assets/simplenet.onnx', {
    executionProviders: ['webgl'],
  })

  const feeds = {
    input1: new ort.Tensor('float32', imageBuffer, [1, 3, 200, 200]),
  }
  const results = await session.run(feeds)
  const r1 = results['output1'] as ort.TypedTensor<'float32'>
  console.log('onnx results', results)

  if (debugImgs) {
    const canvas = imageDataToCanvas(imageData)

    drawline(canvas, r1.data[0] * width, { r: 0, g: 0, b: 0, a: 255 })
    drawline(canvas, r1.data[1] * height, { r: 0, g: 0, b: 0, a: 255 }, false)
    drawline(canvas, r1.data[2] * width, { r: 0, g: 0, b: 0, a: 255 })
    drawline(canvas, r1.data[3] * height, { r: 0, g: 0, b: 0, a: 255 }, false)

    debugImgs['Cropboxes'] = canvas.toDataURL()
    debugImgs['OrigImg'] = imageDataToCanvas(imageDataRaw).toDataURL()
  }

  return [0, 0, 1, 1]
}
