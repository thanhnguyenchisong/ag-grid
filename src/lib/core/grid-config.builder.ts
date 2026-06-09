import type { ColDef, GridOptions } from 'ag-grid-community';
import type {
  AgGridConfig,
  DeepPartial,
  GridContext,
  RowData,
} from '../models/ag-grid.types';

export class GridConfigBuilder<
  TData extends RowData = RowData,
  TContext extends GridContext = GridContext,
> {
  private options: GridOptions<TData> = {};
  private columnDefs: ColDef<TData>[] = [];
  private rowData: TData[] | undefined;
  private context: TContext | undefined;
  private hooks: AgGridConfig<TData, TContext>['hooks'];
  private id?: string;
  private paginationPageSize?: number;
  private rowSelection?: GridOptions<TData>['rowSelection'];
  private serverSideCacheBlockSize?: number;

  static fromConfig<T extends RowData, C extends GridContext>(
    config: AgGridConfig<T, C>,
  ): GridConfigBuilder<T, C> {
    const builder = new GridConfigBuilder<T, C>();
    builder.id = config.id;
    builder.serverSideCacheBlockSize = config.serverSideCacheBlockSize;
    if (config.columnDefs) builder.columnDefs = [...config.columnDefs];
    if (config.rowData) builder.rowData = config.rowData;
    if (config.context) builder.context = config.context;
    if (config.hooks) builder.hooks = config.hooks;
    if (config.gridOptions) builder.options = { ...config.gridOptions };
    if (config.paginationPageSize != null) {
      builder.paginationPageSize = config.paginationPageSize;
      builder.withPagination(config.paginationPageSize);
    }
    if (config.rowSelection != null) {
      builder.rowSelection = config.rowSelection;
      builder.withRowSelection(config.rowSelection);
    }
    return builder;
  }

  withGridOptions(partial: DeepPartial<GridOptions<TData>>): this {
    this.options = deepMerge(this.options, partial as GridOptions<TData>);
    return this;
  }

  withColumnDefs(cols: ColDef<TData>[]): this {
    this.columnDefs = cols;
    return this;
  }

  withRowData(data: TData[]): this {
    this.rowData = data;
    return this;
  }

  withContext(context: TContext): this {
    this.context = context;
    return this;
  }

  withPagination(pageSize = 20): this {
    this.options.pagination = true;
    this.options.paginationPageSize = pageSize;
    this.options.paginationPageSizeSelector = [10, 20, 50, 100];
    return this;
  }

  withRowSelection(mode: GridOptions<TData>['rowSelection']): this {
    this.options.rowSelection = mode;
    return this;
  }

  withDefaultColDef(def: ColDef<TData>): this {
    this.options.defaultColDef = { ...this.options.defaultColDef, ...def };
    return this;
  }

  toConfig(id?: string): AgGridConfig<TData, TContext> {
    return {
      id: id ?? this.id,
      gridOptions: this.options,
      columnDefs: this.columnDefs.length ? this.columnDefs : undefined,
      rowData: this.rowData,
      context: this.context,
      paginationPageSize: this.paginationPageSize,
      rowSelection: this.rowSelection,
      serverSideCacheBlockSize: this.serverSideCacheBlockSize,
      hooks: this.hooks,
    };
  }
}

function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as (keyof T)[]) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (
      srcVal &&
      typeof srcVal === 'object' &&
      !Array.isArray(srcVal) &&
      tgtVal &&
      typeof tgtVal === 'object' &&
      !Array.isArray(tgtVal)
    ) {
      result[key] = deepMerge(tgtVal as object, srcVal as object) as T[keyof T];
    } else if (srcVal !== undefined) {
      result[key] = srcVal as T[keyof T];
    }
  }
  return result;
}
