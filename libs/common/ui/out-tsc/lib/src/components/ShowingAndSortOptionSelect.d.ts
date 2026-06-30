import type { TFunction } from 'i18next';
type ShowingItemProps = {
    numShowing: number;
    total: string;
    t: TFunction<[string, string], undefined>;
    namespace: string;
};
type SortByButtonProps<T extends string> = {
    sortKeys: T[];
    value: T;
    onChange: (value: T) => void;
    ascending: boolean;
    onChangeAsc: (value: boolean) => void;
};
export declare function ShowingAndSortOptionSelect<T extends string>({ showingTextProps, sortByButtonProps, }: {
    showingTextProps: ShowingItemProps;
    sortByButtonProps?: SortByButtonProps<T>;
}): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ShowingAndSortOptionSelect.d.ts.map