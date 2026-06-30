import type { TextFieldProps } from '@mui/material';
/**
 * A textfield for numeric inputs that only triggers `onChange` when it is blurred (unfocused) or if not multi-line, the enter key.
 * Allows parsing of numbers as both intergers and float, respects `inputProps.min` and `inputProps.max`.
 */
export declare function NumberInputLazy({ value: valueProp, onChange, float, ...props }: {
    value: number;
    float?: boolean;
    onChange: (value: number) => void;
} & Omit<TextFieldProps, 'value' | 'onChange' | 'onBlur' | 'onKeyDown'>): import("@emotion/react/jsx-runtime").JSX.Element;
//# sourceMappingURL=NumberInputLazy.d.ts.map