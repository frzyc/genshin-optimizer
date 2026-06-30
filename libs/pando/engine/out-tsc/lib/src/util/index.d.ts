import type { Tag } from '../tag';
import { type CustomInfo } from './custom';
export * from './arrayMap';
export * from './custom';
type DebugMode = boolean;
export declare function setDebugMode(mode: DebugMode): void;
export declare function isDebug(_: 'calc' | 'tag_db'): boolean;
export declare function assertUnreachable(value: never): never;
export declare const tagString: (record: Tag) => string;
export declare const extract: <V, K extends keyof V>(arr: V[], key: K) => V[K][];
export declare function addCustomOperation(name: string, info: CustomInfo): void;
//# sourceMappingURL=index.d.ts.map