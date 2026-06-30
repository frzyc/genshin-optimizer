import type { AutocompleteProps, ChipProps, Palette, TextFieldProps } from '@mui/material';
import type { ReactNode } from 'react';
/**
 * NOTE: the rationale behind toImg/toExlabel/toExItemLabel, is because `options` needs to be serializable, and having JSX in there will disrupt seralizability.
 */
export type GeneralAutocompleteOption<T extends string> = {
    key: T;
    label: string;
    grouper?: string | number;
    color?: keyof Palette;
    favorite?: boolean;
    alternateNames?: string[];
};
type GeneralAutocompletePropsBase<T extends string> = {
    label?: string;
    toImg: (v: T) => JSX.Element | undefined;
    toExItemLabel?: (v: T) => ReactNode;
    toExLabel?: (v: T) => ReactNode;
    chipProps?: Partial<ChipProps>;
    textFieldProps?: Partial<TextFieldProps>;
};
export type GeneralAutocompleteProps<T extends string> = GeneralAutocompletePropsBase<T> & {
    valueKey: T | null;
    onChange: (v: T | null) => void;
} & Omit<AutocompleteProps<GeneralAutocompleteOption<T>, false, boolean, false>, 'renderInput' | 'isOptionEqualToValue' | 'renderOption' | 'onChange' | 'value'>;
export declare function GeneralAutocomplete<T extends string>({ options, valueKey, label, onChange, toImg, toExItemLabel, toExLabel, textFieldProps, ...acProps }: GeneralAutocompleteProps<T>): import("@emotion/react/jsx-runtime").JSX.Element;
export type GeneralAutocompleteMultiProps<T extends string> = GeneralAutocompletePropsBase<T> & {
    valueKeys: T[];
    onChange: (v: T[]) => void;
} & Omit<AutocompleteProps<GeneralAutocompleteOption<T>, true, true, false>, 'renderInput' | 'isOptionEqualToValue' | 'renderOption' | 'onChange' | 'value'>;
export declare function GeneralAutocompleteMulti<T extends string>({ options, valueKeys: keys, label, onChange, toImg, toExItemLabel, toExLabel, chipProps, ...acProps }: GeneralAutocompleteMultiProps<T>): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=GeneralAutocomplete.d.ts.map