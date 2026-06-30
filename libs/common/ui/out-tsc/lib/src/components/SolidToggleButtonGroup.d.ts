import type { Palette, ToggleButtonGroupProps } from '@mui/material';
export type SolidToggleButtonGroupProps = SolidToggleButtonGroupPropsPartial & ToggleButtonGroupProps;
type SolidToggleButtonGroupPropsPartial = {
    baseColor?: keyof Palette;
    selectedColor?: keyof Palette;
};
export declare const SolidToggleButtonGroup: import("@emotion/styled").StyledComponent<ToggleButtonGroupProps & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme> & SolidToggleButtonGroupPropsPartial, {}, {}>;
export {};
//# sourceMappingURL=SolidToggleButtonGroup.d.ts.map