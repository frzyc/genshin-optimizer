import type { Palette, ToggleButtonProps } from '@mui/material';
type SolidColoredToggleButtonPartial = {
    baseColor?: keyof Palette;
    selectedColor?: keyof Palette;
};
export type SolidColoredToggleButtonProps = SolidColoredToggleButtonPartial & ToggleButtonProps;
export declare const SolidColoredToggleButton: import("@emotion/styled").StyledComponent<import("@mui/material").ToggleButtonOwnProps & Omit<import("@mui/material").ButtonBaseOwnProps, "classes"> & import("@mui/material/OverridableComponent").CommonProps & Omit<Omit<import("react").DetailedHTMLProps<import("react").ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "ref"> & {
    ref?: ((instance: HTMLButtonElement | null) => void | import("react").DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof import("react").DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES]) | import("react").RefObject<HTMLButtonElement> | null | undefined;
}, "className" | "classes" | "style" | "tabIndex" | "color" | "children" | "onChange" | "onClick" | "sx" | "action" | "disabled" | "value" | "size" | "selected" | "centerRipple" | "disableRipple" | "disableTouchRipple" | "focusRipple" | "focusVisibleClassName" | "LinkComponent" | "onFocusVisible" | "TouchRippleProps" | "touchRippleRef" | "disableFocusRipple" | "fullWidth"> & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme> & SolidColoredToggleButtonPartial, {}, {}>;
export {};
//# sourceMappingURL=SolidColoredToggleButton.d.ts.map