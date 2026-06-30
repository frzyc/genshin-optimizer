import type { CardProps } from '@mui/material';
export type CardBackgroundColor = 'light' | 'dark' | 'normal';
interface StyledCardProps extends CardProps {
    bgt?: CardBackgroundColor | string;
}
/**
 * A colored Card that is by default `contentNormal` colored.
 *
 * Use bgt=["light", "dark"] to use [`contentLight`, `contentDark`]
 */
export declare const CardThemed: import("@emotion/styled").StyledComponent<import("@mui/material").CardOwnProps & import("@mui/material/OverridableComponent").CommonProps & Omit<Omit<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & {
    ref?: ((instance: HTMLDivElement | null) => void | import("react").DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof import("react").DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES]) | import("react").RefObject<HTMLDivElement> | null | undefined;
}, "className" | "classes" | "style" | "children" | "sx" | "elevation" | "variant" | "square" | "raised"> & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme> & StyledCardProps, {}, {}>;
export {};
//# sourceMappingURL=CardThemed.d.ts.map