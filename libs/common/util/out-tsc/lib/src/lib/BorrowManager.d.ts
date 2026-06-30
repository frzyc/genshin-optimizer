export declare class BorrowManager<T> {
    data: Record<string, {
        value: T;
        refCount: number;
    }>;
    init: (key: string) => T;
    deinit: (key: string, value: T) => void;
    constructor(init: (key: string) => T, deinit: (key: string, value: T) => void);
    /**
     * Borrow the object corresponding to `key`, creating the object as necessary.
     * The borrowing ends when `callback`'s promise is fulfilled.
     * When the last borrowing ends, `deinit` the object.
     *
     * Do not use `arg` after the `callback`'s promise is fulfilled.
     */
    borrow<R>(key: string, callback: (arg: T) => Promise<R>): Promise<R>;
}
//# sourceMappingURL=BorrowManager.d.ts.map