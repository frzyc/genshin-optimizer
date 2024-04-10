export * from './foreground'
export * from './optimizeTc'
const TCWorker = new URL('./optimizeTcWorker.ts', import.meta.url)

export { TCWorker }
