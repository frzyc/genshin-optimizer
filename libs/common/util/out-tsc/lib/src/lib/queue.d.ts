export declare class MaxPrio<V> {
    list: (PrioNode<V> | undefined)[];
    maxNode: PrioNode<V> | undefined;
    insert(key: number, value: V): void;
    pop(): V | undefined;
    private addNode;
    private popNode;
}
interface PrioNode<V> {
    key: number;
    value: V;
    children: PrioNode<V>[];
}
export declare class FIFO<T> {
    head: T[];
    tail: T[];
    get length(): number;
    push(t: T): void;
    pop(): T | undefined;
}
export {};
//# sourceMappingURL=queue.d.ts.map