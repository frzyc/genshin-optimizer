import type { Palette } from '@mui/material';
import type { HTMLAttributes } from 'react';
interface ColorTextProps extends HTMLAttributes<HTMLSpanElement> {
    color?: keyof Palette;
}
export declare const SqBadge: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme> & ColorTextProps, Pick<import("react").DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, keyof import("react").ClassAttributes<HTMLSpanElement> | keyof HTMLAttributes<HTMLSpanElement>>, {}>;
export {};
//# sourceMappingURL=SqBadge.d.ts.map