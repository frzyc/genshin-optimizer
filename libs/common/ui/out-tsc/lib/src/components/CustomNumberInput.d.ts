import type { ButtonProps, InputProps } from '@mui/material';
export type CustomNumberInputProps = Omit<InputProps, 'onChange'> & {
    value?: number | undefined;
    onChange: (newValue: number | undefined) => void;
    disabled?: boolean;
    float?: boolean;
    allowEmpty?: boolean;
    disableNegative?: boolean;
};
export declare const StyledInputBase: import("@emotion/styled").StyledComponent<import("@mui/material").InputBaseProps & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, {}, {}>;
export declare function CustomNumberInputButtonGroupWrapper({ children, disableRipple, disableFocusRipple, disableTouchRipple, ...props }: ButtonProps): import("@emotion/react/jsx-runtime").JSX.Element;
export declare function CustomNumberInput({ value, onChange, disabled, float, ...props }: CustomNumberInputProps): import("@emotion/react/jsx-runtime").JSX.Element;
//# sourceMappingURL=CustomNumberInput.d.ts.map