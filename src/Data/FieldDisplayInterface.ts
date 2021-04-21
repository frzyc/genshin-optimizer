export interface FieldDisplay {
  canShow?: (any) => any;
  text: string | JSX.Element;
  value?: number | string | JSX.Element | ((stats: any) => string | number | JSX.Element);
  fixed?: number;
  formula?: (stats: any) => Array<any>;
  formulaText?: (stats: any) => JSX.Element
  variant?: string | ((stats: any) => string);
}