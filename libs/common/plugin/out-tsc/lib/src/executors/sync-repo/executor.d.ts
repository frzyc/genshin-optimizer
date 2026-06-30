import type { ExecutorContext } from '@nx/devkit';
import type { SyncRepoExecutorSchema } from './schema';
export default function runExecutor(options: SyncRepoExecutorSchema, context: ExecutorContext): Promise<{
    success: boolean;
}>;
export declare const getLocalRepoHash: (cwd: string) => string;
export declare const getRemoteRepoHash: (cwd: string) => string;
//# sourceMappingURL=executor.d.ts.map