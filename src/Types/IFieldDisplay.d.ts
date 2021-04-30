export interface IFieldDisplay {
  canShow?: (any) => any;
  text: Displayable;
  value?: number | Displayable | ((stats: any) => number | Displayable);
  fixed?: number;
  formula?: (stats: any) => Array<any>;
  formulaText?: (stats: any) => JSX.Element
  variant?: string | ((stats: any) => string);
}