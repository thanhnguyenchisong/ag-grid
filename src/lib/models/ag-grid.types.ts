import type {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
} from 'ag-grid-community';

// Re-export for host interface
export type { GridOptions };

/**
 * Row shape — use a dedicated interface per feature grid.
 * Include `[key: string]: unknown` on interfaces for strict compatibility.
 */
export type RowData = Record<string, unknown>;

/** Optional context on grid options (permissions, parent ids, etc.). */
export type GridContext = Record<string, unknown>;

export interface AgGridConfig<
  TData extends RowData = RowData,
  TContext extends GridContext = GridContext,
> {
  id?: string;
  gridOptions?: GridOptions<TData>;
  columnDefs?: ColDef<TData>[];
  rowData?: TData[];
  context?: TContext;
  paginationPageSize?: number;
  rowSelection?: GridOptions<TData>['rowSelection'];
  /** Block size when using server-side row model (default 100). */
  serverSideCacheBlockSize?: number;
  hooks?: AgGridLifecycleHooks<TData, TContext>;
}

export interface AgGridLifecycleHooks<
  TData extends RowData = RowData,
  TContext extends GridContext = GridContext,
> {
  beforeGridReady?: (event: GridReadyEvent<TData, TContext>) => void;
  afterGridReady?: (api: GridApi<TData>, context: TContext | undefined) => void;
  onDestroy?: () => void;
  onRowDataChanged?: (rowData: TData[]) => void;
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/** Return error message when invalid, or `null` when valid. */
export type FieldValidator<TData extends RowData = RowData> = (
  value: unknown,
  row: TData,
) => string | null;

export interface TextColumnOptions<TData extends RowData = RowData> {
  field: keyof TData & string;
  headerName?: string;
  flex?: number;
  minWidth?: number;
  sortable?: boolean;
  filter?: boolean | string;
  pinned?: ColDef<TData>['pinned'];
  /** Show yellow cell + "!" badge when validator returns a message. */
  validate?: FieldValidator<TData>;
  extra?: Partial<ColDef<TData>>;
}

/** Minimal API used by {@link AgGridTableComponent} — any feature grid satisfies this. */
export interface AgGridTableHost {
  getTableGridOptions(): GridOptions;
  destroy(): void;
  readonly themeClass:  string;
  readonly defaultHeight: string;
}

export interface ActionColumnOptions<TData extends RowData = RowData> {
  headerName?: string;
  width?: number;
  cellRenderer?: ColDef<TData>['cellRenderer'];
  cellRendererParams?: ColDef<TData>['cellRendererParams'];
  onCellClicked?: ColDef<TData>['onCellClicked'];
}
