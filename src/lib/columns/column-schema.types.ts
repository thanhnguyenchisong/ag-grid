import type { ColDef } from 'ag-grid-community';
import type { FieldValidator, RowData } from '../models/ag-grid.types';

/** Built-in column kinds — each maps to default getter/parser/setter/format in {@link ColumnSchemaBuilder}. */
export type ColumnKind =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'money'
  | 'percent'
  | 'enum'
  | 'computed';

/**
 * Declarative column config — one entry per field (~50 lines for ~50 columns).
 * Use `pipeline` for business-specific format logic registered in the grid service.
 */
export interface ColumnSchema<
  TFields,
  TPipeline extends string = string,
> {
  /** Backing row field — omit for pure computed columns (use `colId`). */
  field?: keyof TFields & string;
  /** AG Grid colId — required when `field` is omitted (computed / derived columns). */
  colId?: string;
  kind: ColumnKind;
  headerName?: string;
  flex?: number;
  minWidth?: number;
  editable?: boolean;
  pinned?: ColDef['pinned'];
  sortable?: boolean;
  filter?: boolean | string;
  validate?: FieldValidator<RowData>;
  /** Custom pipeline id — merged after kind defaults (see example). */
  pipeline?: TPipeline;
  enumValues?: readonly string[];
  extra?: Partial<ColDef>;
}

/** Partial ColDef hooks for a field kind or named pipeline. */
export interface FieldPipeline<TData extends RowData = RowData> {
  valueGetter?: ColDef<TData>['valueGetter'];
  valueSetter?: ColDef<TData>['valueSetter'];
  valueParser?: ColDef<TData>['valueParser'];
  valueFormatter?: ColDef<TData>['valueFormatter'];
  editable?: boolean;
  filter?: ColDef['filter'];
  cellRenderer?: ColDef<TData>['cellRenderer'];
  cellEditor?: ColDef<TData>['cellEditor'];
  filterParams?: ColDef<TData>['filterParams'];
}

export type FieldPipelineMap<
  TData extends RowData,
  TPipeline extends string = string,
> = Partial<Record<TPipeline, FieldPipeline<TData>>>;

/** Header group — wraps child columns under a shared parent header (AG Grid column groups). */
export interface ColumnGroupSchema<
  TFields,
  TPipeline extends string = string,
> {
  groupId: string;
  headerName: string;
  /** Keep group columns together when dragging (optional). */
  marryChildren?: boolean;
  children: readonly ColumnSchema<TFields, TPipeline>[];
}
