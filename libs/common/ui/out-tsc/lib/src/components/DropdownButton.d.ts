import type { ButtonProps } from '@mui/material';
export type DropdownButtonProps = Omit<ButtonProps, 'title'> & {
    title: React.ReactNode;
    id?: string;
    children: React.ReactNode;
};
export declare function DropdownButton({ title, children, id, ...props }: DropdownButtonProps): import("@emotion/react/jsx-runtime").JSX.Element;
//# sourceMappingURL=DropdownButton.d.ts.map