import type { TextFieldProps } from '@mui/material';
/**
 * A textfield that only triggers `onChange` when it is blurred (unfocused) or if not multi-line, the enter key.
 */
export declare function TextFieldLazy<T extends string | undefined | null>({ value: valueProp, onChange, ...props }: {
    value: T;
    onChange: (value: T) => void;
} & Omit<TextFieldProps, 'value' | 'onChange' | 'onBlur' | 'onKeyDown'>): import("@emotion/react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TextFieldLazy.d.ts.map