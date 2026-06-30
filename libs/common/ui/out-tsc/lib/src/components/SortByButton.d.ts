import type { ButtonGroupProps } from '@mui/material';
export declare function SortByButton<Key extends string>({ sortKeys, value, onChange, ascending, onChangeAsc, ...props }: Omit<ButtonGroupProps, 'onChange'> & {
    sortKeys: Key[];
    value: Key;
    onChange: (value: Key) => void;
    ascending: boolean;
    onChangeAsc: (value: boolean) => void;
}): import("@emotion/react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SortByButton.d.ts.map