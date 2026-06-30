import type { Palette, PaletteColor } from '@mui/material';
import type { HTMLAttributes } from 'react';
interface ColorTextProps extends HTMLAttributes<HTMLSpanElement> {
    color?: keyof Palette | string;
    variant?: keyof PaletteColor;
}
export declare const ColorText: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme> & ColorTextProps, import("react").DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, {}>;
export {};
//# sourceMappingURL=ColorText.d.ts.map