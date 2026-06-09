import { inject } from '@angular/core';
import type {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  IDatasource,
  IServerSideDatasource,
  RefreshServerSideParams,
} from 'ag-grid-community';
import { ColumnDefinitionFactory } from './column-definition.factory';
import { GridConfigBuilder } from './grid-config.builder';
import type { GridPlugin } from './grid-plugin';
import { PluginRegistry } from './grid-plugin';
import type {
  AgGridConfig,
  AgGridTableHost,
  GridContext,
  RowData,
} from '../models/ag-grid.types';
import { AG_GRID_DEFAULTS } from '../tokens/ag-grid-defaults.token';

/**
 * Common AG Grid class for Angular 20 — extend once per feature/table.
 *
 * - App-wide defaults via `provideAgGridDefaults()` in `app.config.ts`
 * - Per-grid config in the subclass constructor
 * - Override `buildColumnDefs()`, `getDefaultGridOptions()`, `onGridReady()` to customize
 * - Use {@link ColumnDefinitionFactory} via `this.columns`
 * - Register cross-cutting behavior with `this.use(plugin)`
 *
 * @example
 * ```ts
 * @Injectable()
 * export class OrdersGridService extends AgGridBase<OrderRow> {
 *   constructor(private readonly ordersApi: OrdersApi) {
 *     super({ id: 'orders-grid' });
 *   }
 *
 *   protected override buildColumnDefs(): ColDef<OrderRow>[] {
 *     return [
 *       this.columns.text({ field: 'orderNo' }),
 *       this.columns.date({ field: 'createdAt' }),
 *       this.columns.number({ field: 'total' }),
 *     ];
 *   }
 *
 *   protected override onGridReady(): void {
 *     this.loadOrders();
 *   }
 *
 *   loadOrders(): void {
 *     this.ordersApi.getAll().subscribe((rows) => this.setRowData(rows));
 *   }
 * }
 * ```
 */
export abstract class AgGridBase<
  TData extends RowData = RowData,
  TContext extends GridContext = GridContext,
> implements AgGridTableHost {
  readonly id: string;
  readonly columns: ColumnDefinitionFactory<TData>;

  protected readonly config: AgGridConfig<TData, TContext>;
  protected readonly plugins = new PluginRegistry<TData, TContext>();
  protected gridApi: GridApi<TData> | null = null;

  private readonly appDefaults = inject(AG_GRID_DEFAULTS, { optional: true });
  private destroyed = false;

  constructor(config: AgGridConfig<TData, TContext> = {}) {
    this.id = config.id ?? `grid-${Math.random().toString(36).slice(2, 9)}`;
    this.config = config;
    this.columns = new ColumnDefinitionFactory<TData>();
  }

  /** Theme CSS class from app defaults (e.g. `ag-theme-quartz`). */
  get themeClass(): string {
    return this.appDefaults?.themeClass ?? 'ag-theme-quartz';
  }

  /** Default height from app config. */
  get defaultHeight(): string {
    return this.appDefaults?.defaultHeight ?? '100%';
  }

  use(plugin: GridPlugin<TData, TContext>): this {
    this.plugins.register(plugin);
    return this;
  }

  /** Bind to `[gridOptions]` on `ag-grid-angular` or {@link AgGridTableComponent}. */
  getGridOptions(): GridOptions<TData> {
    const merged = this.mergeLayers();
    const withReady = this.wrapGridReady(merged);
    return this.plugins.applyAll(withReady);
  }

  /** Satisfies {@link AgGridTableHost} for the shared table component. */
  getTableGridOptions(): GridOptions {
    return this.getGridOptions() as GridOptions;
  }

  handleGridReady(event: GridReadyEvent<TData, TContext>): void {
    if (this.destroyed) return;

    this.gridApi = event.api;
    this.config.hooks?.beforeGridReady?.(event);
    this.onGridReady(event.api, event.context);
    this.plugins.notifyGridReady(event.api, event.context);
    this.config.hooks?.afterGridReady?.(event.api, event.context);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.plugins.notifyDestroy();
    this.config.hooks?.onDestroy?.();
    this.onDestroy();
    this.gridApi = null;
  }

  getApi(): GridApi<TData> | null {
    return this.gridApi;
  }

  requireApi(): GridApi<TData> {
    if (!this.gridApi) {
      throw new Error(`[${this.id}] Grid API not ready — wait for gridReady.`);
    }
    return this.gridApi;
  }

  setRowData(rowData: TData[]): void {
    this.requireApi().setGridOption('rowData', rowData);
    this.config.hooks?.onRowDataChanged?.(rowData);
  }

  updateRowData(rowData: TData[]): void {
    this.setRowData(rowData);
  }

  refreshCells(force = false): void {
    this.requireApi().refreshCells({ force });
  }

  getSelectedRows(): TData[] {
    return this.requireApi().getSelectedRows();
  }

  selectAll(): void {
    this.requireApi().selectAll();
  }

  deselectAll(): void {
    this.requireApi().deselectAll();
  }

  exportCsv(fileName?: string): void {
    this.requireApi().exportDataAsCsv(
      fileName ? { fileName } : undefined,
    );
  }

  sizeColumnsToFit(): void {
    this.requireApi().sizeColumnsToFit();
  }

  showLoading(): void {
    this.requireApi().setGridOption('loading', true);
  }

  hideLoading(): void {
    this.requireApi().setGridOption('loading', false);
  }

  /** Gắn hoặc thay datasource sau khi grid ready (server-side row model). */
  setServerSideDatasource(datasource: IServerSideDatasource<TData>): void {
    this.requireApi().setGridOption('serverSideDatasource', datasource);
  }

  /** Tải lại dữ liệu server-side (sau filter/sort hoặc refresh thủ công). */
  refreshServerSide(params?: RefreshServerSideParams): void {
    this.requireApi().refreshServerSide(params);
  }

  /** Purge và tải lại infinite row model (AG Grid Community). */
  refreshInfiniteCache(): void {
    this.requireApi().purgeInfiniteCache();
  }

  /**
   * Override để bật server-side row model (AG Grid Enterprise).
   * Trả về datasource khác `null` → `rowModelType: 'serverSide'` được merge tự động.
   */
  protected createServerSideDatasource(): IServerSideDatasource<TData> | null {
    return null;
  }

  /**
   * Override để bật infinite row model (AG Grid Community — lazy-load từ server).
   * Trả về datasource khác `null` → `rowModelType: 'infinite'` được merge tự động.
   */
  protected createInfiniteDatasource(): IDatasource | null {
    return null;
  }

  protected createBuilder(): GridConfigBuilder<TData, TContext> {
    return GridConfigBuilder.fromConfig(this.config);
  }

  /**
   * Define columns for this grid. Override in each feature service.
   */
  protected buildColumnDefs(): ColDef<TData>[] {
    return this.config.columnDefs ?? [];
  }

  /** Grid defaults for this feature — merged under app defaults. */
  protected getDefaultGridOptions(): GridOptions<TData> {
    return {
      animateRows: true,
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
        minWidth: 100,
      },
      rowSelection: {
        mode: 'multiRow',
        checkboxes: true,
        headerCheckbox: true,
      },
      onFirstDataRendered: (params) => params.api.sizeColumnsToFit(),
    };
  }

  protected onGridReady(
    _api: GridApi<TData>,
    _context: TContext | undefined,
  ): void {}

  protected onDestroy(): void {}

  private mergeLayers(): GridOptions<TData> {
    const appOpts = (this.appDefaults?.gridOptions ?? {}) as GridOptions<TData>;
    const base = this.getDefaultGridOptions();
    const cols = this.buildColumnDefs();

    const opts: GridOptions<TData> = {
      ...appOpts,
      ...base,
      ...this.config.gridOptions,
      columnDefs: cols.length ? cols : this.config.columnDefs,
    };

    if (this.config.rowData) opts.rowData = this.config.rowData;
    if (this.config.context) opts.context = this.config.context;
    if (this.config.paginationPageSize != null) {
      opts.pagination = true;
      opts.paginationPageSize = this.config.paginationPageSize;
    }
    if (this.config.rowSelection != null) {
      opts.rowSelection = this.config.rowSelection;
    }

    this.applyRemoteRowModelOptions(opts);

    return opts;
  }

  /**
   * SSRM (Enterprise) wins over Infinite (Community) when both are overridden.
   */
  private applyRemoteRowModelOptions(opts: GridOptions<TData>): void {
    const blockSize =
      opts.cacheBlockSize ?? this.config.serverSideCacheBlockSize ?? 100;

    const ssrm = this.createServerSideDatasource();
    if (ssrm) {
      opts.rowModelType = 'serverSide';
      opts.serverSideDatasource = ssrm;
      opts.cacheBlockSize = blockSize;
      return;
    }

    const infinite = this.createInfiniteDatasource();
    if (!infinite) return;

    opts.rowModelType = 'infinite';
    opts.datasource = infinite;
    opts.cacheBlockSize = blockSize;
  }

  private wrapGridReady(options: GridOptions<TData>): GridOptions<TData> {
    const userOnReady = options.onGridReady;
    return {
      ...options,
      onGridReady: (event) => {
        userOnReady?.(event);
        this.handleGridReady(event as GridReadyEvent<TData, TContext>);
      },
    };
  }
}
