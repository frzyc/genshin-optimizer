import type { ButtonGroupProps } from '@mui/material';
import type { ReactNode } from 'react';
type StatInputInput = ButtonGroupProps & {
    name: ReactNode;
    children?: ReactNode;
    value: number;
    placeholder?: string;
    defaultValue?: number;
    onValueChange: (newValue: number | undefined) => void;
    percent?: boolean;
    disabled?: boolean;
    onReset?: () => void;
};
export declare function StatInput({ name, children, value, placeholder, defaultValue, onValueChange, percent, disabled, onReset, ...restProps }: StatInputInput): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=StatInput.d.ts.map