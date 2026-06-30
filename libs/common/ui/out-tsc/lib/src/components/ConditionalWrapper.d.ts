import type { ReactNode } from 'react';
type Prop = {
    condition: boolean;
    wrapper: (children: ReactNode) => ReactNode;
    falseWrapper?: (children: ReactNode) => ReactNode;
    children: ReactNode;
};
export declare function ConditionalWrapper({ condition, wrapper, falseWrapper, children, }: Prop): JSX.Element;
export {};
//# sourceMappingURL=ConditionalWrapper.d.ts.map