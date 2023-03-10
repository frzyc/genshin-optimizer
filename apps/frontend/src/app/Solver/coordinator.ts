export class WorkerCoordinator<
  Command extends { command: string; resultType?: never },
  Response extends { command?: never; resultType: string }
> {
  prio: Map<Command['command'], number>
  commands: FIFO<Command>[]
  workers: Promise<Worker>[]
  workDone: Map<Worker, () => void> = new Map()
  _workers: Worker[]

  cancel: (e?: Error) => void
  cancelled: Promise<never>
  callback: (_: Response, w: Worker) => void
  notifyNonEmpty: (() => void) | undefined

  constructor(
    workers: Worker[],
    prio: Command['command'][],
    callback: (_: Response, w: Worker) => void
  ) {
    this.commands = prio.map((_) => new FIFO())
    this.prio = new Map(prio.map((p, i) => [p, i]))
    this.callback = callback

    workers.forEach((worker) => {
      worker.onmessage = (x) => this.onMessage(x.data, worker)
      worker.onerror = (e) => this.onError(e)
    })
    this._workers = workers
    this.workers = workers.map((w) => Promise.resolve(w))
    this.cancel = () => {}
    this.cancelled = new Promise<never>((_, rej) => (this.cancel = rej))
    this.cancelled.catch((_) => workers.forEach((w) => w.terminate()))
  }

  /**
   * Send `commands` to available workers. If a worker sends back a `Command`,
   * that command is further sent to an available worker (may be the same worker).
   * If a worker sends back a `Response`, `this.callback` is invoked.
   *
   * Note that `{ resultType: 'done' }` is a special type that the worker is
   * expected to send back when completing its `command`.
   */
  async execute(commands: Iterable<Command> | AsyncIterable<Command>) {
    const processingInput = (async () => {
      for await (const command of commands) this.add(command)
    })()

    while (true) {
      const command = this.commands.find((x) => x.length)?.dequeue()
      if (command === undefined) {
        const hasCommand = await Promise.race([
          new Promise<boolean>(
            (res) => (this.notifyNonEmpty = () => res(true))
          ),
          Promise.all([...this.workers, processingInput]).then((_) => false),
          this.cancelled,
        ])

        this.notifyNonEmpty = undefined
        if (hasCommand) continue
        break
      }

      const { i, w } = await Promise.race([
        ...this.workers.map((w, i) => w.then((w) => ({ i, w }))),
        this.cancelled,
      ])
      this.workers[i] = new Promise((res) => this.workDone.set(w, () => res(w)))
      w.postMessage(command)
    }
  }

  onError(e: { message: string }) {
    this.cancel(new Error(`Worker Error: ${e.message}`))
  }
  onMessage(msg: Command | Response, worker: Worker) {
    if (msg.command !== undefined) this.add(msg)
    else if (msg.resultType === 'done') this.workDone.get(worker)!()
    else this.callback(msg, worker)
  }
  /** May be ignored after `execute` ends */
  add(command: Command) {
    const prio = this.prio.get(command.command)!
    this.commands[prio].enqueue(command)
    this.notifyNonEmpty?.()
  }
  /** May be ignored after `execute` ends */
  broadcast(command: Command) {
    this._workers.forEach((w) => w.postMessage(command))
  }
  /** MUST be followed by `execute` and cannot be called while `execute` is running */
  notifiedBroadcast(command: Command) {
    this.workers = this.workers.map((worker) =>
      worker.then(
        (w) =>
          new Promise((res) => {
            this.workDone.set(w, () => res(w))
          })
      )
    )
    this._workers.forEach((w) => w.postMessage(command))
  }
}

// Simple two-stack FIFO implementation
class FIFO<T> {
  head: T[] = []
  tail: T[] = []

  get length(): number {
    return this.head.length + this.tail.length
  }
  enqueue(t: T): void {
    this.tail.push(t)
  }
  dequeue(): T | undefined {
    if (!this.head.length && this.tail.length)
      [this.head, this.tail] = [this.tail.reverse(), this.head]
    return this.head.pop()
  }
}
