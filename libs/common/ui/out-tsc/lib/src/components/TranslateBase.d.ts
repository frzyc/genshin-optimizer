import type { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import type { ReactNode } from 'react';
/**
 * Note: Trans.values & Trans.components wont work together...
 */
export declare function TranslateBase({ ns, key18, values, children, components, }: {
    ns: string;
    key18: string;
    values?: Record<string, string | number>;
    children?: ReactNode;
    components?: Record<string, EmotionJSX.Element>;
}): import("@emotion/react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TranslateBase.d.ts.map